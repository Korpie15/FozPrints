import { NextResponse } from 'next/server';
import { getLiveShippingQuotes, estimateParcel } from '@/lib/shipping';
import { CheckoutError, parsePostcode, resolveCart } from '@/lib/cart';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const items = await resolveCart(body?.items);
    const toPostcode = parsePostcode(body?.toPostcode);

    const quotes = await getLiveShippingQuotes(items, toPostcode);
    const parcel = estimateParcel(items);

    return NextResponse.json({
      quotes,
      parcel,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping.' },
      { status: 500 }
    );
  }
}
