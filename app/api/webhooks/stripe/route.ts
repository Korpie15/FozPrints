import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServer } from '@/lib/stripe';
import { decrementInventoryOnce } from '@/lib/db';

export async function POST(req: Request) {
  const stripe = getStripeServer();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature error:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email;
    const orderId = session.id.slice(-8).toUpperCase();

    try {
      const lineItems = await stripe.checkout.sessions
        .listLineItems(session.id, { limit: 100 })
        .autoPagingToArray({ limit: 1000 });

      const lines = lineItems.flatMap((li) =>
        li.price?.id && li.quantity ? [{ priceId: li.price.id, quantity: li.quantity }] : []
      );

      const applied = await decrementInventoryOnce(event.id, lines);
      console.log(
        `Order #${orderId} completed for ${customerEmail}; ` +
          (applied ? 'inventory updated' : 'duplicate event, inventory already updated')
      );
    } catch (err) {
      // Non-2xx makes Stripe retry; decrementInventoryOnce is safe to retry
      console.error(`Order #${orderId}: failed to update inventory:`, err);
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
