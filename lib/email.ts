/** Where order notifications and contact messages are delivered */
export const OWNER_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@fozprints.com.au';

/** Must be an address on a domain verified in Resend */
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'info@fozprints.com.au';

/** Sender for order confirmations to customers */
export const ORDERS_FROM_EMAIL = 'orders@fozprints.com.au';

/** Sender for new-order notifications to the owner */
export const ADMIN_FROM_EMAIL = 'admin@fozprints.com.au';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Display name for the sender, e.g. "Foz Prints" */
  fromName?: string;
  /** Sender address; defaults to CONTACT_FROM_EMAIL. Must be on a domain verified in Resend */
  fromAddress?: string;
}

/**
 * Sends one email through Resend. Throws if Resend isn't configured or
 * rejects the message, so callers can retry.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${message.fromName ?? 'Foz Prints'} <${message.fromAddress ?? FROM_EMAIL}>`,
      to: [message.to],
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      subject: message.subject.replace(/[\r\n]+/g, ' '),
      html: message.html,
      text: message.text,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Resend rejected the email: ${res.status} ${await res.text()}`);
  }
}
