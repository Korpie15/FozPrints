import { NextResponse } from 'next/server';
import { capturePayPalOrderService } from '@/lib/paypal';
import { CheckoutError } from '@/lib/cart';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (typeof body?.orderId !== 'string' || !body.orderId) {
      return NextResponse.json({ error: 'Missing PayPal Order ID.' }, { status: 400 });
    }

    const capture = await capturePayPalOrderService(body.orderId);

    return NextResponse.json({ success: true, capture });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PayPal capture order error:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment.' },
      { status: 500 }
    );
  }
}
