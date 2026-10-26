import { neon } from '@neondatabase/serverless';
import { NAV_POD_NAME } from '@/lib/product-seo';

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

/**
 * Stock levels keyed by Stripe Price ID.
 * Throws if the database is unavailable so callers choose how to fail
 * (checkout blocks the sale; the product listing shows items as unavailable).
 */
export async function getInventoryMap(): Promise<Record<string, number>> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const rows = await withRetry(() => sql`SELECT id, stock_count FROM inventory`);
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.id] = Number(row.stock_count) || 0;
  }
  return map;
}

/**
 * Deducts sold quantities from inventory exactly once per Stripe event.
 * The event claim and every stock update run in a single SQL statement, so a
 * retried or duplicate webhook delivery can never decrement twice.
 * Stock is clamped at 0 because the payment has already been taken.
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

  const totals = new Map<string, number>();
  for (const { priceId, quantity } of lines) {
    totals.set(priceId, (totals.get(priceId) || 0) + quantity);
  }
  const ids = [...totals.keys()];
  const qtys = [...totals.values()];

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
  lines: Array<{ priceId: string; quantity: number; /** Name to engrave, if any */ personalisation?: string }>;
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
