import { getDb, loadMaterialState } from '@/lib/db';
import {
  MATERIAL_IDS,
  expandLines,
  limitedBy,
  maxUnits,
  printCost,
  printedOnly,
  withoutPrinted,
} from '@/lib/materials';

/** Materials the shop deducts by itself when an order is paid. Anything else is tracked by hand. */
const AUTO_DEDUCTED: string[] = [MATERIAL_IDS.filament, MATERIAL_IDS.box, MATERIAL_IDS.mailer, MATERIAL_IDS.heatInsert];

/** Order materials appear on the page */
const DISPLAY_ORDER = [...AUTO_DEDUCTED, 'honeycomb_paper'];

/** stock_log rows about a printed part use this prefix on material_id */
const PART_LOG_PREFIX = 'part:';

export interface AdminMaterial {
  id: string;
  name: string;
  unit: string;
  onHand: number;
  onOrder: number;
  wastePct: number;
  autoDeducted: boolean;
}

/** A part that can be printed ahead of time and kept on the shelf */
export interface AdminPart {
  priceId: string;
  name: string;
  printedStock: number;
  filamentG: number;
  heatInserts: number;
  printMinutes: number;
  /** How many more could be printed from the materials on hand, ignoring what is already printed */
  canPrint: number;
}

/** Anything the shop sells from parts and materials: a part, or a kit made from parts */
export interface AdminSellable {
  priceId: string;
  name: string;
  kind: 'part' | 'kit';
  /** What a kit is made from, e.g. "Top Cover, Front Fascia, Radio Brackets" */
  madeFrom: string;
  /** Ready to ship from printed parts alone */
  printed: number;
  /** Total the shop will sell: printed plus what could be printed */
  canMake: number;
  limitedBy: string | null;
  filamentG: number;
  heatInserts: number;
  printMinutes: number;
  packaging: 'box' | 'mailer';
}

export interface AdminLogEntry {
  at: string;
  materialId: string;
  materialName: string;
  action: string;
  change: number;
  onHandAfter: number;
  note: string;
  by: string;
}

export interface AdminStock {
  materials: AdminMaterial[];
  parts: AdminPart[];
  sellable: AdminSellable[];
  log: AdminLogEntry[];
}

export type StockAction = 'set' | 'adjust' | 'setOnOrder' | 'receive' | 'setWaste';
export type PartAction = 'printed' | 'setPrinted' | 'adjustPrinted';

export class StockChangeError extends Error {}

function sqlOrThrow() {
  const sql = getDb();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  return sql;
}

const number = (n: number) => n.toLocaleString('en-AU');

/** Short label for a part when listing what a kit is made from */
function shortName(name: string): string {
  return name.replace(/^Dash Replacement Parts - /, '').replace(/ \(Pair\)$/, '');
}

