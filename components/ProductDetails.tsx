'use client';

import { useEffect, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { formatPrice, formatDescriptionToHtml } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { Toast } from './Toast';
import '../styles/product-details.css';

interface ProductDetailsProps {
  product: Product;
}

const MAIN_IMAGE_SIZES = '(max-width: 768px) 100vw, 50vw';

/** Starts downloading an image at the size the main gallery slot will request. */
function preloadMainImage(url: string) {
  const { props } = getImageProps({ src: url, alt: '', fill: true, sizes: MAIN_IMAGE_SIZES });
  const img = new window.Image();
  img.sizes = MAIN_IMAGE_SIZES;
  img.srcset = props.srcSet || '';
  img.src = props.src;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const { addItem } = useCartStore();

  // Warm the browser and image caches so switching variants/photos is instant.
  // Variant photos go first; the rest of the gallery follows once the page is idle.
  useEffect(() => {
    const variantUrls = product.variants.flatMap((v) => (v.image?.url ? [v.image.url] : []));
    const otherUrls = product.images.map((img) => img.url).filter((url) => !variantUrls.includes(url));

    [...new Set(variantUrls)].forEach(preloadMainImage);

    const timer = window.setTimeout(() => otherUrls.forEach(preloadMainImage), 1500);
    return () => window.clearTimeout(timer);
  }, [product]);

  // Helper to find variant matching an image index
  const findVariantForImage = (imageIndex: number): ProductVariant | undefined => {
    const img = product.images[imageIndex];
    if (!img || product.variants.length <= 1) return undefined;

    // 1. Direct image URL match
    const directMatch = product.variants.find((v) => v.image?.url === img.url);
    if (directMatch) return directMatch;

    // 2. Keyword match against alt text or image filename (e.g. textured vs smooth)
    const altLower = (img.altText || '').toLowerCase();
    const urlLower = img.url.toLowerCase();

    const keywordMatch = product.variants.find((v) => {
      const titleLower = (v.title || '').toLowerCase();
      if (!titleLower || titleLower === 'default') return false;
      return (
        (titleLower.includes('textured') && (altLower.includes('textured') || urlLower.includes('textured'))) ||
        (titleLower.includes('smooth') && (altLower.includes('smooth') || urlLower.includes('smooth')))
      );
    });
    if (keywordMatch) return keywordMatch;

    return undefined;
  };

  // Helper to find image index matching a variant
  const findImageForVariant = (variant: ProductVariant): number => {
    // 1. Check direct image URL match
    if (variant.image?.url) {
      const idx = product.images.findIndex((img) => img.url === variant.image?.url);
      if (idx !== -1) return idx;
    }

    // 2. Keyword match by variant title (e.g. "textured", "smooth") against altText or filename
    if (variant.title && variant.title.toLowerCase() !== 'default') {
      const titleLower = variant.title.toLowerCase();
      const idx = product.images.findIndex((img) => {
        const altLower = (img.altText || '').toLowerCase();
        const urlLower = img.url.toLowerCase();
        return (
          (titleLower.includes('textured') && (altLower.includes('textured') || urlLower.includes('textured'))) ||
          (titleLower.includes('smooth') && (altLower.includes('smooth') || urlLower.includes('smooth')))
        );
      });
      if (idx !== -1) return idx;
    }

    return -1;
  };

  // When user selects a different image (via thumbnail or nav arrow)
  const handleImageSelect = (newIndex: number) => {
    setSelectedImageIndex(newIndex);
    const matchingVariant = findVariantForImage(newIndex);
    if (matchingVariant && matchingVariant.id !== selectedVariant?.id) {
      setSelectedVariant(matchingVariant);
      const stock = matchingVariant.quantityAvailable ?? 1;
      setQuantity((prev) => Math.min(Math.max(1, prev), Math.max(1, stock)));
    }
  };

  // When user selects a different variant from dropdown
  const handleVariantSelect = (variantId: string) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;

    setSelectedVariant(variant);
    const stock = variant.quantityAvailable ?? 1;
    setQuantity((prev) => Math.min(Math.max(1, prev), Math.max(1, stock)));

    const imageIndex = findImageForVariant(variant);
    if (imageIndex !== -1) {
      setSelectedImageIndex(imageIndex);
    }
  };

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
      image: selectedVariant.image?.url || product.images[selectedImageIndex]?.url || product.images[0]?.url,
      handle: product.handle,
      quantity,
      maxQuantity: selectedVariant.quantityAvailable,
    });

    setShowToast(true);
  };

  const selectedImage = product.images[selectedImageIndex] || product.images[0];
  const totalImages = product.images.length;

  const goToPreviousImage = () => {
    const prevIndex = selectedImageIndex === 0 ? totalImages - 1 : selectedImageIndex - 1;
    handleImageSelect(prevIndex);
  };

  const goToNextImage = () => {
    const nextIndex = selectedImageIndex === totalImages - 1 ? 0 : selectedImageIndex + 1;
    handleImageSelect(nextIndex);
  };

  const isAvailable = Boolean(selectedVariant?.availableForSale);
  const maxQuantity = selectedVariant?.quantityAvailable ?? 1;

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
                  alt={selectedImage.altText || `${product.title} - ${selectedVariant?.title || 'View'}`}
                  fill
                  sizes={MAIN_IMAGE_SIZES}
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
                  onClick={() => handleImageSelect(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.title} view ${index + 1}`}
                    fill
                    sizes="100px"
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
              <label htmlFor="variant-select">Options</label>
              <select
                id="variant-select"
                onChange={(e) => handleVariantSelect(e.target.value)}
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
            <div
              className="product-description-content"
              dangerouslySetInnerHTML={{
                __html: formatDescriptionToHtml(product.descriptionHtml || product.description),
              }}
            />
          </div>

          {/* Quantity Controls */}
          <div className="product-quantity">
            <label>Quantity</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!isAvailable || quantity <= 1}
                className="quantity-button"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="quantity-value">
                {isAvailable ? quantity : 0}
              </span>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={!isAvailable || quantity >= maxQuantity}
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

          {/* Out of Stock badge */}
          {!isAvailable && (
            <div className="product-availability product-out-of-stock">
              ✕ Out of Stock
            </div>
          )}
        </div>
      </div>
    </>
  );
}
