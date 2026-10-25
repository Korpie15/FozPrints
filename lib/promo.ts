/**
 * The launch offer, defined once so every banner, pill and cart message says
 * the same thing. The LAUNCH50 coupon is also restricted to this product, and
 * capped at 10 redemptions, in Stripe.
 */
export const LAUNCH_OFFER = {
  code: 'LAUNCH50',
  discount: 50,
  productId: 'prod_VB8PtVP327MDhq',
  productName: 'Nav Pod Kit',
  limit: 'first 10 orders',
  /** The free-shipping rule, worded the same everywhere */
  freeShipping: 'Free Australia Post standard shipping',
} as const;

/** Whether a product qualifies for the launch offer and free standard shipping. */
export function isLaunchKit(productId: string | undefined): boolean {
  return productId === LAUNCH_OFFER.productId;
}
