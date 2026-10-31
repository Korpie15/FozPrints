import Stripe from 'stripe';
import { claimOnce, releaseClaim, PayPalOrderRecord } from '@/lib/db';
import { sendEmail, OWNER_EMAIL, ADMIN_FROM_EMAIL, ORDERS_FROM_EMAIL } from '@/lib/email';
import { getProducts } from '@/lib/stripe';
import { isNavPodProduct, NAV_POD_SHORT_NAME } from '@/lib/product-seo';
import { BUSINESS_ABN, GST_NOTE, LEAD_TIME, SITE_URL } from '@/lib/site';
import { escapeHtml, formatPrice } from '@/lib/utils';

/** Everything both order emails need, gathered the same way for Stripe and PayPal */
export interface OrderSummary {
  orderNumber: string;
  paymentMethod: string;
  /** Payment reference for finding the order in Stripe or PayPal */
  paymentReference: string;
  dashboardUrl?: string;
  customer: { name: string; email: string; phone?: string };
  shipTo: { name: string; lines: string[] };
  items: Array<{ title: string; variant?: string; quantity: number; totalCents: number; isNavPod: boolean }>;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  shippingService: string;
  totalCents: number;
  /** Things to check before dispatch, e.g. a postcode that doesn't match the quote */
  warnings: string[];
}

const SERVICE_NAMES: Record<string, string> = {
  AUS_PARCEL_REGULAR: 'Australia Post Standard',
  AUS_PARCEL_EXPRESS: 'Australia Post Express',
};

const money = (cents: number) => formatPrice((cents / 100).toFixed(2), 'AUD');

/** Product and finish names for each Stripe Price ID in the order */
async function describeLines(lines: Array<{ priceId: string; quantity: number }>) {
  const products = await getProducts();
  return lines.map(({ priceId, quantity }) => {
    const product = products.find((p) => p.variants.some((v) => v.id === priceId));
    const variant = product?.variants.find((v) => v.id === priceId);
    return {
      priceId,
      quantity,
      title: product?.title ?? `Unknown item (${priceId})`,
      variant: variant && variant.title !== 'Default' ? variant.title : undefined,
      unitCents: variant?.priceCents ?? 0,
      isNavPod: product ? isNavPodProduct(product) : false,
    };
  });
}

export async function buildStripeOrderSummary(
  stripe: Stripe,
  sessionId: string,
  warnings: string[]
): Promise<OrderSummary> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['shipping_cost.shipping_rate'],
  });
  const lineItems = await stripe.checkout.sessions
    .listLineItems(sessionId, { limit: 100 })
    .autoPagingToArray({ limit: 1000 });

  const described = await describeLines(
    lineItems.flatMap((li) => (li.price?.id && li.quantity ? [{ priceId: li.price.id, quantity: li.quantity }] : []))
  );
  const items = described.map((line, i) => ({
    title: line.title,
    variant: line.variant,
    quantity: line.quantity,
    totalCents: lineItems[i]?.amount_subtotal ?? line.unitCents * line.quantity,
    isNavPod: line.isNavPod,
  }));

  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address;
  const rate = session.shipping_cost?.shipping_rate;
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  return {
    orderNumber: `FP-${session.id.slice(-8).toUpperCase()}`,
    paymentMethod: 'Card (Stripe)',
    paymentReference: paymentIntent ?? session.id,
    dashboardUrl: paymentIntent ? `https://dashboard.stripe.com/payments/${paymentIntent}` : undefined,
    customer: {
      name: session.customer_details?.name ?? shipping?.name ?? '',
      email: session.customer_details?.email ?? '',
      phone: session.customer_details?.phone ?? undefined,
    },
    shipTo: {
      name: shipping?.name ?? session.customer_details?.name ?? '',
      lines: [
        address?.line1,
        address?.line2,
        [address?.city, address?.state, address?.postal_code].filter(Boolean).join(' '),
      ].filter((line): line is string => Boolean(line)),
    },
    items,
    subtotalCents: session.amount_subtotal ?? 0,
    discountCents: session.total_details?.amount_discount ?? 0,
    shippingCents: session.total_details?.amount_shipping ?? 0,
    shippingService: rate && typeof rate !== 'string' ? rate.display_name ?? 'Shipping' : 'Shipping',
    totalCents: session.amount_total ?? 0,
    warnings,
  };
}

