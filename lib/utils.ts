import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: string, currencyCode: string): string {
  const value = parseFloat(amount);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  } catch {
    // Missing or invalid currency code (e.g. an old saved cart item): fall back to AUD
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(value);
  }
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/** Escapes text so it can only ever render as text inside HTML */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts plain text or HTML product descriptions into clean paragraphs,
 * headings and lists. Any markup in the source is stripped and the text is
 * escaped, so a description can never inject HTML or scripts into the page.
 */
export function formatDescriptionToHtml(description: string): string {
  if (!description) return '';

  // Normalize HTML breaks and tags into plain text with newlines
  let text = description
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/(h[1-6]|li|ul|ol)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  const lines = text.split(/\r?\n/).map((l) => escapeHtml(l.trim())).filter(Boolean);
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bullet points (starts with •, -, *)
    if (/^[•\-\*]\s*(.+)/.test(line)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      const itemContent = line.replace(/^[•\-\*]\s*/, '');
      htmlParts.push(`<li>${itemContent}</li>`);
      continue;
    }

    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }

    // Heading detection: Short line (under 50 chars), no ending sentence punctuation, followed by further lines
    const isHeading =
      line.length <= 50 &&
      !/[.!?]$/.test(line) &&
      !line.toLowerCase().startsWith('http') &&
      i < lines.length - 1;

    if (isHeading) {
      htmlParts.push(`<h2>${line}</h2>`);
    } else {
      htmlParts.push(`<p>${line}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}

/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 * Escapes "<" so text from Stripe can't close the script tag early.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** URL-friendly form of a variant title, e.g. "Heat Inserts" -> "heat-inserts", used in ?variant= links */
export function variantSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
