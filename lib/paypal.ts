import { CartItem } from '@/types/product';
import { getInventoryMap, decrementInventoryOnce, getPayPalOrder, savePayPalOrder } from '@/lib/db';
import { getLiveShippingQuotes, hasFullKit } from '@/lib/shipping';
import { CheckoutError, assertInStock, shippingShortfall } from '@/lib/cart';
import { isLaunchOfferAvailable } from '@/lib/promo-server';
import { isLaunchKit } from '@/lib/promo';
import { buildPayPalOrderSummary, sendOrderEmailsOnce } from '@/lib/order-email';

function getPayPalBaseUrl() {
  const env = process.env.PAYPAL_ENVIRONMENT || 'live';
  return env === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

export function getPayPalCredentials() {
  const clientId =
    process.env.PAYPAL_CLIENT_ID ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET ||
    process.env.PAYPAL_SECRET;

  return { clientId, clientSecret };
}

/**
 * Retrieves an OAuth 2.0 access token from PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getPayPalCredentials();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal Client ID or Secret is not configured.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate with PayPal: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Creates a PayPal Order with cart line items, AusPost shipping, and LAUNCH50 coupon validation.
 * Items must come from resolveCart; shipping is quoted here, never taken from the client.
 */
export async function createPayPalOrderService(params: {
  items: CartItem[];
  toPostcode: string;
  serviceCode?: string;
  promoCode?: string;
}) {
  const { items, toPostcode, serviceCode, promoCode } = params;
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  // Verify stock in Neon before allowing order creation
  const inventoryMap = await getInventoryMap();
  assertInStock(items, inventoryMap);

  const quotes = await getLiveShippingQuotes(items, toPostcode);
  const quote = quotes.find((q) => q.serviceCode === serviceCode) ?? quotes[0];

  // Work in cents so the breakdown always adds up exactly
  const itemTotalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const shippingCents = quote.priceCents;

  // LAUNCH50 matches the Stripe coupon: $50 off the kit, once per order, while
  // redemptions remain (PayPal uses count toward the same cap of 10)
  let discountCents = 0;
  if (promoCode && promoCode.trim().toUpperCase() === 'LAUNCH50' && hasFullKit(items)) {
    if (!(await isLaunchOfferAvailable())) {
      throw new CheckoutError('The LAUNCH50 offer has ended. Please remove the code and try again.');
    }
    const kitCents = items
      .filter((item) => isLaunchKit(item.productId))
      .reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    discountCents = Math.min(5000, kitCents);
  }

  const totalCents = itemTotalCents + shippingCents - discountCents;
  if (totalCents <= 0) {
    throw new CheckoutError('This order total cannot be paid with PayPal.');
  }
  const toValue = (cents: number) => (cents / 100).toFixed(2);

  // Map PayPal line items
  const paypalItems = items.map((item) => ({
    name: [
      item.variantTitle && item.variantTitle !== 'Default' ? `${item.title} - ${item.variantTitle}` : item.title,
      item.personalisation ? `Name: ${item.personalisation}` : '',
    ]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 127),
    sku: item.id,
    unit_amount: {
      currency_code: 'AUD',
      value: toValue(item.priceCents),
    },
    quantity: item.quantity.toString(),
    category: 'PHYSICAL_GOODS',
  }));

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: 'Foz Prints 3D printed parts order',
        items: paypalItems,
        amount: {
          currency_code: 'AUD',
          value: toValue(totalCents),
          breakdown: {
            item_total: {
              currency_code: 'AUD',
              value: toValue(itemTotalCents),
            },
            shipping: {
              currency_code: 'AUD',
              value: toValue(shippingCents),
            },
            ...(discountCents > 0
              ? {
                  discount: {
                    currency_code: 'AUD',
                    value: toValue(discountCents),
                  },
                }
              : {}),
          },
        },
      },
    ],
    application_context: {
      brand_name: 'Foz Prints',
      shipping_preference: 'GET_FROM_FILE',
      user_action: 'PAY_NOW',
    },
  };

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(`Failed to create PayPal order: ${errorJson?.message || response.status}`);
  }

  const order = await response.json();

  // Remember exactly what this order charges; capture refuses orders we didn't record
  await savePayPalOrder(order.id, {
    lines: items.map((item) => ({ priceId: item.id, quantity: item.quantity, personalisation: item.personalisation })),
    amount: toValue(totalCents),
    postcode: toPostcode,
    serviceCode: quote.serviceCode,
    shippingCents,
    discountCents,
  });

  return { id: order.id };
}

