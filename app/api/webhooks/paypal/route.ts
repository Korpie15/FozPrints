import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyPayPalWebhook } from '@/lib/paypal';
import { decrementInventoryOnce, getPayPalOrder } from '@/lib/db';

/**
 * Backup for the capture route's stock update: PayPal retries this webhook
 * until it succeeds, so a failed inventory write is never lost.
 */
export async function POST(req: Request) {
  const event = await req.json().catch(() => null);
  if (!event) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let verified: boolean;
  try {
    verified = await verifyPayPalWebhook(req.headers, event);
  } catch (err) {
    console.error('PayPal webhook verification error:', err);
    return NextResponse.json({ error: 'Webhook verification unavailable' }, { status: 500 });
  }
  if (!verified) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (typeof orderId !== 'string') {
      return NextResponse.json({ received: true });
    }

    try {
      const recorded = await getPayPalOrder(orderId);
      if (!recorded) {
        console.warn(`PayPal webhook: capture for order ${orderId} that our server did not create`);
        return NextResponse.json({ received: true });
      }

      const applied = await decrementInventoryOnce(`paypal_${orderId}`, recorded.lines);
      console.log(
        `PayPal order ${orderId} completed; ` +
          (applied ? 'inventory updated' : 'inventory already updated')
      );

      if (applied) {
        try {
          revalidatePath('/products');
          revalidatePath('/');
        } catch (revalErr) {
          console.warn('Failed to revalidate paths after order:', revalErr);
        }
      }
    } catch (err) {
      // Non-2xx makes PayPal retry; decrementInventoryOnce is safe to retry
      console.error(`PayPal order ${orderId}: failed to update inventory:`, err);
      return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