/**
 * Builds the summary from the order our server recorded (what was charged) and
 * PayPal's copy of the order (who paid and where it's going).
 */
export async function buildPayPalOrderSummary(
  orderId: string,
  recorded: PayPalOrderRecord,
  paypalOrder: any,
  warnings: string[]
): Promise<OrderSummary> {
  const described = await describeLines(recorded.lines);
  const unit = paypalOrder?.purchase_units?.[0];
  const address = unit?.shipping?.address;
  const payer = paypalOrder?.payer;
  const captureId = unit?.payments?.captures?.[0]?.id;
  const payerName = [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(' ');
  const shipName = unit?.shipping?.name?.full_name ?? payerName;

  return {
    orderNumber: `FP-${orderId.slice(-8).toUpperCase()}`,
    paymentMethod: 'PayPal',
    paymentReference: captureId ? `${orderId} (capture ${captureId})` : orderId,
    customer: {
      name: payerName || shipName,
      email: payer?.email_address ?? '',
      phone: payer?.phone?.phone_number?.national_number,
    },
    shipTo: {
      name: shipName,
      lines: [
        address?.address_line_1,
        address?.address_line_2,
        [address?.admin_area_2, address?.admin_area_1, address?.postal_code].filter(Boolean).join(' '),
      ].filter((line): line is string => Boolean(line)),
    },
    items: described.map((line) => ({
      title: line.title,
      variant: line.variant,
      quantity: line.quantity,
      totalCents: line.unitCents * line.quantity,
      isNavPod: line.isNavPod,
    })),
    subtotalCents: described.reduce((sum, line) => sum + line.unitCents * line.quantity, 0),
    discountCents: recorded.discountCents,
    shippingCents: recorded.shippingCents,
    shippingService: SERVICE_NAMES[recorded.serviceCode] ?? recorded.serviceCode,
    totalCents: Math.round(parseFloat(recorded.amount) * 100),
    warnings,
  };
}

/* ---------- Rendering ---------- */

const itemName = (item: OrderSummary['items'][number]) =>
  item.variant ? `${item.title} (${item.variant})` : item.title;

function itemsTableHtml(order: OrderSummary): string {
  const cell = 'padding:8px 0;border-bottom:1px solid #e5e7eb;vertical-align:top;';
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="${cell}">${escapeHtml(itemName(item))}</td>` +
        `<td style="${cell}text-align:center;width:48px;">${item.quantity}</td>` +
        `<td style="${cell}text-align:right;width:96px;">${money(item.totalCents)}</td></tr>`
    )
    .join('');
  const total = (label: string, value: string, bold = false) => {
    const style = bold ? `padding:10px 0 4px;font-weight:700;font-size:16px;border-top:2px solid ${ACCENT};` : 'padding:4px 0;';
    return (
      `<tr><td colspan="2" style="${style}">${label}</td>` +
      `<td style="${style}text-align:right;">${value}</td></tr>`
    );
  };

  return (
    '<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">' +
    `<tr><th style="text-align:left;padding:6px 0;border-bottom:2px solid ${ACCENT};color:${ACCENT};">Item</th>` +
    `<th style="padding:6px 0;border-bottom:2px solid ${ACCENT};color:${ACCENT};">Qty</th>` +
    `<th style="text-align:right;padding:6px 0;border-bottom:2px solid ${ACCENT};color:${ACCENT};">Price</th></tr>` +
    rows +
    total('Subtotal', money(order.subtotalCents)) +
    (order.discountCents > 0 ? total('Discount', `-${money(order.discountCents)}`) : '') +
    total(escapeHtml(order.shippingService), order.shippingCents === 0 ? 'FREE' : money(order.shippingCents)) +
    total('Total paid', money(order.totalCents), true) +
    '</table>'
  );
}

function itemsText(order: OrderSummary): string {
  return [
    ...order.items.map((item) => `- ${item.quantity} x ${itemName(item)}: ${money(item.totalCents)}`),
    '',
    `Subtotal: ${money(order.subtotalCents)}`,
    ...(order.discountCents > 0 ? [`Discount: -${money(order.discountCents)}`] : []),
    `${order.shippingService}: ${order.shippingCents === 0 ? 'FREE' : money(order.shippingCents)}`,
    `Total paid: ${money(order.totalCents)}`,
  ].join('\n');
}

const addressHtml = (order: OrderSummary) =>
  [order.shipTo.name, ...order.shipTo.lines].map(escapeHtml).join('<br>');
const addressText = (order: OrderSummary) => [order.shipTo.name, ...order.shipTo.lines].join('\n');

/* Brand colours, matching the site header and buttons */
const NAVY = '#111827';
const SKY = '#0ea5e9';
const PALE_SKY = '#e0f2fe';
const ACCENT = '#0369a1';
const MUTED = '#6b7280';

const heading = (text: string, top = 24) =>
  `<h3 style="margin:${top}px 0 6px;font-size:15px;color:${ACCENT};text-transform:uppercase;letter-spacing:0.04em;">${text}</h3>`;

/** A button built from a table cell, so it shows in Outlook as well as Gmail and Apple Mail */
const button = (href: string, label: string) =>
  '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 4px;"><tr>' +
  `<td style="background:${ACCENT};border-radius:6px;">` +
  `<a href="${href}" style="display:inline-block;padding:11px 20px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">${label}</a>` +
  '</td></tr></table>';

/**
 * Email layout: navy header with the Foz Prints wordmark, white card on a light grey
 * background, navy footer. Tables and inline styles because email clients ignore most CSS.
 * `preheader` is the grey preview line inbox lists show after the subject.
 */
function wrap(inner: string, { preheader = '', footer = '' }: { preheader?: string; footer?: string } = {}) {
  return (
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>` +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">' +
    '<tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111827;">' +
    `<tr><td style="background:${NAVY};border-radius:10px 10px 0 0;padding:20px 28px;">` +
    `<a href="${SITE_URL}" style="text-decoration:none;font-size:24px;font-weight:700;">` +
    `<span style="color:${SKY};">Foz</span><span style="color:${PALE_SKY};">Prints</span></a>` +
    `<div style="color:#9ca3af;font-size:12px;margin-top:2px;">3D printed parts for the SG Subaru Forester</div>` +
    '</td></tr>' +
    `<tr><td style="background:#ffffff;padding:28px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">${inner}</td></tr>` +
    `<tr><td style="background:${NAVY};border-radius:0 0 10px 10px;padding:18px 28px;color:#9ca3af;font-size:12px;">` +
    (footer || `<a href="${SITE_URL}" style="color:${PALE_SKY};">fozprints.com.au</a>`) +
    '</td></tr>' +
    '</table></td></tr></table>'
  );
}

