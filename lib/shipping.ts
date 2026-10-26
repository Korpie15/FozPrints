import { CartItem } from '@/types/product';
import { isLaunchKit } from '@/lib/promo';
import { hasKitBundle } from '@/lib/kit';

export interface ProductDimensions {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ShippingQuote {
  serviceCode: string;
  name: string;
  price: number;
  priceCents: number;
  currency: string;
  deliveryEstimate: {
    minimum: number;
    maximum: number;
    unit: 'business_day';
  };
}

// Standard shipping box (BX4 / standard box: fits 1 Pod + 1 Cubby + accessories)
const STANDARD_BOX = {
  lengthCm: 31,
  widthCm: 23,
  heightCm: 15,
  tareWeightGrams: 120,
};

// Small satchel/mailer for accessory-only orders (brackets, plugs, cables)
const SMALL_SATCHEL = {
  lengthCm: 22,
  widthCm: 16,
  heightCm: 5,
  tareWeightGrams: 50,
};

// Physical dead weights for products (grams)
const ITEM_WEIGHTS = {
  pod: 220,
  cubby: 200,
  bracket: 60,
  anderson: 100,
  cable: 80,
  // TODO: placeholder until the cup holder parts are weighed and boxed
  cupHolderPart: 150,
  defaultSmall: 100,
};

/**
 * Estimate parcel dimensions, actual weight, and cubic (volumetric) weight for a cart of items
 * Uses slot-based packing logic:
 * - 1 Dash Pod + 1 Cubby share the same standard box (exterior dimensions do not increase).
 * - Small accessories (T-slot brackets, Anderson mounts, cables) fit into the box cavities for free.
 * - 2 Pods or 2 Cubbies exceed single box capacity and scale into additional boxes.
 * - Accessory-only orders ship in a lightweight satchel/mailer.
 */
export function estimateParcel(items: CartItem[]): {
  totalWeightKg: number;
  cubicWeightKg: number;
  billableWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
} {
  let podCount = 0;
  let cubbyCount = 0;
  let smallItemsCount = 0;
  let itemsWeightGrams = 0;

  for (const item of items) {
    const handleLower = (item.handle || item.title || '').toLowerCase();
    const qty = Math.max(1, item.quantity || 1);

    if (handleLower.includes('pod')) {
      podCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.pod * qty;
    } else if (handleLower.includes('cubby') || handleLower.includes('storage')) {
      cubbyCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.cubby * qty;
    } else if (
      handleLower.includes('bracket') ||
      handleLower.includes('t-slot') ||
      handleLower.includes('tslot')
    ) {
      smallItemsCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.bracket * qty;
    } else if (handleLower.includes('anderson') || handleLower.includes('plug')) {
      smallItemsCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.anderson * qty;
    } else if (handleLower.includes('cup-holder')) {
      smallItemsCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.cupHolderPart * qty;
    } else if (handleLower.includes('cable') || handleLower.includes('wire')) {
      smallItemsCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.cable * qty;
    } else {
      smallItemsCount += qty;
      itemsWeightGrams += ITEM_WEIGHTS.defaultSmall * qty;
    }
  }

  // 1. Accessory-only orders (no Pods, no Cubbies)
  if (podCount === 0 && cubbyCount === 0) {
    const totalWeightGrams = itemsWeightGrams + SMALL_SATCHEL.tareWeightGrams;
    const totalWeightKg = Math.max(0.1, Number((totalWeightGrams / 1000).toFixed(2)));

    // For large quantities of small items (> 4), expand satchel thickness gradually
    const heightCm =
      smallItemsCount > 4
        ? Math.min(12, SMALL_SATCHEL.heightCm + Math.ceil((smallItemsCount - 4) / 4) * 2)
        : SMALL_SATCHEL.heightCm;

    const volumeCm3 = SMALL_SATCHEL.lengthCm * SMALL_SATCHEL.widthCm * heightCm;
    const cubicWeightKg = Number((volumeCm3 / 4000).toFixed(2));
    const billableWeightKg = Math.max(totalWeightKg, cubicWeightKg);

    return {
      totalWeightKg,
      cubicWeightKg,
      billableWeightKg,
      lengthCm: SMALL_SATCHEL.lengthCm,
      widthCm: SMALL_SATCHEL.widthCm,
      heightCm,
    };
  }

  // 2. Large items present (Pod and/or Cubby):
  // One standard box fits: [up to 1 Pod] + [up to 1 Cubby] + [any number of small accessories]
  const boxesNeeded = Math.max(podCount, cubbyCount, 1);

  const totalWeightGrams =
    itemsWeightGrams + STANDARD_BOX.tareWeightGrams * boxesNeeded;
  const totalWeightKg = Math.max(0.2, Number((totalWeightGrams / 1000).toFixed(2)));

  const lengthCm = STANDARD_BOX.lengthCm;
  const widthCm = STANDARD_BOX.widthCm;
  const heightCm = STANDARD_BOX.heightCm * boxesNeeded;

  const totalVolumeCm3 = lengthCm * widthCm * heightCm;
  // Australia Post cubic weight conversion: Volume (cm3) / 4000
  const cubicWeightKg = Number((totalVolumeCm3 / 4000).toFixed(2));
  // Australia Post charges on the greater of actual weight or cubic weight
  const billableWeightKg = Math.max(totalWeightKg, cubicWeightKg);

  return {
    totalWeightKg,
    cubicWeightKg,
    billableWeightKg,
    lengthCm,
    widthCm,
    heightCm,
  };
}

/**
 * Checks whether the cart contains the Nav Pod Kit, which qualifies for
 * LAUNCH50 and free standard domestic shipping.
 */
export function hasFullKit(items: CartItem[]): boolean {
  return items.some((item) => isLaunchKit(item.productId));
}

/** Orders that ship free on Australia Post Standard: the Nav Pod Kit, or a full cup holder bundle */
export function qualifiesForFreeShipping(items: CartItem[]): boolean {
  return hasFullKit(items) || hasKitBundle(items);
}

/**
 * Fetch live rates from Australia Post PAC API with billable weight & item quantity scaling.
 * Orders containing a Full Pod Kit receive Free Standard Shipping.
 */
export async function getLiveShippingQuotes(
  items: CartItem[],
  toPostcode: string = '2000'
): Promise<ShippingQuote[]> {
  const parcel = estimateParcel(items);
  const apiKey = process.env.AUSPOST_API_KEY;
  const fromPostcode = process.env.AUSPOST_FROM_POSTCODE || '3000';
  const freeKitShipping = qualifiesForFreeShipping(items);

  if (apiKey) {
    try {
      const services = [
        {
          code: 'AUS_PARCEL_REGULAR',
          name: freeKitShipping ? 'Australia Post Standard (Free Kit Shipping)' : 'Australia Post Standard',
          estimate: { minimum: 3, maximum: 7, unit: 'business_day' as const },
        },
        {
          code: 'AUS_PARCEL_EXPRESS',
          name: 'Australia Post Express',
          estimate: { minimum: 1, maximum: 3, unit: 'business_day' as const },
        },
      ];

      const results = await Promise.all(
        services.map(async (service) => {
          // If this order qualifies for free kit shipping on Standard, return $0 without query
          if (service.code === 'AUS_PARCEL_REGULAR' && freeKitShipping) {
            return {
              serviceCode: service.code,
              name: service.name,
              price: 0,
              priceCents: 0,
              currency: 'AUD',
              deliveryEstimate: service.estimate,
            };
          }

          const url = new URL(
            'https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json'
          );
          url.searchParams.set('from_postcode', fromPostcode);
          url.searchParams.set('to_postcode', toPostcode);
          url.searchParams.set('length', parcel.lengthCm.toString());
          url.searchParams.set('width', parcel.widthCm.toString());
          url.searchParams.set('height', parcel.heightCm.toString());
          url.searchParams.set('weight', parcel.billableWeightKg.toString());
          url.searchParams.set('service_code', service.code);

          const res = await fetch(url.toString(), {
            headers: {
              'AUTH-KEY': apiKey,
            },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(8000),
          });

          if (!res.ok) {
            throw new Error(`AusPost API returned status ${res.status}`);
          }

          const data = await res.json();
          const totalCost = parseFloat(data.postage_result.total_cost);

          return {
            serviceCode: service.code,
            name: service.name,
            price: totalCost,
            priceCents: Math.round(totalCost * 100),
            currency: 'AUD',
            deliveryEstimate: service.estimate,
          };
        })
      );

      return results;
    } catch (err) {
      console.warn('AusPost live calculation failed, using tiered fallback rates:', err);
    }
  }

  // Tiered fallback rates based on billable weight (greater of actual vs cubic weight)
  const billable = parcel.billableWeightKg;

  let standardPrice: number;
  let expressPrice: number;

  if (billable <= 0.5) {
    // Light item (e.g. 1 cable router)
    standardPrice = 10.95;
    expressPrice = 14.95;
  } else if (billable <= 1.5) {
    // 1 Medium item
    standardPrice = 14.50;
    expressPrice = 18.50;
  } else if (billable <= 3.5) {
    // 1 Large item or 2 Medium items (e.g. 1 Pod)
    standardPrice = 18.25;
    expressPrice = 24.95;
  } else if (billable <= 6.0) {
    // 2 Large items (e.g. 2 Pods)
    standardPrice = 24.95;
    expressPrice = 32.95;
  } else {
    // 3+ Large items
    const extraKg = Math.ceil(billable - 6.0);
    standardPrice = 24.95 + extraKg * 4.0;
    expressPrice = 32.95 + extraKg * 6.0;
  }

  if (freeKitShipping) {
    standardPrice = 0;
  }

  return [
    {
      serviceCode: 'AUS_PARCEL_REGULAR',
      name: freeKitShipping ? 'Australia Post Standard (Free Kit Shipping)' : 'Australia Post Standard',
      price: standardPrice,
      priceCents: Math.round(standardPrice * 100),
      currency: 'AUD',
      deliveryEstimate: { minimum: 3, maximum: 7, unit: 'business_day' },
    },
    {
      serviceCode: 'AUS_PARCEL_EXPRESS',
      name: 'Australia Post Express',
      price: expressPrice,
      priceCents: Math.round(expressPrice * 100),
      currency: 'AUD',
      deliveryEstimate: { minimum: 1, maximum: 3, unit: 'business_day' },
    },
  ];
}
