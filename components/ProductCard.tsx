'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { addToCart } from '@/lib/shopify';
import { useCartStore } from '@/lib/store';
import '../styles/product-card.css';

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const [isAdding, setIsAdding] = useState(false);
  const { cartId, setCartId, setItemCount } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      const firstVariantId = product.variants.edges[0]?.node.id;
      if (!firstVariantId || !cartId) return;

      const updatedCart = await addToCart(cartId, [
        { merchandiseId: firstVariantId, quantity: 1 },
      ]);

      setCartId(updatedCart.id);
      const totalItems = updatedCart.lines.edges.reduce(
        (sum: number, edge: any) => sum + edge.node.quantity,
        0
      );
      setItemCount(totalItems);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

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
          <div className="product-card-actions">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="product-card-button product-card-button-cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button className="product-card-button">
              View
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
