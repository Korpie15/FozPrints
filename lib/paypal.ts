import { CartItem } from '@/types/product';
import { getInventoryMap, decrementInventoryOnce } from '@/lib/db';
import { hasFullKit } from '@/lib/shipping';

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
 * Creates a PayPal Order with cart line items, AusPost shipping, and LAUNCH50 coupon validation
 */
export async function createPayPalOrderService(params: {
  items: CartItem[];
  shippingCost: number;
  promoCode?: string;
}) {
  const { items, shippingCost, promoCode } = params;
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  // Verify stock in Neon before allowing order creation
  const inventoryMap = await getInventoryMap();
  for (const item of items) {
    const stock = inventoryMap[item.id] ?? 0;
    if (item.quantity > stock) {
      const itemLabel = item.variantTitle && item.variantTitle !== 'Default'
        ? `${item.title} (${item.variantTitle})`
        : item.title;
      throw new Error(
        stock <= 0
          ? `"${itemLabel}" is out of stock.`
          : `Only ${stock} units available for "${itemLabel}". Please update your cart.`
      );
    }
  }

  // Calculate subtotal
  const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check if LAUNCH50 applies
  let discountAmount = 0;
  if (promoCode && promoCode.trim().toUpperCase() === 'LAUNCH50' && hasFullKit(items)) {
    discountAmount = 50.00;
  }

  // Calculate final total (minimum 0.01)
  const finalTotal = Math.max(0.01, itemTotal + shippingCost - discountAmount);

  // Map PayPal line items
  const paypalItems = items.map((item) => ({
    name: (item.variantTitle && item.variantTitle !== 'Default'
      ? `${item.title} - ${item.variantTitle}`
      : item.title
    ).slice(0, 127),
    unit_amount: {
      currency_code: 'AUD',
      value: item.price.toFixed(2),
    },
    quantity: item.quantity.toString(),
    category: 'PHYSICAL_GOODS',
  }));

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: 'FozPrints Subaru 3D Printed Parts Order',
        items: paypalItems,
        amount: {
          currency_code: 'AUD',
          value: finalTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'AUD',
              value: itemTotal.toFixed(2),
            },
            shipping: {
              currency_code: 'AUD',
              value: shippingCost.toFixed(2),
            },
            ...(discountAmount > 0
              ? {
                  discount: {
                    currency_code: 'AUD',
                    value: discountAmount.toFixed(2),
                  },
                }
              : {}),
          },
        },
      },
    ],
    application_context: {
      brand_name: 'FozPrints',
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
    const errorJson = await response.json();
    throw new Error(errorJson?.message || 'Failed to create PayPal order.');
  }

  const order = await response.json();
  return { id: order.id };
}

/**
 * Captures an approved PayPal order and deducts inventory from Neon
 */
export async function capturePayPalOrderService(orderId: string, items: CartItem[]) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
  });

  const captureData = await response.json();

  if (!response.ok || captureData.status !== 'COMPLETED') {
    const errorMsg =
      captureData?.details?.[0]?.description ||
      captureData?.message ||
      'PayPal payment could not be captured.';
    throw new Error(errorMsg);
  }

  // Deduct inventory from Neon exactly once using the PayPal Order ID as idempotency key
  try {
    const lines = items.map((item) => ({
      priceId: item.id,
      quantity: item.quantity,
    }));
    await decrementInventoryOnce(`paypal_${orderId}`, lines);
  } catch (dbErr) {
    console.error('Failed to decrement Neon inventory for PayPal order:', dbErr);
  }

  return captureData;
}
