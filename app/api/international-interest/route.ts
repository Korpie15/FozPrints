import { NextResponse } from 'next/server';
import { recordInternationalInterest } from '@/lib/db';

const MAX = { name: 100, email: 254, country: 100, productInterest: 150, notes: 500 };

/** A trimmed string within the limit, '' when missing, or null when too long or not a string */
function field(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > max ? null : trimmed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const name = field(body.name, MAX.name);
    const email = field(body.email, MAX.email);
    const country = field(body.country, MAX.country);
    const productInterest = field(body.productInterest, MAX.productInterest);
    const notes = field(body.notes, MAX.notes);

    if (!name) {
      return NextResponse.json({ error: `Please provide your name (up to ${MAX.name} characters).` }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (!country) {
      return NextResponse.json({ error: `Please provide your country (up to ${MAX.country} characters).` }, { status: 400 });
    }
    if (productInterest === null || notes === null) {
      return NextResponse.json({ error: `Please keep your notes under ${MAX.notes} characters.` }, { status: 400 });
    }

    await recordInternationalInterest({
      name,
      email,
      country,
      productInterest: productInterest || undefined,
      notes,
    });

    // The same reply whether or not the email was already on the list, so the
    // form can't be used to find out who has signed up
    return NextResponse.json({
      success: true,
      message:
        "Thank you! You're on the list. We'll email you when shipping opens to your country, along with an early-bird offer. You can unsubscribe at any time.",
    });
  } catch (error) {
    console.error('Error saving international interest:', error);
    return NextResponse.json(
      { error: 'Failed to record your interest. Please try again later.' },
      { status: 500 }
    );
  }
}
