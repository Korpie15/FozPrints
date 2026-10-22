import { NextResponse } from 'next/server';
import { createPayPalOrderService } from '@/lib/paypal';
import { CheckoutError, parsePostcode, resolveCart } from '@/lib/cart';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const items = await resolveCart(body?.items);
    const toPostcode = parsePostcode(body?.toPostcode);
    const serviceCode = typeof body.serviceCode === 'string' ? body.serviceCode : undefined;
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode : undefined;

    const order = await createPayPalOrderService({
      items,
      toPostcode,
      serviceCode,
      promoCode,
    });

    return NextResponse.json({ id: order.id });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize PayPal checkout.' },
      { status: 500 }
    );
  }
}
