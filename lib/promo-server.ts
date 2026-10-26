import { getStripeServer } from '@/lib/stripe';
import { countPaidPayPalLaunchDiscounts } from '@/lib/db';
import { LAUNCH_OFFER } from '@/lib/promo';

/** Re-checked at most once a minute, so busy pages don't hit Stripe on every request */
const CACHE_MS = 60_000;
let cached: { remaining: number; at: number } | null = null;

/**
 * How many LAUNCH50 redemptions are left across both checkouts. Stripe counts its
 * own uses of the coupon; PayPal orders are counted from our database, because
 * Stripe never sees them. The cap and the coupon's validity live on the Stripe coupon.
 */
export async function getLaunchOfferRemaining(): Promise<number> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.remaining;
  }

  const stripe = getStripeServer();
  if (!stripe) {
    return 0;
  }

  const coupon = await stripe.coupons.retrieve(LAUNCH_OFFER.code);
  const cap = coupon.max_redemptions ?? 0;
  const used = coupon.times_redeemed + (await countPaidPayPalLaunchDiscounts());
  const remaining = coupon.valid ? Math.max(cap - used, 0) : 0;

  cached = { remaining, at: Date.now() };
  return remaining;
}

/** True while the launch offer can still be redeemed. Fails closed if Stripe or the database is unreachable. */
export async function isLaunchOfferAvailable(): Promise<boolean> {
  try {
    return (await getLaunchOfferRemaining()) > 0;
  } catch (error) {
    console.error('Could not check the launch offer:', error);
    return false;
  }
}
