import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { getStripeServer } from '@/lib/stripe';
import { decrementInventoryOnce } from '@/lib/db';
import { shippingShortfall } from '@/lib/cart';
import { buildStripeOrderSummary, sendOrderEmailsOnce } from '@/lib/order-email';

/**
 * Stripe Checkout can't re-price shipping once the buyer types their address,
 * so flag orders shipping somewhere dearer than the postcode they were quoted for.
 * The note goes on the payment in the Stripe Dashboard so it's seen before dispatch.
 */
async function flagShippingShortfall(
  stripe: Stripe,
  sessionId: string,
  orderId: string,
  lines: Array<{ priceId: string; quantity: number }>
) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['shipping_cost.shipping_rate'],
    });
    const quotedPostcode = session.metadata?.quoted_postcode;
    const postcode = session.collected_information?.shipping_details?.address?.postal_code;
    const rate = session.shipping_cost?.shipping_rate;
    if (!quotedPostcode || !postcode || postcode === quotedPostcode || !rate || typeof rate === 'string') {
      return;
    }

    const shortfall = await shippingShortfall(
      lines,
      rate.metadata?.service_code ?? '',
      postcode,
      session.shipping_cost?.amount_total ?? 0
    );
    if (shortfall === 0) {
      return;
    }

    const note = `Shipping quoted for ${quotedPostcode} but address is ${postcode}: short $${(shortfall / 100).toFixed(2)}`;
    console.warn(`Order #${orderId}: ${note}`);
    if (typeof session.payment_intent === 'string') {
      await stripe.paymentIntents.update(session.payment_intent, {
        metadata: { shipping_review: note },
      });
    }
  } catch (err) {
    // Never fail the webhook over this check: stock has already been updated
    console.error(`Order #${orderId}: shipping shortfall check failed:`, err);
  }
}

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
      { error: 'Invalid signature' },
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

      if (applied) {
        await flagShippingShortfall(stripe, session.id, orderId, lines);

        try {
          revalidatePath('/products');
          revalidatePath('/');
        } catch (revalErr) {
          console.warn('Failed to revalidate paths after order:', revalErr);
        }
      }
    } catch (err) {
      // Non-2xx makes Stripe retry; decrementInventoryOnce is safe to retry
      console.error(`Order #${orderId}: failed to update inventory:`, err);
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }

    // Order emails: to the shop and to the buyer, each sent once per order
    if (session.payment_status !== 'unpaid') {
      try {
        await sendOrderEmailsOnce(`stripe_${session.id}`, async () => {
          // A shipping shortfall found above is saved on the payment; surface it in the email
          const warnings: string[] = [];
          if (typeof session.payment_intent === 'string') {
            const intent = await stripe.paymentIntents.retrieve(session.payment_intent);
            if (intent.metadata?.shipping_review) warnings.push(intent.metadata.shipping_review);
          }
          return buildStripeOrderSummary(stripe, session.id, warnings);
        });
      } catch (err) {
        // Stock is already updated (and won't be again); the retry only resends unsent emails
        console.error(`Order #${orderId}: failed to send order emails:`, err);
        return NextResponse.json({ error: 'Failed to send order emails' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