/** The notification to the shop, with everything needed to make and post the order */
export function renderOwnerEmail(order: OrderSummary) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subject = `New order ${order.orderNumber}: ${money(order.totalCents)}, ${order.customer.name || 'customer'} (${itemCount} item${itemCount === 1 ? '' : 's'})`;
  const warningsHtml = order.warnings.length
    ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:10px 12px;border-radius:6px;margin:12px 0;">` +
      `<strong>Check before dispatch:</strong><ul style="margin:6px 0 0;padding-left:18px;">` +
      order.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('') +
      '</ul></div>'
    : '';

  const html = wrap(
    `<h2 style="margin:0 0 4px;font-size:22px;">New order ${escapeHtml(order.orderNumber)}</h2>` +
      `<p style="margin:0 0 16px;color:${MUTED};">${money(order.totalCents)} from ${escapeHtml(order.customer.name || 'a customer')}</p>` +
      warningsHtml +
      itemsTableHtml(order) +
      heading('Ship to') + `<p style="margin:0;">${addressHtml(order)}</p>` +
      heading('Customer') + `<p style="margin:0;">${escapeHtml(order.customer.name)}<br>` +
      `<a href="mailto:${escapeHtml(order.customer.email)}" style="color:${ACCENT};">${escapeHtml(order.customer.email)}</a>` +
      (order.customer.phone ? `<br>${escapeHtml(order.customer.phone)}` : '') +
      '</p>' +
      heading('Payment') + `<p style="margin:0;">${escapeHtml(order.paymentMethod)}<br>` +
      `Reference: ${escapeHtml(order.paymentReference)}</p>` +
      (order.dashboardUrl ? button(escapeHtml(order.dashboardUrl), 'Open in Stripe') : ''),
    { preheader: `${money(order.totalCents)} from ${order.customer.name || 'a customer'}`, footer: 'Reply to this email to contact the customer.' }
  );

  const text = [
    `New order ${order.orderNumber}`,
    ...(order.warnings.length ? ['', 'CHECK BEFORE DISPATCH:', ...order.warnings.map((w) => `- ${w}`)] : []),
    '',
    itemsText(order),
    '',
    'Ship to:',
    addressText(order),
    '',
    `Customer: ${order.customer.name} <${order.customer.email}>${order.customer.phone ? `, ${order.customer.phone}` : ''}`,
    `Payment: ${order.paymentMethod}, reference ${order.paymentReference}`,
    ...(order.dashboardUrl ? [order.dashboardUrl] : []),
  ].join('\n');

  return { subject, html, text };
}

