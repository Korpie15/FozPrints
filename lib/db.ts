import { neon } from '@neondatabase/serverless';
import { NAV_POD_NAME } from '@/lib/product-seo';
import {
  MATERIAL_IDS,
  cannotFulfil,
  maxUnits,
  orderUsage,
  type MaterialStock,
  type Recipe,
} from '@/lib/materials';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  return neon(url);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 400): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

interface MaterialState {
  recipes: Map<string, Recipe>;
  stock: MaterialStock;
}

/**
 * Raw materials on hand and the recipe for each product variant that is sold from them.
 * Returns null if the materials tables do not exist yet (before schema.sql was applied),
 * so those products fall back to the per-product `inventory` counts.
 */
async function loadMaterialState(sql: NonNullable<ReturnType<typeof getDb>>): Promise<MaterialState | null> {
  let materialRows;
  let recipeRows;
  try {
    [materialRows, recipeRows] = await withRetry(() =>
      Promise.all([
        sql`SELECT id, on_hand, waste_pct FROM materials`,
        sql`SELECT price_id, filament_g, heat_inserts, print_minutes, packaging FROM part_recipes`,
      ])
    );
  } catch (err: any) {
    if (err?.code === '42P01') return null; // undefined_table
    throw err;
  }

  const onHand = (id: string) => Number(materialRows.find((r) => r.id === id)?.on_hand) || 0;
  const stock: MaterialStock = {
    filamentG: onHand(MATERIAL_IDS.filament),
    filamentWastePct: Number(materialRows.find((r) => r.id === MATERIAL_IDS.filament)?.waste_pct) || 0,
    boxes: onHand(MATERIAL_IDS.box),
    mailers: onHand(MATERIAL_IDS.mailer),
    heatInserts: onHand(MATERIAL_IDS.heatInsert),
  };

  const recipes = new Map<string, Recipe>();
  for (const row of recipeRows) {
    recipes.set(row.price_id, {
      priceId: row.price_id,
      filamentG: Number(row.filament_g) || 0,
      heatInserts: Number(row.heat_inserts) || 0,
      printMinutes: Number(row.print_minutes) || 0,
      packaging: row.packaging === 'mailer' ? 'mailer' : 'box',
    });
  }
  return { recipes, stock };
}

/**
 * How many of each variant can be sold, keyed by Stripe Price ID.
 * Variants with a recipe are worked out from the raw materials on hand (filament,
 * boxes, heat inserts); any other variant uses its count in `inventory`.
 * Throws if the database is unavailable so callers choose how to fail
 * (checkout blocks the sale; the product listing shows items as unavailable).
 */
export async function getInventoryMap(): Promise<Record<string, number>> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const [rows, materials] = await Promise.all([
    withRetry(() => sql`SELECT id, stock_count FROM inventory`),
    loadMaterialState(sql),
  ]);
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.id] = Number(row.stock_count) || 0;
  }
  if (materials) {
    for (const [priceId, recipe] of materials.recipes) {
      map[priceId] = maxUnits(recipe, materials.stock);
    }
  }
  return map;
}

/**
 * Checks a whole cart can be made, not just each line on its own: items that share
 * filament (a kit and a cubby, say) have to fit in what is left together.
 * Returns a message to show the buyer, or null if the cart is fine.
 * Throws if the database is unavailable, so callers fail closed.
 */
export async function findStockProblem(
  items: Array<{ id: string; quantity: number; title: string; variantTitle?: string }>
): Promise<string | null> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const inventoryMap = await getInventoryMap();
  for (const item of items) {
    const stock = inventoryMap[item.id] ?? 0;
    if (item.quantity > stock) {
      const itemLabel = item.variantTitle && item.variantTitle !== 'Default'
        ? `${item.title} (${item.variantTitle})`
        : item.title;
      return stock <= 0
        ? `"${itemLabel}" is out of stock.`
        : `Only ${stock} units available for "${itemLabel}". Please update your cart.`;
    }
  }

  const materials = await loadMaterialState(sql);
  if (materials) {
    const lines = items.map((item) => ({ priceId: item.id, quantity: item.quantity }));
    if (cannotFulfil(orderUsage(lines, materials.recipes, materials.stock), materials.stock)) {
      return "We can't make everything in your cart at once right now. Please reduce the quantities or remove an item.";
    }
  }
  return null;
}

/**
 * Deducts a paid order from stock exactly once per Stripe/PayPal event.
 * Variants with a recipe use up raw materials (filament, heat inserts, a box or
 * mailer); any other variant is deducted from its `inventory` count as before.
 * The event claim and every stock update run in a single SQL statement, so a
 * retried or duplicate webhook delivery can never decrement twice.
 * Counts are clamped at 0 because the payment has already been taken.
 * Returns false if this event was already processed.
 */
