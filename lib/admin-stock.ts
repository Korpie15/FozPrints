import { getDb } from '@/lib/db';
import { MATERIAL_IDS, limitedBy, maxUnits, type MaterialStock, type Recipe } from '@/lib/materials';

/** Materials the shop deducts by itself when an order is paid. Anything else is tracked by hand. */
const AUTO_DEDUCTED: string[] = [MATERIAL_IDS.filament, MATERIAL_IDS.box, MATERIAL_IDS.mailer, MATERIAL_IDS.heatInsert];

/** Order materials appear on the page */
const DISPLAY_ORDER = [...AUTO_DEDUCTED, 'honeycomb_paper'];

export interface AdminMaterial {
  id: string;
  name: string;
  unit: string;
  onHand: number;
  onOrder: number;
  wastePct: number;
  autoDeducted: boolean;
}

export interface AdminRecipe {
  priceId: string;
  name: string;
  filamentG: number;
  heatInserts: number;
  printMinutes: number;
  packaging: 'box' | 'mailer';
  canMake: number;
  limitedBy: string | null;
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
  recipes: AdminRecipe[];
  log: AdminLogEntry[];
}

export type StockAction = 'set' | 'adjust' | 'setOnOrder' | 'receive' | 'setWaste';

export class StockChangeError extends Error {}

function sqlOrThrow() {
  const sql = getDb();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  return sql;
}

/** Everything the admin page shows: materials, what can be made from them, and recent changes */
export async function getAdminStock(): Promise<AdminStock> {
  const sql = sqlOrThrow();
  const [materialRows, recipeRows, logRows] = await Promise.all([
    sql`SELECT id, name, unit, on_hand, on_order, waste_pct FROM materials`,
    sql`SELECT price_id, name, filament_g, heat_inserts, print_minutes, packaging FROM part_recipes`,
    sql`
      SELECT l.at, l.material_id, COALESCE(m.name, l.material_id) AS material_name,
             l.action, l.change, l.on_hand_after, l.note, l.by_email
      FROM stock_log l LEFT JOIN materials m ON m.id = l.material_id
      ORDER BY l.at DESC, l.id DESC LIMIT 25
    `,
  ]);

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

  const find = (id: string) => materials.find((m) => m.id === id);
  const stock: MaterialStock = {
    filamentG: find(MATERIAL_IDS.filament)?.onHand ?? 0,
    filamentWastePct: find(MATERIAL_IDS.filament)?.wastePct ?? 0,
    boxes: find(MATERIAL_IDS.box)?.onHand ?? 0,
    mailers: find(MATERIAL_IDS.mailer)?.onHand ?? 0,
    heatInserts: find(MATERIAL_IDS.heatInsert)?.onHand ?? 0,
  };

  const recipes: AdminRecipe[] = recipeRows
    .map((r) => {
      const recipe: Recipe = {
        priceId: String(r.price_id),
        filamentG: Number(r.filament_g) || 0,
        heatInserts: Number(r.heat_inserts) || 0,
        printMinutes: Number(r.print_minutes) || 0,
        packaging: r.packaging === 'mailer' ? 'mailer' : 'box',
      };
      return {
        priceId: recipe.priceId,
        name: String(r.name),
        filamentG: recipe.filamentG,
        heatInserts: recipe.heatInserts,
        printMinutes: recipe.printMinutes,
        packaging: recipe.packaging,
        canMake: maxUnits(recipe, stock),
        limitedBy: limitedBy(recipe, stock),
      };
    })
    .sort((a, b) => b.filamentG - a.filamentG || a.name.localeCompare(b.name));

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

  return { materials, recipes, log };
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
      note = '';
      break;
    case 'adjust': {
      const delta = wholeNumber(input.value, -LIMIT, LIMIT, 'Change');
      if (onHand + delta < 0) throw new StockChangeError(`Only ${onHand} on hand, so you can't remove ${-delta}.`);
      newOnHand = onHand + delta;
      note = '';
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