/** The buyer's confirmation: what they ordered, when to expect it, and how to fit it */
export function renderCustomerEmail(order: OrderSummary) {
  const firstName = order.customer.name.split(' ')[0] || 'there';
  const hasNavPod = order.items.some((item) => item.isNavPod);
  const manualUrl = `${SITE_URL}/manuals/double-DIN-pod-upgrade-kit`;
  const subject = `Thanks for your order, ${firstName} (${order.orderNumber})`;

  const navPodHtml = hasNavPod
    ? `<div style="background:#f0f9ff;border-left:4px solid ${SKY};border-radius:6px;padding:14px 16px;margin-top:24px;">` +
      `<h3 style="margin:0 0 6px;font-size:15px;color:${ACCENT};">Installing your ${NAV_POD_SHORT_NAME}</h3>` +
      '<p style="margin:0;">Our step-by-step guide has photos for every step.</p>' +
      button(manualUrl, 'Open the installation guide') +
      '<p style="margin:8px 0 0;font-size:13px;color:#4b5563;">Before you start, please read the safety information in the guide. ' +
      'Never fit any part in or near the path of an airbag, and make sure everything is firmly secured.</p>' +
      '</div>'
    : '';

  const html = wrap(
    `<h2 style="margin:0 0 6px;font-size:22px;">Thanks for your order, ${escapeHtml(firstName)}!</h2>` +
      `<p style="margin:0 0 16px;">We've received your order <strong style="color:${ACCENT};">${escapeHtml(order.orderNumber)}</strong> and your payment.</p>` +
      `<p style="margin:0 0 20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px 14px;font-size:14px;">` +
      `<strong>What happens next:</strong> ${escapeHtml(LEAD_TIME)} We'll let you know if anything holds it up.</p>` +
      itemsTableHtml(order) +
      heading('Delivering to') + `<p style="margin:0;">${addressHtml(order)}</p>` +
      '<p style="margin:8px 0 0;font-size:13px;color:#4b5563;">If anything in this address is wrong, reply to this email straight away so we can fix it before we post.</p>' +
      navPodHtml +
      heading('Questions?') +
      `<p style="margin:0;">Just reply to this email, or write to <a href="mailto:info@fozprints.com.au" style="color:${ACCENT};">info@fozprints.com.au</a>. ` +
      `Our <a href="${SITE_URL}/policies/refund-policy" style="color:${ACCENT};">refund policy</a> explains what happens if anything is wrong with your order.</p>`,
    {
      preheader: `Order ${order.orderNumber} confirmed. Here's what happens next.`,
      footer:
        `Foz Prints, ABN ${BUSINESS_ABN}. ${escapeHtml(GST_NOTE)} This email is your receipt.<br>` +
        `<a href="${SITE_URL}" style="color:${PALE_SKY};">fozprints.com.au</a>`,
    }
  );

  const text = [
    `Thanks for your order, ${firstName}!`,
    '',
    `We've received your order ${order.orderNumber} and your payment.`,
    `${LEAD_TIME} We'll let you know if anything holds it up.`,
    '',
    itemsText(order),
    '',
    'Delivering to:',
    addressText(order),
    'If anything in this address is wrong, reply to this email straight away so we can fix it before we post.',
    ...(hasNavPod
      ? [
          '',
          `Installing your ${NAV_POD_SHORT_NAME}: ${manualUrl}`,
          'Before you start, please read the safety information in the guide. Never fit any part in or near the path of an airbag, and make sure everything is firmly secured.',
        ]
      : []),
    '',
    'Questions? Just reply to this email, or write to info@fozprints.com.au.',
    `Refund policy: ${SITE_URL}/policies/refund-policy`,
    '',
    `Foz Prints, ABN ${BUSINESS_ABN}. ${GST_NOTE} This email is your receipt.`,
  ].join('\n');

  return { subject, html, text };
}

