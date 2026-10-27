/** Canonical public URL of the site (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fozprints.com.au').replace(/\/+$/, '');

/** Shown wherever prices or the business are described: Foz Prints isn't registered for GST */
export const BUSINESS_ABN = '21 146 926 791';
export const GST_NOTE = 'No GST applies. Foz Prints is not registered for GST.';

/** Subaru's name is used only to say what the parts fit */
export const NON_AFFILIATION =
  'Foz Prints is an independent business, not affiliated with, authorised by or endorsed by Subaru Corporation or Subaru Australia. Subaru and Forester are trade marks of their owners and are used only to describe vehicle compatibility.';

/** How long an order takes, worded the same on product pages and in the cart */
export const LEAD_TIME =
  'Made to order: allow 1–2 business days for us to print and dispatch, then Australia Post delivery (usually 3–7 business days standard, or 1–3 express).';

/** Shown in the Nav Pod Kit installation manual */
export const NAV_POD_SAFETY = [
  'This is an aftermarket accessory, not a genuine Subaru part. Fit it only if you are confident working on your car’s interior, or have it fitted by a qualified installer.',
  'Do not fit or position any part in or near the path of an airbag, and do not touch or modify airbag (SRS) components or wiring. If you need to work near SRS wiring, follow your vehicle’s service manual, including disconnecting the battery and waiting the time it specifies.',
  'Make sure the pod and head unit are firmly secured and do not block your view of the road, the airbags, the hazard switch or any controls.',
  'Follow your state’s road rules on in-car screens, and check that any modification meets your local roadworthy and registration requirements.',
];

/** Link-preview image (1200×630) for pages without one of their own */
export const DEFAULT_OG_IMAGE = {
  url: '/images/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'Nav Pod Kit installed in a Subaru Forester SG dash',
};

/** Google Merchant Center ID, for the Google Customer Reviews opt-in on the order confirmation page. 0 turns it off. */
export const GOOGLE_MERCHANT_ID = 5888299609;
