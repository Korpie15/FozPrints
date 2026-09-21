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

      let variants: ProductVariant[] = associatedPrices.map((price, priceIndex) => {
        const unitAmount = price.unit_amount || 0;
        const currency = (price.currency || 'aud').toUpperCase();
        const variantTitle = price.nickname || price.metadata?.title || (priceIndex === 0 ? 'Smooth' : 'Textured');
        const stockCount = inventoryMap[price.id] ?? 0;
        const availableForSale = Boolean(price.active && prod.active && stockCount > 0);

        const titleLower = variantTitle.toLowerCase();
        let variantImageUrl: string | undefined;

        if (titleLower.includes('smooth') && prod.images[0]) {
          variantImageUrl = prod.images[0];
        } else if (titleLower.includes('textured') && prod.images[2]) {
          variantImageUrl = prod.images[2];
        } else {
          variantImageUrl =
            price.metadata?.image_url ||
            (price.metadata?.image_index !== undefined ? prod.images[parseInt(price.metadata.image_index)] : undefined);
        }

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

      // Sort variants so 'Smooth' is first (default variant)
      variants.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        if (aTitle.includes('smooth') && !bTitle.includes('smooth')) return -1;
        if (!aTitle.includes('smooth') && bTitle.includes('smooth')) return 1;
        return 0;
      });

      const minPrice = variants.length > 0
        ? Math.min(...variants.map((v) => v.priceCents)) / 100
        : 0;

      const currencyCode = variants[0]?.price.currencyCode || 'AUD';

      const images = prod.images.map((url, i) => {
        let altText = prod.name;
        if (prod.images.length === 8) {
          if (i === 0 || i === 1) {
            altText = `${prod.name} - Smooth`;
          } else if (i === 2 || i === 3) {
            altText = `${prod.name} - Textured`;
          }
        } else {
          const matchingVariant = variants[i];
          if (matchingVariant && matchingVariant.title !== 'Default') {
            altText = `${prod.name} - ${matchingVariant.title}`;
          }
        }
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
