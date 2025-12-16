import Link from 'next/link';
import Image from 'next/image';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import '../styles/product-card.css';

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;

  return (
    <Link href={`/products/${product.handle}`} className="product-card">
      <div className="product-card-image">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            No image
          </div>
        )}
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-description">{product.description}</p>

        <div className="product-card-footer">
          <span className="product-card-price">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
          <button className="product-card-button">
            View
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