/** Everything the admin page shows: materials, printed parts, what can be sold, and recent changes */
export async function getAdminStock(): Promise<AdminStock> {
  const sql = sqlOrThrow();
  const [ctx, materialRows, partRows, kitRows, logRows] = await Promise.all([
    loadMaterialState(sql),
    sql`SELECT id, name, unit, on_hand, on_order, waste_pct FROM materials`,
    sql`SELECT price_id, name FROM part_recipes`,
    sql`SELECT DISTINCT kit_price_id, kit_name FROM kit_components`,
    sql`
      SELECT l.at, l.material_id, COALESCE(m.name, p.name, l.material_id) AS material_name,
             l.action, l.change, l.on_hand_after, l.note, l.by_email
      FROM stock_log l
      LEFT JOIN materials m ON m.id = l.material_id
      LEFT JOIN part_recipes p ON l.material_id = ${PART_LOG_PREFIX} || p.price_id
      ORDER BY l.at DESC, l.id DESC LIMIT 25
    `,
  ]);
  if (!ctx) throw new Error('The stock tables are missing: apply schema.sql.');

  const materials: AdminMaterial[] = materialRows
    .map((r) => ({
      id: String(r.id),
      name: String(r.name),
      unit: String(r.unit),
      onHand: Number(r.on_hand) || 0,
      onOrder: Number(r.on_order) || 0,
      wastePct: Number(r.waste_pct) || 0,
      autoDeducted: AUTO_DEDUCTED.includes(String(r.id)),
    }))
    .sort((a, b) => {
      const ia = DISPLAY_ORDER.indexOf(a.id);
      const ib = DISPLAY_ORDER.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
    });

  const names = new Map<string, string>();
  for (const r of partRows) names.set(String(r.price_id), String(r.name));
  const fromScratch = withoutPrinted(ctx);
  const shelfOnly = printedOnly(ctx);

  const parts: AdminPart[] = [...ctx.recipes.values()]
    .map((r) => ({
      priceId: r.priceId,
      name: names.get(r.priceId) ?? r.priceId,
      printedStock: r.printedStock,
      filamentG: r.filamentG,
      heatInserts: r.heatInserts,
      printMinutes: r.printMinutes,
      canPrint: maxUnits(r.priceId, fromScratch),
    }))
    .sort((a, b) => b.filamentG - a.filamentG || a.name.localeCompare(b.name));

  const sellable: AdminSellable[] = [];
  for (const r of ctx.recipes.values()) {
    sellable.push({
      priceId: r.priceId,
      name: names.get(r.priceId) ?? r.priceId,
      kind: 'part',
      madeFrom: '',
      printed: maxUnits(r.priceId, shelfOnly),
      canMake: maxUnits(r.priceId, ctx),
      limitedBy: limitedBy(r.priceId, ctx),
      filamentG: r.filamentG,
      heatInserts: r.heatInserts,
      printMinutes: r.printMinutes,
      packaging: r.packaging,
    });
  }
  for (const kitRow of kitRows) {
    const kitId = String(kitRow.kit_price_id);
    const lines = [{ priceId: kitId, quantity: 1 }];
    const partsNeeded = [...expandLines(lines, ctx)];
    let filamentG = 0;
    let heatInserts = 0;
    let printMinutes = 0;
    let packaging: 'box' | 'mailer' = 'mailer';
    for (const [partId, qty] of partsNeeded) {
      const r = ctx.recipes.get(partId);
      if (!r) continue;
      filamentG += r.filamentG * qty;
      heatInserts += r.heatInserts * qty;
      printMinutes += r.printMinutes * qty;
      if (r.packaging === 'box') packaging = 'box';
    }
    sellable.push({
      priceId: kitId,
      name: String(kitRow.kit_name) || kitId,
      kind: 'kit',
      madeFrom: partsNeeded.map(([id]) => shortName(names.get(id) ?? id)).join(', '),
      printed: maxUnits(kitId, shelfOnly),
      canMake: maxUnits(kitId, ctx),
      limitedBy: limitedBy(kitId, ctx),
      filamentG,
      heatInserts,
      printMinutes,
      packaging,
    });
  }
  sellable.sort((a, b) => Number(a.kind === 'part') - Number(b.kind === 'part') || b.filamentG - a.filamentG || a.name.localeCompare(b.name));

  const log: AdminLogEntry[] = logRows.map((r) => ({
    at: new Date(r.at).toISOString(),
    materialId: String(r.material_id),
    materialName: String(r.material_name),
    action: String(r.action),
    change: Number(r.change) || 0,
    onHandAfter: Number(r.on_hand_after) || 0,
    note: String(r.note || ''),
    by: String(r.by_email),
  }));

  return { materials, parts, sellable, log };
}

/** A whole number within bounds, or a StockChangeError */
function wholeNumber(value: unknown, min: number, max: number, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new StockChangeError(`${label} must be a whole number from ${min} to ${max}.`);
  }
  return n;
}

/**
 * Changes one material and records who did it.
 *  set        on hand becomes exactly this (a stock-take)
 *  adjust     add (or remove, if negative) from what is on hand
 *  setOnOrder how much is on its way
 *  receive    a delivery arrived: that many (all of it, if blank) move from on order to on hand
 *  setWaste   extra percentage used on top of each recipe (filament)
 */
export async function applyStockChange(
  by: string,
  input: { action: StockAction; id: string; value?: unknown }
): Promise<void> {
  const sql = sqlOrThrow();
  const rows = await sql`SELECT on_hand, on_order, waste_pct FROM materials WHERE id = ${input.id}`;
  if (rows.length === 0) throw new StockChangeError('Unknown material.');
  const onHand = Number(rows[0].on_hand);
  const onOrder = Number(rows[0].on_order);
  const LIMIT = 1_000_000;

  let newOnHand = onHand;
  let newOnOrder = onOrder;
  let newWaste = Number(rows[0].waste_pct);
  let note = '';

  switch (input.action) {
    case 'set':
      newOnHand = wholeNumber(input.value, 0, LIMIT, 'On hand');
      break;
    case 'adjust': {
      const delta = wholeNumber(input.value, -LIMIT, LIMIT, 'Change');
      if (onHand + delta < 0) throw new StockChangeError(`Only ${onHand} on hand, so you can't remove ${-delta}.`);
      newOnHand = onHand + delta;
      break;
    }
    case 'setOnOrder':
      newOnOrder = wholeNumber(input.value, 0, LIMIT, 'On order');
      note = `to ${newOnOrder}`;
      break;
    case 'receive': {
      const blank = input.value === undefined || input.value === null || input.value === '';
      const qty = blank ? onOrder : wholeNumber(input.value, 1, LIMIT, 'Received');
      newOnHand = onHand + qty;
      newOnOrder = Math.max(onOrder - qty, 0);
      note = `${qty} arrived`;
      break;
    }
    case 'setWaste':
      newWaste = wholeNumber(input.value, 0, 100, 'Waste');
      note = `to ${newWaste}%`;
      break;
    default:
      throw new StockChangeError('Unknown action.');
  }

  await sql`
    UPDATE materials
    SET on_hand = ${newOnHand}, on_order = ${newOnOrder}, waste_pct = ${newWaste}
    WHERE id = ${input.id}
  `;

  try {
    await sql`
      INSERT INTO stock_log (material_id, action, change, on_hand_after, note, by_email)
      VALUES (${input.id}, ${input.action}, ${newOnHand - onHand}, ${newOnHand}, ${note}, ${by})
    `;
  } catch (err) {
    // The change itself went through; a missing log line must not undo it
    console.warn('Could not write stock_log entry:', err);
  }
}

