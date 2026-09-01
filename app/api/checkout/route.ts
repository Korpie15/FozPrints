import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CartItem } from '@/types/product';
import { getStripeServer } from '@/lib/stripe';
import { getLiveShippingQuotes } from '@/lib/shipping';

export async function POST(req: Request) {
  try {
    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const items: CartItem[] = body.items || [];
    const destinationPostcode = body.toPostcode || '2000';

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty.' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Map items to Stripe line_items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      // If item.id is a real Stripe Price ID
      if (item.id && item.id.startsWith('price_')) {
        return {
          price: item.id,
          quantity: item.quantity,
        };
      }

      // Fallback to custom price_data
      const amountInCents = item.priceCents || Math.round(item.price * 100);
      const currency = (item.currencyCode || 'aud').toLowerCase();

      return {
        price_data: {
          currency,
          product_data: {
            name: item.title,
            description: item.variantTitle && item.variantTitle !== 'Default' ? item.variantTitle : undefined,
            images: item.image ? [item.image] : [],
          },
          unit_amount: amountInCents,
        },
        quantity: item.quantity,
      };
    });

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
        allowed_countries: ['AU', 'US', 'NZ', 'GB', 'CA', 'JP', 'DE'],
      },
      shipping_options,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
