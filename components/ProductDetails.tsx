'use client';

import { useEffect, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, BookOpen, ChevronDown, CheckCircle2, Truck, Sparkles, Globe } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { formatPrice, formatDescriptionToHtml } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { isNavPodProduct, NAV_POD_FAQS } from '@/lib/product-seo';
import { openInternationalWaitlist } from './InternationalInterestModal';
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { addItem } = useCartStore();
  const isNavPod = isNavPodProduct(product);
  const handleLower = (product.handle || '').toLowerCase();
  const titleLower = (product.title || '').toLowerCase();
  const isFullKit =
    handleLower.includes('upgrade-kit') ||
    handleLower.includes('pod-kit') ||
    titleLower.includes('upgrade kit') ||
    product.id === 'prod_VB8PtVP327MDhq';
  const isModularComponent = !isFullKit && isNavPod;

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
            {isNavPod ? 'Subaru Forester SG Double DIN Nav Pod Kit (2003–2008) – USDM Spec' : product.title}
          </h1>

          <div className="product-price-container">
            <span className="product-price">
              {formatPrice(
                selectedVariant?.price.amount || product.price.toString(),
                selectedVariant?.price.currencyCode || product.currencyCode
              )}
            </span>
          </div>

          {isFullKit && (
            <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#34d399',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Truck size={17} style={{ flexShrink: 0 }} />
                <span>FREE Standard Australia-Wide Shipping Included</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: 'rgba(2, 132, 199, 0.12)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#7dd3fc',
                  fontSize: '0.85rem',
                }}
              >
                <Sparkles size={16} style={{ color: '#fde047', flexShrink: 0 }} />
                <span>
                  <strong>Launch Special:</strong> Use code <code style={{ backgroundColor: '#ffffff', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontWeight: 800, fontFamily: 'monospace' }}>LAUNCH50</code> for <strong>$50 OFF</strong> at checkout! (First 10 orders only)
                </span>
              </div>
            </div>
          )}

          {isModularComponent && (
            <div
              style={{
                marginTop: '0.75rem',
                marginBottom: '1.25rem',
                padding: '0.75rem 0.85rem',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>
                🔄 Direct OEM Replacement (Subaru Part # H0010SA950ML)
              </strong>
              <span style={{ color: '#94a3b8' }}>
                100% backwards-compatible with the factory original Subaru USDM navigation housing. If your OEM pod clips snapped or you only need this specific component, it clips directly into your existing factory dash hardware—no full kit purchase needed.
              </span>
            </div>
          )}

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

          {/* Quantity Controls */}
          <div className="product-quantity">
            <label>Quantity</label>
            <div className="product-purchase-row">
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

              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="product-add-to-cart"
              >
                <ShoppingCart size={20} />
                {!isAvailable ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {isNavPod && (
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => openInternationalWaitlist(product.title)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  <Globe size={14} />
                  Outside Australia? Register for international delivery notification
                </button>
              </div>
            )}
          </div>

          {isNavPod && (
            <div className="product-manual-callout">
              <div className="product-manual-callout-header">
                <BookOpen size={18} className="product-manual-icon" />
                <div>
                  <strong>Official Installation Guide</strong>
                  <p>Step-by-step photos, wiring notes, and tool recommendations.</p>
                </div>
              </div>
              <Link
                href="/manuals/double-DIN-pod-upgrade-kit"
                className="product-manual-link"
              >
                Read the SG Forester Nav Pod Installation Guide &rarr;
              </Link>
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
        </div>
      </div>

      {isNavPod && (
        <div className="product-extended-details">
          <div className="product-seo-highlights">
            <h2>SG Forester Double DIN Nav Pod Kit Features</h2>
            <div className="product-highlights-grid">
              <div className="product-highlight-card">
                <CheckCircle2 size={20} className="product-highlight-icon" />
                <div>
                  <h3>Eye-Level Stereo Relocation</h3>
                  <p>
                    Converts your upper dashboard storage pocket into a functional double DIN navigation pod housing. Keeps navigation maps, backup cameras, and Apple CarPlay / Android Auto in your direct field of view while driving.
                  </p>
                </div>
              </div>
              <div className="product-highlight-card">
                <CheckCircle2 size={20} className="product-highlight-icon" />
                <div>
                  <h3>OEM Fit & Dashboard Texture Match</h3>
                  <p>
                    Custom engineered specifically for the 2003–2008 Subaru Forester (SG chassis). Available in both smooth satin and textured OEM-matched finish to blend seamlessly with factory dashboard trim.
                  </p>
                </div>
              </div>
              <div className="product-highlight-card">
                <CheckCircle2 size={20} className="product-highlight-icon" />
                <div>
                  <h3>High-Heat Automotive ASA Material</h3>
                  <p>
                    Precision 3D printed in engineering-grade ASA polymer. Rated to withstand interior dashboard temperatures up to 95°C (203°F) and harsh UV exposure without softening, warping, or discoloring.
                  </p>
                </div>
              </div>
              <div className="product-highlight-card">
                <CheckCircle2 size={20} className="product-highlight-icon" />
                <div>
                  <h3>Reversible Factory Mounting</h3>
                  <p>
                    Securely attaches using factory mounting points. No permanent dashboard cutting or irreversible modifications needed. Retains your original dashboard clock and hazard button functionality.
                  </p>
                </div>
              </div>
              <div className="product-highlight-card">
                <CheckCircle2 size={20} className="product-highlight-icon" />
                <div>
                  <h3>100% OEM Modular Compatibility (Subaru Part # H0010SA950ML)</h3>
                  <p>
                    Every component is dimensionally matched to the factory Subaru USDM Navigation Pod (H0010SA950ML). If you already own an OEM pod with snapped front clips, you don&apos;t need to purchase a full kit—our individual pod shells, front fascias, and brackets connect directly with your existing factory hardware.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="product-faq-section">
            <h2>Frequently Asked Questions: SG Forester Nav Pod</h2>
            <div className="product-faq-list">
              {NAV_POD_FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`product-faq-item ${isOpen ? 'product-faq-item-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="product-faq-question"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`product-faq-chevron ${isOpen ? 'product-faq-chevron-rotated' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="product-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