/**
 * Captures an approved PayPal order and deducts inventory from Neon.
 * Only orders created by createPayPalOrderService are accepted, and stock is
 * deducted from the recorded order, never from the client's cart.
 */
export async function capturePayPalOrderService(orderId: string) {
  // PayPal Order IDs are alphanumeric; anything else could rewrite the API path
  if (!/^[A-Za-z0-9]{1,64}$/.test(orderId)) {
    throw new CheckoutError('Invalid PayPal order.');
  }

  const recorded = await getPayPalOrder(orderId);
  if (!recorded) {
    throw new CheckoutError('We could not find this order. Please try checking out again.');
  }

  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  // Shipping was quoted for the cart's postcode; check the address the buyer chose in PayPal
  const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const order = await orderResponse.json().catch(() => null);
  if (!orderResponse.ok) {
    console.error('PayPal order lookup failed:', orderResponse.status, JSON.stringify(order));
    throw new CheckoutError('PayPal payment could not be captured. Please try again.');
  }

  const address = order?.purchase_units?.[0]?.shipping?.address;
  if (address?.country_code !== 'AU' || typeof address?.postal_code !== 'string') {
    throw new CheckoutError('We currently ship within Australia only. Please choose an Australian address in PayPal.');
  }
  if (address.postal_code !== recorded.postcode) {
    const shortfall = await shippingShortfall(
      recorded.lines,
      recorded.serviceCode,
      address.postal_code,
      recorded.shippingCents
    );
    if (shortfall > 0) {
      throw new CheckoutError(
        `Shipping to ${address.postal_code} costs more than the quote for ${recorded.postcode}. ` +
          `Enter ${address.postal_code} as your postcode in the cart, then pay again. You have not been charged.`
      );
    }
  }

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  const captureData = await response.json().catch(() => null);

  if (!response.ok || captureData?.status !== 'COMPLETED') {
    console.error('PayPal capture failed:', response.status, JSON.stringify(captureData));
    throw new CheckoutError('PayPal payment could not be captured. Please try again.');
  }

  const warnings: string[] = [];
  const captured = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
  if (captured?.currency_code !== 'AUD' || captured?.value !== recorded.amount) {
    // Money has already moved, so flag it for a manual check rather than failing the buyer
    const note = `PayPal captured ${captured?.value} ${captured?.currency_code}, but the order was for ${recorded.amount} AUD`;
    console.error(`PayPal order ${orderId}: ${note}`);
    warnings.push(note);
  }

  // Deduct inventory from Neon exactly once using the PayPal Order ID as idempotency key.
  // If this fails, the PAYMENT.CAPTURE.COMPLETED webhook retries it.
  try {
    await decrementInventoryOnce(`paypal_${orderId}`, recorded.lines);
  } catch (dbErr) {
    console.error(`PayPal order ${orderId}: failed to decrement Neon inventory:`, dbErr);
  }

  // Order emails. Never fail the buyer's payment over these: if they fail here,
  // the PAYMENT.CAPTURE.COMPLETED webhook sends whichever didn't go out
  try {
    await sendOrderEmailsOnce(`paypal_${orderId}`, () =>
      buildPayPalOrderSummary(orderId, recorded, captureData, warnings)
    );
  } catch (emailErr) {
    console.error(`PayPal order ${orderId}: failed to send order emails:`, emailErr);
  }

  return { id: orderId };
}

/** PayPal's copy of an order: who paid, the delivery address and the capture */
export async function getPayPalOrderDetails(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`PayPal order lookup failed: ${response.status}`);
  }
  return response.json();
}

/**
 * True when an order our server created has been paid in PayPal.
 */
export async function isPayPalOrderPaid(orderId: string): Promise<boolean> {
  if (!/^[A-Za-z0-9]{1,64}$/.test(orderId) || !(await getPayPalOrder(orderId))) {
    return false;
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    return false;
  }

  const order = await response.json();
  return order.status === 'COMPLETED';
}

/**
 * Asks PayPal whether a webhook delivery really came from PayPal.
 */
export async function verifyPayPalWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error('PAYPAL_WEBHOOK_ID is not configured.');
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal webhook verification request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}
