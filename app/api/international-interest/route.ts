import { NextResponse } from 'next/server';
import { recordInternationalInterest } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { name, email, country, productInterest, notes } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      return NextResponse.json({ error: 'Please provide your country.' }, { status: 400 });
    }

    const result = await recordInternationalInterest({
      name: name.slice(0, 100),
      email: email.slice(0, 150),
      country: country.slice(0, 100),
      productInterest: typeof productInterest === 'string' ? productInterest.slice(0, 150) : undefined,
      notes: typeof notes === 'string' ? notes.slice(0, 500) : undefined,
    });

    return NextResponse.json({
      success: true,
      alreadyRegistered: result.alreadyRegistered,
      message: result.alreadyRegistered
        ? "We've updated your preferences! We'll notify you the moment shipping opens to your country."
        : "Thank you! You're on the list. We'll email you the moment shipping opens to your country with an exclusive early-bird offer.",
    });
  } catch (error: any) {
    console.error('Error saving international interest:', error);
    return NextResponse.json(
      { error: 'Failed to record your interest. Please try again later.' },
      { status: 500 }
    );
  }
}
