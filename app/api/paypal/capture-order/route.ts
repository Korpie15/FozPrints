import { NextResponse } from 'next/server';
import { capturePayPalOrderService } from '@/lib/paypal';
import { CartItem } from '@/types/product';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.orderId) {
      return NextResponse.json({ error: 'Missing PayPal Order ID.' }, { status: 400 });
    }

    const { orderId, items } = body;
    const cartItems: CartItem[] = Array.isArray(items) ? items : [];

    const captureResult = await capturePayPalOrderService(orderId, cartItems);

    return NextResponse.json({ success: true, capture: captureResult });
  } catch (error: any) {
    console.error('PayPal capture order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture PayPal payment.' },
      { status: 500 }
    );
  }
}
