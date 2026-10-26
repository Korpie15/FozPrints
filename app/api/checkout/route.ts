import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServer } from '@/lib/stripe';
import { getLiveShippingQuotes, hasFullKit } from '@/lib/shipping';
import { getInventoryMap } from '@/lib/db';
import { CheckoutError, parsePostcode, resolveCart } from '@/lib/cart';
import { GST_NOTE, SITE_URL } from '@/lib/site';
import { isLaunchOfferAvailable } from '@/lib/promo-server';

/** Where Stripe sends the buyer back to: this site, or one of its Netlify previews */
function returnOrigin(req: Request): string {
  const origin = req.headers.get('origin');
  if (origin && (origin === SITE_URL || /^https:\/\/[a-z0-9-]+--fozprints\.netlify\.app$/.test(origin))) {
    return origin;
  }
  if (origin && process.env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) {
    return origin;
  }
  return SITE_URL;
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeServer();
    if (!stripe) {
      console.error('STRIPE_SECRET_KEY is not configured.');
      return NextResponse.json(
        { error: 'Checkout is unavailable right now. Please try again later.' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const items = await resolveCart(body?.items);
    const destinationPostcode = parsePostcode(body?.toPostcode);
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode.trim().toUpperCase() : undefined;

    // Verify stock availability from Neon. Fail closed: no inventory data, no sale.
    let inventoryMap: Record<string, number>;
    try {
      inventoryMap = await getInventoryMap();
    } catch (error) {
      console.error('Inventory lookup failed during checkout:', error);
      return NextResponse.json(
        { error: 'We could not verify stock right now. Please try again shortly.' },
        { status: 503 }
      );
    }

    for (const item of items) {
      const stock = inventoryMap[item.id] ?? 0;
      if (item.quantity > stock) {
        const itemLabel = item.variantTitle && item.variantTitle !== 'Default'
          ? `${item.title} (${item.variantTitle})`
          : item.title;
        return NextResponse.json(
          {
            error: stock <= 0
              ? `"${itemLabel}" is out of stock.`
              : `Only ${stock} units available for "${itemLabel}". Please update your cart.`,
          },
          { status: 400 }
        );
      }
    }

    const origin = returnOrigin(req);

    // Prices always come from Stripe via the Price ID, never from the client
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price: item.id,
      quantity: item.quantity,
    }));

    // Calculate live Australia Post quotes based on cart contents
    const shippingQuotes = await getLiveShippingQuotes(items, destinationPostcode);

    const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] = shippingQuotes.map((quote) => ({
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: {
          amount: quote.priceCents,
          currency: 'aud',
        },
        display_name: quote.name,
        metadata: { service_code: quote.serviceCode },
        delivery_estimate: {
          minimum: { unit: quote.deliveryEstimate.unit, value: quote.deliveryEstimate.minimum },
          maximum: { unit: quote.deliveryEstimate.unit, value: quote.deliveryEstimate.maximum },
        },
      },
    }));

    const isLaunchPromo = promoCode === 'LAUNCH50' && hasFullKit(items);
    // Stripe caps its own uses of the coupon, but PayPal uses count toward the same 10
    if (isLaunchPromo && !(await isLaunchOfferAvailable())) {
      return NextResponse.json(
        { error: 'The LAUNCH50 offer has ended. Please remove the code and try again.' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      shipping_options,
      // The webhook compares this with the address the buyer enters
      metadata: { quoted_postcode: destinationPostcode },
      custom_text: { submit: { message: GST_NOTE } },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      ...(isLaunchPromo
        ? { discounts: [{ coupon: 'LAUNCH50' }] }
        : { allow_promotion_codes: true }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong starting checkout. Please try again.' },
      { status: 500 }
    );
  }
}
