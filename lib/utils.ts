import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
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

/**
 * Dynamically converts plain text or raw HTML product descriptions
 * into cleanly formatted semantic HTML with paragraphs, headings, and lists.
 */
export function formatDescriptionToHtml(description: string): string {
  if (!description) return '';

  // If already rich HTML with explicit headings/lists and no messy span wrappers
  if (/<(h[1-6]|ul|ol)[\s>]/i.test(description) && !description.includes('<span>')) {
    return description;
  }

  // Normalize HTML breaks and tags into plain text with newlines
  let text = description
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
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
      htmlParts.push(`<h3>${line}</h3>`);
    } else {
      htmlParts.push(`<p>${line}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}
