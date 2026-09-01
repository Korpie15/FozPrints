import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { getStripeServer } from '@/lib/stripe';

export async function POST(req: Request) {
  const stripe = getStripeServer();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('STRIPE_WEBHOOK_SECRET is not configured. Skipping webhook verification.');
    return NextResponse.json({ received: true, note: 'Webhook secret not configured' });
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
    const customerName = session.customer_details?.name || 'Customer';
    const orderId = session.id.slice(-8).toUpperCase();
    const shipping = (session as any).shipping_details?.address || session.customer_details?.address;

    console.log(`Order #${orderId} completed successfully for ${customerEmail}`);

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && customerEmail) {
      const resend = new Resend(resendApiKey);
      try {
        await resend.emails.send({
          from: 'Foz Prints <orders@fozprints.com.au>',
          to: customerEmail,
          subject: `Order Confirmation #${orderId} - Foz Prints`,
          html: `
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>We have received your payment and are preparing your 3D printed Subaru Forester parts for dispatch.</p>
            <p><strong>Order Reference:</strong> #${orderId}</p>
            <p>We will email you Australia Post tracking details as soon as your package has been lodged.</p>
            <br />
            <p>Kind regards,</p>
            <p>The Foz Prints Team</p>
          `,
        });

        // Send notification to workshop admin
        await resend.emails.send({
          from: 'Foz Prints Store <orders@fozprints.com.au>',
          to: 'info@fozprints.com.au',
          subject: `[New Order] #${orderId} from ${customerName}`,
          html: `
            <h3>New Order Received</h3>
            <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
            <p><strong>Total Paid:</strong> $${((session.amount_total || 0) / 100).toFixed(2)} AUD</p>
            <p><strong>Shipping Address:</strong><br />
            ${shipping?.line1 || ''}<br />
            ${shipping?.city || ''}, ${shipping?.state || ''} ${shipping?.postal_code || ''}<br />
            ${shipping?.country || ''}
            </p>
          `,
        });
      } catch (emailErr) {
        console.error('Error sending order confirmation email:', emailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
