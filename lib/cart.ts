import { CartItem } from '@/types/product';
import { getProducts } from '@/lib/stripe';
import { getLiveShippingQuotes } from '@/lib/shipping';

const MAX_LINE_ITEMS = 20;
const MAX_QUANTITY = 99;

/** An error whose message is safe to show to the shopper. */
export class CheckoutError extends Error {}

/**
 * Turns an untrusted cart from the browser into trusted line items.
 * Only the Price ID and quantity are read from the request; price, title and
 * handle come from the live Stripe catalogue so they can't be spoofed.
 */
export async function resolveCart(raw: unknown): Promise<CartItem[]> {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new CheckoutError('Cart is empty.');
  }
  if (raw.length > MAX_LINE_ITEMS) {
    throw new CheckoutError('Too many items in cart.');
  }

  const quantities = new Map<string, number>();
  for (const entry of raw) {
    const id = entry?.id;
    const quantity = entry?.quantity;
    if (typeof id !== 'string' || !id.startsWith('price_')) {
      throw new CheckoutError('Your cart contains an invalid item. Please remove it and try again.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new CheckoutError('Invalid item quantity.');
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const products = await getProducts();
  if (products.length === 0) {
    throw new CheckoutError('We could not load prices right now. Please try again shortly.');
  }

  const items: CartItem[] = [];
  for (const [id, quantity] of quantities) {
    const product = products.find((p) => p.variants.some((v) => v.id === id));
    const variant = product?.variants.find((v) => v.id === id);
    if (!product || !variant) {
      throw new CheckoutError('Your cart contains an item that is no longer available. Please remove it and try again.');
    }
    if (quantity > MAX_QUANTITY) {
      throw new CheckoutError('Invalid item quantity.');
    }

    items.push({
      id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.priceCents / 100,
      priceCents: variant.priceCents,
      currencyCode: variant.price.currencyCode,
      handle: product.handle,
      quantity,
    });
  }

  return items;
}

/**
 * Re-quotes an order for the postcode it is actually shipping to.
 * Returns the extra cents owed when that costs more than the shipping charged, else 0.
 */
export async function shippingShortfall(
  lines: Array<{ priceId: string; quantity: number }>,
  serviceCode: string,
  postcode: string,
  chargedCents: number
): Promise<number> {
  const items = await resolveCart(lines.map((line) => ({ id: line.priceId, quantity: line.quantity })));
  const quotes = await getLiveShippingQuotes(items, postcode);
  const quote = quotes.find((q) => q.serviceCode === serviceCode) ?? quotes[0];
  return Math.max(0, quote.priceCents - chargedCents);
}

/**
 * Australian postcode from the request. Missing means "not entered yet", so it
 * quotes for Sydney CBD; anything else must be 4 digits.
 */
export function parsePostcode(raw: unknown): string {
  const postcode = typeof raw === 'string' ? raw.trim() : '';
  if (postcode === '') {
    return '2000';
  }
  if (!/^\d{4}$/.test(postcode)) {
    throw new CheckoutError('Please enter a valid Australian postcode.');
  }
  return postcode;
}
