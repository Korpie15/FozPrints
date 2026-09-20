import Stripe from 'stripe';
import { Product, ProductVariant } from '@/types/product';
import { stripHtml } from '@/lib/utils';
import { getInventoryMap } from '@/lib/db';

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
    // 1. Fetch active products and live inventory from Neon in parallel
    const [productsResponse, inventoryMap] = await Promise.all([
      stripe.products.list({
        active: true,
        limit: 100,
        expand: ['data.default_price'],
      }),
      getInventoryMap(),
    ]);

    // 2. Fetch all active prices so products with multiple variants are supported
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
      // Fallback if price list fails
    }

    // 3. Map Stripe products into clean Product structures
    const products: Product[] = productsResponse.data.map((prod) => {
      const handle = prod.metadata?.handle || slugify(prod.name) || prod.id;
      const associatedPrices = pricesByProductId[prod.id] || [];

      if (associatedPrices.length === 0 && prod.default_price) {
        const defaultPriceObj = prod.default_price as Stripe.Price;
        associatedPrices.push(defaultPriceObj);
      }

      const variants: ProductVariant[] = associatedPrices.map((price, priceIndex) => {
        const unitAmount = price.unit_amount || 0;
        const currency = (price.currency || 'aud').toUpperCase();
        const variantTitle = price.nickname || price.metadata?.title || (priceIndex === 0 ? 'Textured' : 'Smooth');
        const stockCount = inventoryMap[price.id] ?? 0;
        const availableForSale = Boolean(price.active && prod.active && stockCount > 0);

        // Map variant image by metadata, image_index, priceIndex, or fallback
        const variantImageUrl =
          price.metadata?.image_url ||
          (price.metadata?.image_index !== undefined ? prod.images[parseInt(price.metadata.image_index)] : undefined) ||
          prod.images[priceIndex] ||
          prod.images[0];

        return {
          id: price.id,
          title: variantTitle,
          price: {
            amount: (unitAmount / 100).toFixed(2),
            currencyCode: currency,
          },
          priceCents: unitAmount,
          availableForSale,
          quantityAvailable: stockCount,
          image: variantImageUrl ? { url: variantImageUrl, altText: `${prod.name} - ${variantTitle}` } : undefined,
        };
      });

      const minPrice = variants.length > 0
        ? Math.min(...variants.map((v) => v.priceCents)) / 100
        : 0;

      const currencyCode = variants[0]?.price.currencyCode || 'AUD';

      const images = prod.images.map((url, i) => {
        const matchingVariant = variants[i];
        const altText = matchingVariant && matchingVariant.title !== 'Default'
          ? `${prod.name} - ${matchingVariant.title}`
          : prod.name;
        return {
          url,
          altText,
        };
      });

      const shortDescription =
        prod.metadata?.short_description ||
        prod.metadata?.shortDescription ||
        prod.metadata?.summary ||
        (prod.description ? prod.description.split(/\n/)[0] : '');

      return {
        id: prod.id,
        title: prod.name,
        description: prod.description || '',
        shortDescription,
        descriptionHtml: prod.metadata?.descriptionHtml || '',
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
