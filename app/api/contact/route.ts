import { NextRequest, NextResponse } from 'next/server';

const MAX_LENGTHS = { name: 100, email: 254, subject: 150, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // Hidden honeypot field: real visitors never fill it in, bots usually do.
    // Pretend success so bots don't learn to adapt.
    if (typeof body?.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ message: 'Message received successfully' });
    }

    const fields = {
      name: body?.name,
      email: body?.email,
      subject: body?.subject,
      message: body?.message,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (typeof value !== 'string' || value.trim() === '') {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }
      if (value.length > MAX_LENGTHS[key as keyof typeof MAX_LENGTHS]) {
        return NextResponse.json({ error: `Your ${key} is too long.` }, { status: 400 });
      }
    }

    const name = (fields.name as string).trim();
    const email = (fields.email as string).trim();
    // Strip line breaks so the subject can't be used for header injection
    const subject = (fields.subject as string).replace(/[\r\n]+/g, ' ').trim();
    const message = (fields.message as string).trim();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured; contact message could not be sent.');
      return NextResponse.json(
        { error: 'Messages cannot be sent right now. Please email us directly.' },
        { status: 500 }
      );
    }

    const to = process.env.CONTACT_TO_EMAIL || 'info@fozprints.com.au';
    // Must be an address on a domain verified in Resend
    const from = process.env.CONTACT_FROM_EMAIL || 'info@fozprints.com.au';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Foz Prints Website <${from}>`,
        to: [to],
        reply_to: email,
        subject: `[Contact form] ${subject}`,
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
        html:
          `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>` +
          `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` +
          `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      // Log Resend's reason (status + error body) but never the visitor's message
      console.error('Resend rejected contact email:', res.status, await res.text());
      return NextResponse.json(
        { error: 'We could not send your message. Please try again later.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: 'Message received successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
