import { NextResponse } from 'next/server';
import { getLiveShippingQuotes, estimateParcel } from '@/lib/shipping';
import { CartItem } from '@/types/product';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items || [];
    const toPostcode = body.toPostcode || '2000';

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty.' },
        { status: 400 }
      );
    }

    const quotes = await getLiveShippingQuotes(items, toPostcode);
    const parcel = estimateParcel(items);

    return NextResponse.json({
      quotes,
      parcel,
    });
  } catch (error: any) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate shipping.' },
      { status: 500 }
    );
  }
}