export async function decrementInventoryOnce(
  eventId: string,
  lines: Array<{ priceId: string; quantity: number }>
): Promise<boolean> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const materials = await loadMaterialState(sql);
  const isRecipe = (priceId: string) => Boolean(materials?.recipes.has(priceId));

  // Variants without a recipe: per-product counts
  const totals = new Map<string, number>();
  for (const { priceId, quantity } of lines.filter((l) => !isRecipe(l.priceId))) {
    totals.set(priceId, (totals.get(priceId) || 0) + quantity);
  }
  const ids = [...totals.keys()];
  const qtys = [...totals.values()];

  // Variants with a recipe: raw materials
  const usage = materials
    ? orderUsage(lines.filter((l) => isRecipe(l.priceId)), materials.recipes, materials.stock)
    : null;
  const materialIds = usage
    ? [MATERIAL_IDS.filament, MATERIAL_IDS.heatInsert, MATERIAL_IDS.box, MATERIAL_IDS.mailer]
    : [];
  const materialAmounts = usage ? [usage.filamentG, usage.heatInserts, usage.boxes, usage.mailers] : [];

  // Materials tables not created yet: only per-product counts exist
  if (!materials) {
    const legacyRows = await withRetry(() => sql`
      WITH claimed AS (
        INSERT INTO processed_stripe_events (event_id)
        VALUES (${eventId})
        ON CONFLICT DO NOTHING
        RETURNING event_id
      ),
      sold AS (
        SELECT id, qty FROM unnest(${ids}::text[], ${qtys}::int[]) AS t(id, qty)
      ),
      updated AS (
        UPDATE inventory i
        SET stock_count = GREATEST(i.stock_count - sold.qty, 0)
        FROM sold
        WHERE i.id = sold.id AND EXISTS (SELECT 1 FROM claimed)
        RETURNING i.id
      )
      SELECT (SELECT count(*) FROM claimed) AS claimed
    `);
    return Number(legacyRows[0]?.claimed) > 0;
  }

  const rows = await withRetry(() => sql`
    WITH claimed AS (
      INSERT INTO processed_stripe_events (event_id)
      VALUES (${eventId})
      ON CONFLICT DO NOTHING
      RETURNING event_id
    ),
    sold AS (
      SELECT id, qty FROM unnest(${ids}::text[], ${qtys}::int[]) AS t(id, qty)
    ),
    updated AS (
      UPDATE inventory i
      SET stock_count = GREATEST(i.stock_count - sold.qty, 0)
      FROM sold
      WHERE i.id = sold.id AND EXISTS (SELECT 1 FROM claimed)
      RETURNING i.id
    ),
    used AS (
      SELECT id, amount FROM unnest(${materialIds}::text[], ${materialAmounts}::int[]) AS t(id, amount)
    ),
    materials_updated AS (
      UPDATE materials m
      SET on_hand = GREATEST(m.on_hand - used.amount, 0)
      FROM used
      WHERE m.id = used.id AND used.amount > 0 AND EXISTS (SELECT 1 FROM claimed)
      RETURNING m.id
    )
    SELECT (SELECT count(*) FROM claimed) AS claimed
  `);

  return Number(rows[0]?.claimed) > 0;
}

/**
 * Claims a one-off task (such as sending an order email) so it runs once even
 * when Stripe or PayPal deliver the same notification more than once.
 * Returns false if it was already claimed.
 */
export async function claimOnce(key: string): Promise<boolean> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const rows = await withRetry(() => sql`
    INSERT INTO processed_stripe_events (event_id)
    VALUES (${key})
    ON CONFLICT DO NOTHING
    RETURNING event_id
  `);
  return rows.length > 0;
}

/** Undoes claimOnce after the task failed, so the next retry runs it again. */
export async function releaseClaim(key: string): Promise<void> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await withRetry(() => sql`DELETE FROM processed_stripe_events WHERE event_id = ${key}`);
}

export interface PayPalOrderRecord {
  lines: Array<{ priceId: string; quantity: number }>;
  amount: string;
  postcode: string;
  serviceCode: string;
  shippingCents: number;
  /** LAUNCH50 discount given on this order, if any */
  discountCents: number;
}

/** Records a PayPal order our server created, so capture only accepts our own orders. */
export async function savePayPalOrder(orderId: string, record: PayPalOrderRecord): Promise<void> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await withRetry(() => sql`
    INSERT INTO paypal_orders (order_id, lines, amount, postcode, service_code, shipping_cents, discount_cents)
    VALUES (
      ${orderId}, ${JSON.stringify(record.lines)}::jsonb, ${record.amount},
      ${record.postcode}, ${record.serviceCode}, ${record.shippingCents}, ${record.discountCents}
    )
  `);
}

/**
 * PayPal orders that were paid with the LAUNCH50 discount. Stripe counts its own
 * redemptions of the coupon; these are the ones Stripe never sees.
 */
export async function countPaidPayPalLaunchDiscounts(): Promise<number> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const rows = await withRetry(() => sql`
    SELECT count(*) AS used
    FROM paypal_orders p
    JOIN processed_stripe_events e ON e.event_id = 'paypal_' || p.order_id
    WHERE p.discount_cents > 0
  `);
  return Number(rows[0]?.used ?? 0);
}

/** The order as our server created it, or null if we never created it. */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrderRecord | null> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const rows = await withRetry(() => sql`
    SELECT lines, amount, postcode, service_code, shipping_cents, discount_cents
    FROM paypal_orders WHERE order_id = ${orderId}
  `);
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  return {
    lines: row.lines,
    amount: row.amount,
    postcode: row.postcode,
    serviceCode: row.service_code,
    shippingCents: Number(row.shipping_cents),
    discountCents: Number(row.discount_cents ?? 0),
  };
}

export interface InternationalInterestEntry {
  name: string;
  email: string;
  country: string;
  productInterest?: string;
  notes?: string;
}

/**
 * Adds someone to the international shipping waitlist. An email that is
 * already on the list is left unchanged, so nobody can overwrite another
 * person's details by submitting their address.
 */
export async function recordInternationalInterest(entry: InternationalInterestEntry): Promise<void> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const { name, email, country, productInterest = NAV_POD_NAME, notes = '' } = entry;
  const cleanEmail = email.trim().toLowerCase();

  await withRetry(() => sql`
    INSERT INTO international_interest (name, email, country, product_interest, notes)
    SELECT ${name.trim()}, ${cleanEmail}, ${country.trim()}, ${productInterest}, ${notes.trim()}
    WHERE NOT EXISTS (
      SELECT 1 FROM international_interest WHERE LOWER(email) = ${cleanEmail}
    )
  `);
}
