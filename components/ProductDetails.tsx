'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { createCart, addToCart } from '@/lib/shopify';
import '../styles/product-details.css';

interface ProductDetailsProps {
  product: ShopifyProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { cartId, setCartId, setItemCount } = useCartStore();

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    
    setIsAdding(true);
    
    try {
      let currentCartId = cartId;
      
      // Create cart if it doesn't exist
      if (!currentCartId) {
        const newCart = await createCart();
        currentCartId = newCart.id;
        setCartId(newCart.id);
      }

      // Add item to cart
      const updatedCart = await addToCart(currentCartId!, [
        {
          merchandiseId: selectedVariant.id,
          quantity,
        },
      ]);

      // Update cart count
      const totalItems = updatedCart.lines.edges.reduce(
        (sum: number, edge: any) => sum + edge.node.quantity,
        0
      );
      setItemCount(totalItems);

      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const selectedImage = product.images.edges[selectedImageIndex]?.node;
  const totalImages = product.images.edges.length;

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="product-details">
      {/* Product Images */}
      <div className="product-images">
        <div className="product-main-image">
          {selectedImage ? (
            <>
              <Image
                src={selectedImage.url}
                alt={selectedImage.altText || product.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              {totalImages > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="product-image-nav product-image-nav-prev"
                    aria-label="Previous image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="product-image-nav product-image-nav-next"
                    aria-label="Next image"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="product-no-image">
              No image available
            </div>
          )}
        </div>
        
        {/* Additional images */}
        {product.images.edges.length > 1 && (
          <div className="product-thumbnails">
            {product.images.edges.map((edge, index) => (
              <div 
                key={index} 
                className={`product-thumbnail ${index === selectedImageIndex ? 'product-thumbnail-active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={edge.node.url}
                  alt={edge.node.altText || `${product.title} ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h1 className="product-title">
          {product.title}
        </h1>
        
        <div className="product-price-container">
          <span className="product-price">
            {formatPrice(
              selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount,
              selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode
            )}
          </span>
        </div>

        <div className="product-description">
          <div 
            className="product-description-content"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        </div>

        {/* Variants */}
        {product.variants.edges.length > 1 && (
          <div className="product-variants">
            <label>Options</label>
            <select
              onChange={(e) => {
                const variant = product.variants.edges.find(
                  (edge) => edge.node.id === e.target.value
                )?.node;
                if (variant) {
                  setSelectedVariant(variant);
                }
              }}
              value={selectedVariant?.id}
            >
              {product.variants.edges.map((edge) => (
                <option key={edge.node.id} value={edge.node.id}>
                  {edge.node.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity */}
        <div className="product-quantity">
          <label>Quantity</label>
          <div className="quantity-controls">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="quantity-button"
            >
              <Minus size={16} />
            </button>
            <span className="quantity-value">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="quantity-button"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant?.availableForSale}
          className="product-add-to-cart"
        >
          <ShoppingCart size={20} />
          {isAdding ? 'Adding...' : selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
        </button>

        {/* Availability */}
        <div className={`product-availability ${selectedVariant?.availableForSale ? 'product-in-stock' : 'product-out-of-stock'}`}>
          {selectedVariant?.availableForSale ? '✓ In Stock' : '✕ Out of Stock'}
        </div>
      </div>
    </div>
  );
}
