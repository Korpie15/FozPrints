import Stripe from 'stripe';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Product, ProductVariant } from '@/types/product';
import { getInventoryMap } from '@/lib/db';

/**
 * Lazy initializer for Stripe server instance
 */
export function getStripeServer(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  // Fail fast rather than hanging a request for the SDK's long default timeout
  return new Stripe(key, { timeout: 20_000, maxNetworkRetries: 2 });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const CATALOGUE_CACHE_TAG = 'catalogue';
const CATALOGUE_REVALIDATE_SECONDS = 60;

/**
 * Fetch all active products and their prices from Stripe.
 * Stock is NOT applied here (variants come back with 0 stock); see getProducts.
 * Throws on failure so a bad result is never stored in the cache.
 */
async function fetchCatalogue(): Promise<Product[]> {
  const stripe = getStripeServer();
  if (!stripe) {
    return [];
  }

  // 1. Fetch active products
  const productsResponse = await stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price'],
  });

  // 2. Fetch all active prices so products with multiple variants are supported
  const pricesByProductId: Record<string, Stripe.Price[]> = {};
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
        availableForSale: false,
        quantityAvailable: 0,
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
}

const getCachedCatalogue = unstable_cache(fetchCatalogue, ['stripe-catalogue'], {
  revalidate: CATALOGUE_REVALIDATE_SECONDS,
  tags: [CATALOGUE_CACHE_TAG],
});

/**
 * All active products. The Stripe catalogue is cached for a short time;
 * stock is always read live from Neon so availability stays accurate.
 * Wrapped in React cache() so metadata + page share one result per request.
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  try {
    const [catalogue, inventoryMap] = await Promise.all([
      getCachedCatalogue(),
      // If the DB is down, still show the catalogue but mark everything unavailable
      getInventoryMap().catch((error) => {
        console.error('Failed to query inventory from Neon:', error);
        return {} as Record<string, number>;
      }),
    ]);

    return catalogue.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => {
        const stockCount = inventoryMap[variant.id] ?? 0;
        return {
          ...variant,
          availableForSale: stockCount > 0,
          quantityAvailable: stockCount,
        };
      }),
    }));
  } catch (error) {
    console.error('Error fetching products from Stripe:', error);
    return [];
  }
});

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
