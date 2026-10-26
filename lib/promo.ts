import { NAV_POD_SHORT_NAME } from './product-seo';

/**
 * The launch offer, defined once so every banner, pill and cart message says
 * the same thing. The LAUNCH50 coupon is restricted to this product and capped
 * at 10 redemptions in Stripe; PayPal uses count toward the same cap
 * (lib/promo-server.ts).
 */
export const LAUNCH_OFFER = {
  code: 'LAUNCH50',
  discount: 50,
  productId: 'prod_VB8PtVP327MDhq',
  productName: NAV_POD_SHORT_NAME,
  limit: 'first 10 orders',
  /** The free-shipping rule, worded the same everywhere */
  freeShipping: 'Free Australia Post standard shipping',
  /** The offer's terms, shown wherever the code is advertised */
  terms:
    'A$50 off one Nav Pod Kit per order with code LAUNCH50, for the first 10 orders (card and PayPal combined). ' +
    'Cannot be combined with other codes and has no cash value. The offer ends once 10 orders have used it. ' +
    'Standard shipping on the Nav Pod Kit is always free and isn\'t part of this offer.',
} as const;

/** Whether a product qualifies for the launch offer and free standard shipping. */
export function isLaunchKit(productId: string | undefined): boolean {
  return productId === LAUNCH_OFFER.productId;
}
