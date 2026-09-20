import { CartItem } from '@/types/product';

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

// Known physical specs for Subaru Forester 3D printed parts
const KNOWN_SPECS: Record<string, ProductDimensions> = {
  pod: {
    weightGrams: 200,
    lengthCm: 26.5,
    widthCm: 25.5,
    heightCm: 14.5,
  },
  cubby: {
    weightGrams: 200,
    lengthCm: 26.5,
    widthCm: 25.5,
    heightCm: 14.5,
  },
  anderson: {
    weightGrams: 100,
    lengthCm: 15,
    widthCm: 11,
    heightCm: 4.1,
  },
  cable: {
    weightGrams: 100,
    lengthCm: 15,
    widthCm: 11,
    heightCm: 1,
  },
};

/**
 * Estimate parcel dimensions, actual weight, and cubic (volumetric) weight for a cart of items
 */
export function estimateParcel(items: CartItem[]): {
  totalWeightKg: number;
  cubicWeightKg: number;
  billableWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
} {
  let totalWeightGrams = 100; // 100g base packaging/box weight
  let totalVolumeCm3 = 0;

  for (const item of items) {
    const handleLower = (item.handle || item.title || '').toLowerCase();
    let spec: ProductDimensions = {
      weightGrams: 150,
      lengthCm: 15,
      widthCm: 10,
      heightCm: 5,
    };

    if (handleLower.includes('pod')) {
      spec = KNOWN_SPECS.pod;
    } else if (handleLower.includes('cubby') || handleLower.includes('storage')) {
      spec = KNOWN_SPECS.cubby;
    } else if (handleLower.includes('anderson') || handleLower.includes('plug')) {
      spec = KNOWN_SPECS.anderson;
    } else if (handleLower.includes('cable') || handleLower.includes('wire')) {
      spec = KNOWN_SPECS.cable;
    }

    const qty = Math.max(1, item.quantity || 1);
    totalWeightGrams += spec.weightGrams * qty;
    totalVolumeCm3 += spec.lengthCm * spec.widthCm * spec.heightCm * qty;
  }

  const totalWeightKg = Math.max(0.1, Number((totalWeightGrams / 1000).toFixed(2)));
  // Australia Post cubic weight conversion: Volume (cm3) / 4000
  const cubicWeightKg = Number((totalVolumeCm3 / 4000).toFixed(2));
  // Australia Post charges on the greater of actual weight or cubic weight
  const billableWeightKg = Math.max(totalWeightKg, cubicWeightKg);

  // Select packaging dimensions based on billable cubic weight and volume
  let lengthCm = 22;
  let widthCm = 16;
  let heightCm = 8;

  if (billableWeightKg <= 0.5 && totalVolumeCm3 <= 2800) {
    lengthCm = 22; widthCm = 16; heightCm = 8;
  } else if (billableWeightKg <= 1.5 && totalVolumeCm3 <= 5500) {
    lengthCm = 24; widthCm = 19; heightCm = 12;
  } else if (billableWeightKg <= 3.5 && totalVolumeCm3 <= 10500) {
    lengthCm = 31; widthCm = 22; heightCm = 15;
  } else {
    lengthCm = 40; widthCm = 30; heightCm = Math.min(50, Math.ceil(totalVolumeCm3 / 1200));
  }

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
 * Fetch live rates from Australia Post PAC API with billable weight & item quantity scaling
 */
export async function getLiveShippingQuotes(
  items: CartItem[],
  toPostcode: string = '2000'
): Promise<ShippingQuote[]> {
  const parcel = estimateParcel(items);
  const apiKey = process.env.AUSPOST_API_KEY;
  const fromPostcode = process.env.AUSPOST_FROM_POSTCODE || '3000';

  if (apiKey) {
    try {
      const services = [
        {
          code: 'AUS_PARCEL_REGULAR',
          name: 'Australia Post Standard',
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

  return [
    {
      serviceCode: 'AUS_PARCEL_REGULAR',
      name: 'Australia Post Standard',
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
