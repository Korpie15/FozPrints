import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/types/product';
import { getStripeServer } from '@/lib/stripe';
import { getLiveShippingQuotes } from '@/lib/shipping';
import { getInventoryMap } from '@/lib/db';

const MAX_LINE_ITEMS = 20;
const MAX_QUANTITY = 99;

/**
 * Validates untrusted cart input and merges duplicate Price IDs.
 * Only the Price ID and quantity are trusted for charging; the other
 * fields are display/shipping-estimate hints.
 */
function parseCartItems(raw: unknown): { items: CartItem[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: 'Cart is empty.' };
  }
  if (raw.length > MAX_LINE_ITEMS) {
    return { error: 'Too many items in cart.' };
  }

  const merged = new Map<string, CartItem>();
  for (const entry of raw) {
    const id = entry?.id;
    const quantity = entry?.quantity;
    if (typeof id !== 'string' || !id.startsWith('price_')) {
      return { error: 'Your cart contains an invalid item. Please remove it and try again.' };
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return { error: 'Invalid item quantity.' };
    }

    const existing = merged.get(id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      merged.set(id, {
        ...entry,
        id,
        title: typeof entry.title === 'string' ? entry.title : 'Item',
        handle: typeof entry.handle === 'string' ? entry.handle : '',
        quantity,
      });
    }
  }

  return { items: [...merged.values()] };
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = parseCartItems(body?.items);
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const items = parsed.items;

    const toPostcode = typeof body.toPostcode === 'string' ? body.toPostcode.trim() : '';
    const destinationPostcode = /^\d{4}$/.test(toPostcode) ? toPostcode : '2000';

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

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
        delivery_estimate: {
          minimum: { unit: quote.deliveryEstimate.unit, value: quote.deliveryEstimate.minimum },
          maximum: { unit: quote.deliveryEstimate.unit, value: quote.deliveryEstimate.maximum },
        },
      },
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      shipping_options,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong starting checkout. Please try again.' },
      { status: 500 }
    );
  }
}
