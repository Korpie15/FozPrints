import { CartItem, Product } from '@/types/product';

/**
 * Build-your-own kits. A kit page (Stripe metadata kit_builder=true) sells no price of its own:
 * its parts are separate Stripe products (metadata kit=<kit page handle>) with their own price and stock.
 *
 * Part metadata:
 *   component_type    group the buyer picks one from, e.g. 'arm' or 'holder'
 *   component_key     this part's id, e.g. 'slanted'
 *   component_label   name shown to the buyer
 *   compatible_with   comma-separated component_keys of the other groups it works with (blank = all)
 *   hidden=true       keeps the part out of the shop grid, search and sitemap
 */

const KIT_TYPES = ['arm', 'holder'] as const;
export type KitComponentType = (typeof KIT_TYPES)[number];

export const isKitBuilder = (product: Product) => product.metadata?.kit_builder === 'true';
export const isHiddenProduct = (product: Product) => product.metadata?.hidden === 'true';

export const kitComponents = (products: Product[], kitHandle: string) =>
  products.filter((p) => p.metadata?.kit === kitHandle && p.variants.length > 0);

export const componentType = (part: Product) => part.metadata?.component_type ?? '';
export const componentKey = (part: Product) => part.metadata?.component_key ?? part.handle;
export const componentLabel = (part: Product) => part.metadata?.component_label ?? part.title;

/** Whether two parts from different groups work together */
export function isCompatible(a: Product, b: Product): boolean {
  const allows = (part: Product, other: Product) => {
    const list = part.metadata?.compatible_with;
    if (!list) return true;
    return list.split(',').map((k) => k.trim()).includes(componentKey(other));
  };
  return allows(a, b) && allows(b, a);
}

/** The cheapest in-stock price of a part, or the cheapest at all if none is in stock */
export function partPriceCents(part: Product): number {
  const inStock = part.variants.filter((v) => v.availableForSale);
  const pool = inStock.length > 0 ? inStock : part.variants;
  return Math.min(...pool.map((v) => v.priceCents));
}

export const partInStock = (part: Product) => part.variants.some((v) => v.availableForSale);

/** An order with an arm and a holder from the same kit ships free (standard) */
export function hasKitBundle(items: CartItem[]): boolean {
  const kits = new Map<string, Set<string>>();
  for (const item of items) {
    if (!item.kit || !item.componentType) continue;
    kits.set(item.kit, (kits.get(item.kit) ?? new Set()).add(item.componentType));
  }
  return [...kits.values()].some((types) => KIT_TYPES.every((t) => types.has(t)));
}

export const PERSONALISATION_DEFAULT_MAX = 12;

export const personalisationMaxLength = (product: Product) =>
  Math.min(40, Math.max(1, parseInt(product.metadata?.personalisation_max_length ?? '', 10) || PERSONALISATION_DEFAULT_MAX));

export const allowsPersonalisation = (product: Product) => product.metadata?.personalisation === 'text';

/**
 * Tidies and checks text to be engraved. Only plain characters are allowed because the
 * text is printed onto a part and shown in emails. Returns undefined for blank text.
 */
export function cleanPersonalisation(raw: unknown, maxLength = PERSONALISATION_DEFAULT_MAX): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== 'string') throw new PersonalisationError('Invalid name text.');
  const text = raw.trim().replace(/\s+/g, ' ');
  if (text === '') return undefined;
  if (text.length > maxLength) {
    throw new PersonalisationError(`Names can be up to ${maxLength} characters.`);
  }
  if (!/^[A-Za-z0-9 .'&-]+$/.test(text)) {
    throw new PersonalisationError("Names can only use letters, numbers, spaces and . ' & -");
  }
  return text;
}

export class PersonalisationError extends Error {}

/** Identifies a cart line: the same part with a different name is a different line */
export const cartLineKey = (item: { id: string; personalisation?: string }) =>
  `${item.id}::${item.personalisation ?? ''}`;
