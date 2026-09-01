'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Toast } from './Toast';
import '../styles/product-details.css';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      id: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: parseFloat(selectedVariant.price.amount),
      priceCents: selectedVariant.priceCents,
      currencyCode: selectedVariant.price.currencyCode,
      image: selectedVariant.image?.url || product.images[0]?.url,
      handle: product.handle,
      quantity,
    });

    setShowToast(true);
  };

  const selectedImage = product.images[selectedImageIndex];
  const totalImages = product.images.length;

  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  const isAvailable = selectedVariant ? selectedVariant.availableForSale : true;

  return (
    <>
      {showToast && (
        <Toast
          message="Item added to cart!"
          onClose={() => setShowToast(false)}
        />
      )}
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

          {/* Thumbnails */}
          {totalImages > 1 && (
            <div className="product-thumbnails">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className={`product-thumbnail ${index === selectedImageIndex ? 'product-thumbnail-active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.title} ${index + 1}`}
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
                selectedVariant?.price.amount || product.price.toString(),
                selectedVariant?.price.currencyCode || product.currencyCode
              )}
            </span>
          </div>

          {/* Variants Selector */}
          {product.variants.length > 1 && (
            <div className="product-variants">
              <label>Options</label>
              <select
                onChange={(e) => {
                  const variant = product.variants.find((v) => v.id === e.target.value);
                  if (variant) {
                    setSelectedVariant(variant);
                    if (variant.image) {
                      const imageIndex = product.images.findIndex((img) => img.url === variant.image?.url);
                      if (imageIndex !== -1) {
                        setSelectedImageIndex(imageIndex);
                      }
                    }
                  }
                }}
                value={selectedVariant?.id}
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="product-description">
            {product.descriptionHtml ? (
              <div
                className="product-description-content"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            ) : (
              <p className="product-description-content">{product.description}</p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="product-quantity">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="quantity-button"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="quantity-value">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="quantity-button"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="product-add-to-cart"
          >
            <ShoppingCart size={20} />
            {!isAvailable ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Availability badge */}
          <div className={`product-availability ${isAvailable ? 'product-in-stock' : 'product-out-of-stock'}`}>
            {isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
          </div>
        </div>
      </div>
    </>
  );
}
