import { NextResponse } from 'next/server';
import { createPayPalOrderService } from '@/lib/paypal';
import { CartItem } from '@/types/product';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const items: CartItem[] = body.items;
    const shippingCost = typeof body.shippingCost === 'number' ? body.shippingCost : 0;
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode : undefined;

    const order = await createPayPalOrderService({
      items,
      shippingCost,
      promoCode,
    });

    return NextResponse.json({ id: order.id });
  } catch (error: any) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize PayPal checkout.' },
      { status: 500 }
    );
  }
}