/* ---------- Sending ---------- */

/**
 * Sends the shop notification and the customer confirmation for one order,
 * each at most once: `orderKey` is the same key used for the stock update, so
 * repeat webhook deliveries never send duplicates. If an email fails, its claim
 * is released and the error is thrown so the webhook is retried.
 */
export async function sendOrderEmailsOnce(orderKey: string, build: () => Promise<OrderSummary>): Promise<void> {
  const ownerKey = `order-email-owner:${orderKey}`;
  const customerKey = `order-email-customer:${orderKey}`;
  const sendOwner = await claimOnce(ownerKey);
  const sendCustomer = await claimOnce(customerKey);
  if (!sendOwner && !sendCustomer) {
    return;
  }

  let order: OrderSummary;
  try {
    order = await build();
  } catch (error) {
    if (sendOwner) await releaseClaim(ownerKey);
    if (sendCustomer) await releaseClaim(customerKey);
    throw error;
  }

  const failures: unknown[] = [];

  if (sendOwner) {
    try {
      await sendEmail({
        to: OWNER_EMAIL,
        replyTo: order.customer.email || undefined,
        fromName: 'Foz Prints Orders',
        fromAddress: ADMIN_FROM_EMAIL,
        ...renderOwnerEmail(order),
      });
    } catch (error) {
      await releaseClaim(ownerKey);
      failures.push(error);
    }
  }

  if (sendCustomer && order.customer.email) {
    try {
      await sendEmail({
        to: order.customer.email,
        replyTo: OWNER_EMAIL,
        fromName: 'Foz Prints',
        fromAddress: ORDERS_FROM_EMAIL,
        ...renderCustomerEmail(order),
      });
    } catch (error) {
      await releaseClaim(customerKey);
      failures.push(error);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Order ${order.orderNumber}: ${failures.length} email(s) failed: ${failures.map(String).join('; ')}`);
  }
}