/**
 * Changes how many of a part are printed and ready, and records who did it.
 *  printed       you printed this many: adds them to the shelf and uses the filament (with waste)
 *                and heat inserts it took, so the materials stay right
 *  setPrinted    printed count becomes exactly this (a stock-take, no materials used)
 *  adjustPrinted add (or remove, if negative) printed parts without touching materials,
 *                for a part that failed or was given away
 */
export async function applyPartChange(
  by: string,
  input: { action: PartAction; id: string; value?: unknown }
): Promise<void> {
  const sql = sqlOrThrow();
  const ctx = await loadMaterialState(sql);
  const recipe = ctx?.recipes.get(input.id);
  if (!ctx || !recipe) throw new StockChangeError('Unknown part.');
  const nameRows = await sql`SELECT name FROM part_recipes WHERE price_id = ${input.id}`;
  const partName = String(nameRows[0]?.name ?? input.id);
  const LIMIT = 100_000;
  const printedBefore = recipe.printedStock;
  const logId = `${PART_LOG_PREFIX}${input.id}`;

  if (input.action === 'setPrinted') {
    const n = wholeNumber(input.value, 0, LIMIT, 'Printed');
    await sql`UPDATE part_recipes SET printed_stock = ${n} WHERE price_id = ${input.id}`;
    await logSafely(sql, logId, input.action, n - printedBefore, n, 'stock-take', by);
    return;
  }

  if (input.action === 'adjustPrinted') {
    const delta = wholeNumber(input.value, -LIMIT, LIMIT, 'Change');
    if (printedBefore + delta < 0) {
      throw new StockChangeError(`Only ${printedBefore} printed, so you can't remove ${-delta}.`);
    }
    const n = printedBefore + delta;
    await sql`UPDATE part_recipes SET printed_stock = ${n} WHERE price_id = ${input.id}`;
    await logSafely(sql, logId, input.action, delta, n, delta >= 0 ? 'no materials used' : 'no materials returned', by);
    return;
  }

  if (input.action !== 'printed') throw new StockChangeError('Unknown action.');

  const qty = wholeNumber(input.value, 1, LIMIT, 'Printed');
  const cost = printCost(recipe, qty, ctx.stock.filamentWastePct);
  if (cost.filamentG > ctx.stock.filamentG) {
    throw new StockChangeError(
      `Printing ${qty} needs ${number(cost.filamentG)} g of filament (with ${ctx.stock.filamentWastePct}% waste) but only ${number(ctx.stock.filamentG)} g is on hand.`
    );
  }
  if (cost.heatInserts > ctx.stock.heatInserts) {
    throw new StockChangeError(
      `Printing ${qty} needs ${number(cost.heatInserts)} heat inserts but only ${number(ctx.stock.heatInserts)} are on hand.`
    );
  }

  // One transaction so the shelf and the materials always change together
  await sql.transaction([
    sql`UPDATE part_recipes SET printed_stock = printed_stock + ${qty} WHERE price_id = ${input.id}`,
    sql`UPDATE materials SET on_hand = GREATEST(on_hand - ${cost.filamentG}, 0) WHERE id = ${MATERIAL_IDS.filament}`,
    sql`UPDATE materials SET on_hand = GREATEST(on_hand - ${cost.heatInserts}, 0) WHERE id = ${MATERIAL_IDS.heatInsert}`,
  ]);

  await logSafely(sql, logId, 'printed', qty, printedBefore + qty, `used ${number(cost.filamentG)} g filament${cost.heatInserts ? `, ${cost.heatInserts} inserts` : ''}`, by);
  await logSafely(sql, MATERIAL_IDS.filament, 'printed', -cost.filamentG, ctx.stock.filamentG - cost.filamentG, `printed ${qty} × ${shortName(partName)}`, by);
  if (cost.heatInserts > 0) {
    await logSafely(sql, MATERIAL_IDS.heatInsert, 'printed', -cost.heatInserts, ctx.stock.heatInserts - cost.heatInserts, `printed ${qty} × ${shortName(partName)}`, by);
  }
}

/** Writes a stock_log line; the change itself has already gone through, so a failure here only warns */
async function logSafely(
  sql: NonNullable<ReturnType<typeof getDb>>,
  materialId: string,
  action: string,
  change: number,
  after: number,
  note: string,
  by: string
) {
  try {
    await sql`
      INSERT INTO stock_log (material_id, action, change, on_hand_after, note, by_email)
      VALUES (${materialId}, ${action}, ${change}, ${after}, ${note}, ${by})
    `;
  } catch (err) {
    console.warn('Could not write stock_log entry:', err);
  }
}
