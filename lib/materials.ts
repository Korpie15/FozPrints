/**
 * Stock worked out from printed parts and raw materials.
 *
 * Everything is made to order, but some parts are printed ahead of time. What can be
 * sold is the printed parts on the shelf plus whatever could still be printed from the
 * filament, heat inserts and packaging on hand. Each part has a recipe (see part_recipes
 * in schema.sql). A kit has no stock of its own: it is made from parts (kit_components).
 * This file is pure maths with no database access: lib/db.ts loads the numbers and calls in.
 */

export const MATERIAL_IDS = {
  filament: 'filament_asa_black',
  box: 'box',
  mailer: 'bubble_mailer',
  heatInsert: 'heat_insert',
} as const;

/** Never offer more than this many of one item, however much is left */
const MAX_UNITS = 99;

export interface Recipe {
  priceId: string;
  filamentG: number;
  heatInserts: number;
  printMinutes: number;
  /** 'mailer' parts are small enough to go in a bubble mailer */
  packaging: 'box' | 'mailer';
  /** Printed and ready on the shelf (heat inserts, if any, already pressed in) */
  printedStock: number;
}

/** One part a kit is made from */
export interface KitComponent {
  partPriceId: string;
  quantity: number;
}

export interface MaterialStock {
  filamentG: number;
  /** Extra filament used on top of the measured weight (supports, purge, failed prints) */
  filamentWastePct: number;
  boxes: number;
  mailers: number;
  heatInserts: number;
}

export interface StockContext {
  /** Every part, by Stripe Price ID */
  recipes: Map<string, Recipe>;
  /** Kits by Stripe Price ID, with the parts each is made from */
  kits: Map<string, KitComponent[]>;
  stock: MaterialStock;
}

export interface OrderLine {
  priceId: string;
  quantity: number;
}

export interface OrderUsage {
  /** Filament and inserts for parts that have to be printed to fill the order */
  filamentG: number;
  heatInserts: number;
  boxes: number;
  mailers: number;
  printMinutes: number;
  /** Printed parts taken off the shelf, by part Price ID */
  printedUsed: Map<string, number>;
}

/** Grams of filament one unit really uses, including waste, rounded up */
export function filamentPerUnit(recipe: Recipe, wastePct: number): number {
  return Math.ceil((recipe.filamentG * (100 + wastePct)) / 100);
}

/** Whether this price ID is something the shop sells from parts and materials */
export function isSellable(priceId: string, ctx: StockContext): boolean {
  return ctx.recipes.has(priceId) || ctx.kits.has(priceId);
}

/** Turns order lines into the parts needed, with kits split into their parts */
export function expandLines(lines: OrderLine[], ctx: StockContext): Map<string, number> {
  const parts = new Map<string, number>();
  const add = (id: string, qty: number) => parts.set(id, (parts.get(id) || 0) + qty);
  for (const { priceId, quantity } of lines) {
    const kit = ctx.kits.get(priceId);
    if (kit) {
      for (const c of kit) add(c.partPriceId, c.quantity * quantity);
    } else if (ctx.recipes.has(priceId)) {
      add(priceId, quantity);
    }
  }
  return parts;
}

/**
 * What a whole order uses up. Printed parts come off the shelf first; whatever is
 * short has to be printed, which uses filament (with waste) and heat inserts.
 * Packaging is per order, not per item: any part that needs a box means one box for
 * the order; an order of only mailer parts uses one mailer (or a box if none are left).
 */
export function orderUsage(lines: OrderLine[], ctx: StockContext): OrderUsage {
  const usage: OrderUsage = {
    filamentG: 0,
    heatInserts: 0,
    boxes: 0,
    mailers: 0,
    printMinutes: 0,
    printedUsed: new Map(),
  };
  let needsBox = false;
  let counted = 0;

  for (const [partId, qty] of expandLines(lines, ctx)) {
    const recipe = ctx.recipes.get(partId);
    if (!recipe) continue;
    counted += 1;

    const fromShelf = Math.min(recipe.printedStock, qty);
    const toPrint = qty - fromShelf;
    if (fromShelf > 0) usage.printedUsed.set(partId, fromShelf);
    usage.filamentG += filamentPerUnit(recipe, ctx.stock.filamentWastePct) * toPrint;
    usage.heatInserts += recipe.heatInserts * toPrint;
    usage.printMinutes += recipe.printMinutes * toPrint;
    if (recipe.packaging === 'box') needsBox = true;
  }

  if (counted > 0) {
    if (needsBox || ctx.stock.mailers <= 0) usage.boxes = 1;
    else usage.mailers = 1;
  }
  return usage;
}

/** True when the stock on hand cannot cover the whole order at once */
export function cannotFulfil(usage: OrderUsage, stock: MaterialStock): boolean {
  return (
    usage.filamentG > stock.filamentG ||
    usage.heatInserts > stock.heatInserts ||
    usage.boxes > stock.boxes ||
    usage.mailers > stock.mailers
  );
}

/** How many of this item (a part or a kit) could be supplied right now if it were the only thing ordered */
export function maxUnits(priceId: string, ctx: StockContext): number {
  if (!isSellable(priceId, ctx)) return 0;
  for (let n = 1; n <= MAX_UNITS; n++) {
    if (cannotFulfil(orderUsage([{ priceId, quantity: n }], ctx), ctx.stock)) return n - 1;
  }
  return MAX_UNITS;
}

/** The same stock with nothing printed yet: how many could be made from materials alone */
export function withoutPrinted(ctx: StockContext): StockContext {
  const recipes = new Map<string, Recipe>();
  for (const [id, r] of ctx.recipes) recipes.set(id, { ...r, printedStock: 0 });
  return { ...ctx, recipes };
}

/** The same stock with no filament or inserts: how many are already printed and ready to ship */
export function printedOnly(ctx: StockContext): StockContext {
  return { ...ctx, stock: { ...ctx.stock, filamentG: 0, heatInserts: 0 } };
}

/** What stops you supplying one more of this item right now (null when nothing is the limit) */
export function limitedBy(priceId: string, ctx: StockContext): 'packaging' | 'filament' | 'heat inserts' | null {
  const n = maxUnits(priceId, ctx);
  if (n >= MAX_UNITS) return null;
  const usage = orderUsage([{ priceId, quantity: n + 1 }], ctx);
  if (usage.boxes > ctx.stock.boxes || usage.mailers > ctx.stock.mailers) return 'packaging';
  if (usage.filamentG > ctx.stock.filamentG) return 'filament';
  if (usage.heatInserts > ctx.stock.heatInserts) return 'heat inserts';
  return null;
}

/** Filament (with waste) and heat inserts used up by printing this many of a part */
export function printCost(recipe: Recipe, quantity: number, wastePct: number): { filamentG: number; heatInserts: number } {
  return {
    filamentG: filamentPerUnit(recipe, wastePct) * quantity,
    heatInserts: recipe.heatInserts * quantity,
  };
}
