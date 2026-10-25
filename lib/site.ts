/** Canonical public URL of the site (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fozprints.com.au').replace(/\/+$/, '');

/** Shown wherever prices or the business are described: Foz Prints isn't registered for GST */
export const BUSINESS_ABN = '21 146 926 791';
export const GST_NOTE = 'No GST applies. Foz Prints is not registered for GST.';
