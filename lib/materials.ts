/**
 * Stock worked out from raw materials.
 *
 * Everything is made to order, so what can be sold depends on the filament, boxes and
 * heat inserts on hand, not on a count typed in for each product. Each product variant
 * has a recipe (see part_recipes in schema.sql). This file is pure maths with no
 * database access: lib/db.ts loads the numbers and calls into it.
 */

export const MATERIAL_IDS = {
  filament: 'filament_asa_black',
  box: 'box',
  mailer: 'bubble_mailer',
  heatInsert: 'heat_insert',
} as const;

/** Never offer more than this many of one item, however much material is left */
const MAX_UNITS = 99;

export interface Recipe {
  priceId: string;
  filamentG: number;
  heatInserts: number;
  printMinutes: number;
  /** 'mailer' parts are small enough to go in a bubble mailer */
  packaging: 'box' | 'mailer';
}

export interface MaterialStock {
  filamentG: number;
  /** Extra filament used on top of the measured weight (supports, purge, failed prints) */
  filamentWastePct: number;
  boxes: number;
  mailers: number;
  heatInserts: number;
}

export interface OrderLine {
  priceId: string;
  quantity: number;
}

export interface OrderUsage {
  filamentG: number;
  heatInserts: number;
  boxes: number;
  mailers: number;
  printMinutes: number;
}

/** Grams of filament one unit really uses, including waste, rounded up */
export function filamentPerUnit(recipe: Recipe, wastePct: number): number {
  return Math.ceil((recipe.filamentG * (100 + wastePct)) / 100);
}

/** A box-only part needs a box. A mailer part can go in a mailer, or in a box once mailers run out. */
function packagingInStock(recipe: Recipe, stock: MaterialStock): boolean {
  return recipe.packaging === 'box' ? stock.boxes > 0 : stock.boxes + stock.mailers > 0;
}

/** How many of this variant could be made right now if it were the only thing ordered */
export function maxUnits(recipe: Recipe, stock: MaterialStock): number {
  if (!packagingInStock(recipe, stock)) return 0;

  const perUnit = filamentPerUnit(recipe, stock.filamentWastePct);
  const byFilament = perUnit > 0 ? Math.floor(stock.filamentG / perUnit) : Infinity;
  const byInserts = recipe.heatInserts > 0 ? Math.floor(stock.heatInserts / recipe.heatInserts) : Infinity;

  return Math.min(byFilament, byInserts, MAX_UNITS);
}

/**
 * What a whole order uses up. Packaging is per order, not per item: any part that
 * needs a box means one box for the order; an order of only mailer parts uses one
 * mailer (or a box if there are no mailers left).
 */
export function orderUsage(
  lines: OrderLine[],
  recipes: Map<string, Recipe>,
  stock: MaterialStock
): OrderUsage {
  const usage: OrderUsage = { filamentG: 0, heatInserts: 0, boxes: 0, mailers: 0, printMinutes: 0 };
  let counted = 0;
  let needsBox = false;

  for (const { priceId, quantity } of lines) {
    const recipe = recipes.get(priceId);
    if (!recipe) continue;
    counted += 1;
    usage.filamentG += filamentPerUnit(recipe, stock.filamentWastePct) * quantity;
    usage.heatInserts += recipe.heatInserts * quantity;
    usage.printMinutes += recipe.printMinutes * quantity;
    if (recipe.packaging === 'box') needsBox = true;
  }

  if (counted > 0) {
    if (needsBox || stock.mailers <= 0) usage.boxes = 1;
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
