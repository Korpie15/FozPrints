import Stripe from 'stripe';
import { Product, ProductVariant } from '@/types/product';
import { stripHtml } from '@/lib/utils';

/**
 * Lazy initializer for Stripe server instance
 */
export function getStripeServer(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch all active products and their prices from Stripe
 */
export async function getProducts(): Promise<Product[]> {
  const stripe = getStripeServer();
  if (!stripe) {
    return [];
  }

  try {
    // 1. Fetch active products
    const productsResponse = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ['data.default_price'],
    });

    // 2. Fetch all active prices so products with multiple variants are supported (if permission granted)
    const pricesByProductId: Record<string, Stripe.Price[]> = {};
    try {
      const pricesResponse = await stripe.prices.list({
        active: true,
        limit: 100,
      });

      for (const price of pricesResponse.data) {
        const prodId = typeof price.product === 'string' ? price.product : price.product.id;
        if (!pricesByProductId[prodId]) {
          pricesByProductId[prodId] = [];
        }
        pricesByProductId[prodId].push(price);
      }
    } catch {
      // If the restricted key doesn't have Prices Read permission, fall back to default_price
    }

    // 3. Map Stripe products into clean Product structures
    const products: Product[] = productsResponse.data.map((prod) => {
      const handle = prod.metadata?.handle || slugify(prod.name) || prod.id;
      const associatedPrices = pricesByProductId[prod.id] || [];

      // Fall back to default_price if no separate prices found in list
      if (associatedPrices.length === 0 && prod.default_price) {
        const defaultPriceObj = prod.default_price as Stripe.Price;
        associatedPrices.push(defaultPriceObj);
      }

      const variants: ProductVariant[] = associatedPrices.map((price) => {
        const unitAmount = price.unit_amount || 0;
        const currency = (price.currency || 'aud').toUpperCase();
        const variantTitle = price.nickname || price.metadata?.title || 'Default';

        return {
          id: price.id,
          title: variantTitle,
          price: {
            amount: (unitAmount / 100).toFixed(2),
            currencyCode: currency,
          },
          priceCents: unitAmount,
          availableForSale: price.active && prod.active,
          image: prod.images[0] ? { url: prod.images[0], altText: prod.name } : undefined,
        };
      });

      const minPrice = variants.length > 0
        ? Math.min(...variants.map((v) => v.priceCents)) / 100
        : 0;

      const currencyCode = variants[0]?.price.currencyCode || 'AUD';

      const images = prod.images.map((url) => ({
        url,
        altText: prod.name,
      }));

      return {
        id: prod.id,
        title: prod.name,
        description: stripHtml(prod.description || ''),
        descriptionHtml: prod.metadata?.descriptionHtml || (prod.description ? `<p>${prod.description}</p>` : ''),
        handle,
        price: minPrice,
        currencyCode,
        images,
        variants,
        metadata: prod.metadata,
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching products from Stripe:', error);
    return [];
  }
}

/**
 * Get a single product by its handle or Stripe product ID
 */
export async function getProduct(handleOrId: string): Promise<Product | null> {
  const products = await getProducts();
  const found = products.find(
    (p) => p.handle.toLowerCase() === handleOrId.toLowerCase() || p.id === handleOrId
  );
  return found || null;
}

/**
 * Get multiple products by their handles
 */
export async function getProductsByHandles(handles: string[]): Promise<Product[]> {
  const products = await getProducts();
  const lowerHandles = handles.map((h) => h.toLowerCase());
  return products.filter(
    (p) => lowerHandles.includes(p.handle.toLowerCase()) || lowerHandles.includes(p.id)
  );
}
