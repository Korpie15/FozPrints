export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  descriptionHtml?: string;
  handle: string;
  price: number;
  currencyCode: string;
  images: ProductImage[];
  variants: ProductVariant[];
  metadata?: Record<string, string>;
}

export interface ProductImage {
  url: string;
  altText: string | null;
}

export interface ProductVariant {
  id: string; // Stripe Price ID (price_...)
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  priceCents: number;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
  image?: ProductImage;
}

export interface CartItem {
  id: string; // Stripe Price ID
  productId: string; // Stripe Product ID
  title: string;
  variantTitle?: string;
  price: number;
  priceCents: number;
  currencyCode: string;
  image?: string;
  handle: string;
  quantity: number;
  maxQuantity?: number;
  /** Text to engrave (e.g. a name), for products that allow it */
  personalisation?: string;
  /** Handle of the kit this part belongs to, and its role in it (e.g. 'arm') */
  kit?: string;
  componentType?: string;
}
