'use client';

import { useEffect, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Check, BookOpen, ChevronDown, Truck, Sparkles, Globe } from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { formatPrice, formatDescriptionToHtml, variantSlug } from '@/lib/utils';
import { useCartStore } from '@/lib/store';
import { isNavPodProduct, NAV_POD_FAQS, NAV_POD_NAME, NAV_POD_SHORT_NAME } from '@/lib/product-seo';
import { LAUNCH_OFFER, isLaunchKit } from '@/lib/promo';
import { useLaunchOfferAvailable } from '@/lib/use-launch-offer';
import { LEAD_TIME, NON_AFFILIATION } from '@/lib/site';
import { openInternationalWaitlist } from './InternationalInterestModal';
import { Toast } from './Toast';
import { ImageLightbox } from './ImageLightbox';
import { CompareSlider } from './CompareSlider';
import { useSwipe } from '@/lib/use-swipe';
import { useAddedFlash } from '@/lib/use-added-flash';
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

// Index of the gallery photo showing a variant, or -1 if none matches
function findImageForVariant(product: Product, variant: ProductVariant): number {
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
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedPhase, playAdded] = useAddedFlash();
  // Start on a finish that's in stock, so the page doesn't open on "Out of stock"
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    () => product.variants.find((v) => v.availableForSale) ?? product.variants[0]
  );
  // Show the photo of that finish if it isn't the first variant
  const [selectedImageIndex, setSelectedImageIndex] = useState(() =>
    selectedVariant === product.variants[0] ? 0 : Math.max(0, findImageForVariant(product, selectedVariant))
  );
  const [showToast, setShowToast] = useState(false);
  // Shown in the toast and read out by screen readers via the live region below
  const [cartMessage, setCartMessage] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const { addItem } = useCartStore();
  const isNavPod = isNavPodProduct(product);
  const isFullKit = isLaunchKit(product.id);
  const isModularComponent = !isFullKit && isNavPod;
  // Shown unless the offer is known to be used up
  const launchOfferLive = useLaunchOfferAvailable() !== false;

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

    const imageIndex = findImageForVariant(product, variant);
    if (imageIndex !== -1) {
      setSelectedImageIndex(imageIndex);
    }
  };

  // Open on the finish named in the link (?variant=textured), so shopping ads land on the price they show
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('variant');
    const variant = wanted && product.variants.find((v) => variantSlug(v.title) === wanted.toLowerCase());
    if (variant) {
      handleVariantSelect(variant.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    // The cart caps quantities at stock, so say so instead of silently adding fewer
    const stock = selectedVariant.quantityAvailable;
    const alreadyInCart = useCartStore.getState().items.find((item) => item.id === selectedVariant.id)?.quantity ?? 0;
    let message = 'Item added to cart!';
    if (stock !== undefined && alreadyInCart >= stock) {
      message = `Your cart already has all ${stock} in stock.`;
    } else if (stock !== undefined && alreadyInCart + quantity > stock) {
      message = `Only ${stock} in stock, so your cart now has ${stock}.`;
    }

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

    setCartMessage(message);
    setShowToast(true);
    playAdded();
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

  // Swiping the main photo changes photo; a plain tap opens the full-screen viewer
  const mainImageSwipe = useSwipe(goToNextImage, goToPreviousImage);

  const isAvailable = Boolean(selectedVariant?.availableForSale);
  const maxQuantity = selectedVariant?.quantityAvailable ?? 1;

  return (
    <>
      {showToast && (
        <Toast
          message={cartMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      <p className="sr-only" aria-live="polite">{cartMessage}</p>
      {isZoomOpen && (
        <ImageLightbox
          images={product.images}
          index={selectedImageIndex}
          onIndexChange={handleImageSelect}
          onClose={() => setIsZoomOpen(false)}
        />
      )}
      <div className="product-details">
        {/* Product Images */}
        <div className="product-images">
          <div className="product-main-image" {...mainImageSwipe.handlers}>
            {selectedImage ? (
              <>
                <button
                  type="button"
                  className="product-zoom-button"
                  onClick={() => {
                    if (!mainImageSwipe.consumeSwipe()) setIsZoomOpen(true);
                  }}
                  aria-label="View photo full screen"
                >
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.altText || `${product.title} - ${selectedVariant?.title || 'View'}`}
                    fill
                    sizes={MAIN_IMAGE_SIZES}
                    style={{ objectFit: 'cover' }}
                    preload
                    fetchPriority="high"
                  />
                </button>
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
            {isNavPod ? NAV_POD_NAME : product.title}
          </h1>

          <div className="product-price-container">
            <span className="product-price">
              {formatPrice(
                selectedVariant?.price.amount || product.price.toString(),
                selectedVariant?.price.currencyCode || product.currencyCode
              )}
            </span>
            {isFullKit && (
              <span className="product-free-shipping-tag">
                <Truck size={13} /> {LAUNCH_OFFER.freeShipping}
              </span>
            )}
          </div>

          <p className="product-lead-time">{LEAD_TIME}</p>

          {isFullKit && launchOfferLive && (
            <div className="product-launch-pill">
              <Sparkles size={14} style={{ flexShrink: 0 }} />
              <span>
                Launch offer: <strong>${LAUNCH_OFFER.discount} off</strong> with code <code>{LAUNCH_OFFER.code}</code> ({LAUNCH_OFFER.limit})
                <span className="product-launch-terms">{LAUNCH_OFFER.terms}</span>
              </span>
            </div>
          )}

          {isModularComponent && (
            <div className="product-oem-callout">
              <strong>
                🔄 Replacement part for the factory pod (Subaru part no. H0010SA950ML)
              </strong>
              <span>
                Designed to fit the factory Subaru USDM navigation housing. If your original pod&apos;s clips have snapped or you only need this one component, it fits your existing factory dash hardware, so there&apos;s no need to buy the full kit. This is an aftermarket part, not a genuine Subaru part.
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
                    {v.availableForSale ? v.title : `${v.title} (out of stock)`}
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
                className={`product-add-to-cart atc atc-${addedPhase}`}
              >
                <span className="atc-icon" aria-hidden="true">
                  {addedPhase === 'added' ? <Check size={20} /> : <ShoppingCart size={20} />}
                  <span className="atc-drop" />
                </span>
                {!isAvailable ? 'Out of Stock' : addedPhase === 'added' ? 'Added' : 'Add to Cart'}
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
            <div className="product-manual-compact">
              <BookOpen size={16} style={{ flexShrink: 0 }} />
              <span>Step-by-step DIY guide:</span>
              <Link href="/manuals/double-DIN-pod-upgrade-kit">
                Installation Manual &rarr;
              </Link>
            </div>
          )}

          {/* The Nav Pod's description and features are one section below the photos */}
          {!isNavPod && (
            <div className="product-description">
              <div
                className="product-description-content"
                dangerouslySetInnerHTML={{
                  __html: formatDescriptionToHtml(product.description),
                }}
              />
            </div>
          )}

          {/subaru|forester/i.test(product.title) && (
            <p className="product-non-affiliation">{NON_AFFILIATION}</p>
          )}
        </div>
      </div>

      {isNavPod && (
        <div className="product-extended-details">
          <div className="product-seo-highlights">
            <h2>{NAV_POD_SHORT_NAME}: Description &amp; Features</h2>
            <p className="product-highlights-intro">
              Move your double DIN head unit from the low centre console to the top of the dash. The kit replaces the
              upper storage pocket with a pod styled on the factory USDM nav pod, so your maps, reversing camera and
              Apple CarPlay or Android Auto are a quick glance away instead of down beside the gear stick.
            </p>
            <ul className="product-feature-list">
              <li>
                <strong>Screen closer to eye level.</strong> Puts navigation, camera and music controls up high like a modern car, closer to your line of sight while driving.
              </li>
              <li>
                <strong>Shaped for the SG dash, with a matching texture.</strong> Designed for the 2003 to 2008 Subaru Forester (SG). Choose a smooth satin finish, or a textured finish made to closely match the grain of the factory dash. Both can be sanded and painted.
              </li>
              <li>
                <strong>High-heat automotive ASA.</strong> Printed in ASA, a UV-stable engineering plastic with a heat deflection temperature of around 95°C (manufacturer data), not hobby-grade PLA, which softens at around 55°C. As with any plastic, use a windscreen sunshade when parked in direct sun.
              </li>
              <li>
                <strong>Reversible factory mounting.</strong> Attaches to the factory mounting points, with no cutting or permanent changes to your dash. Keeps your hazard button working. The factory clock is built into the storage lid you remove, so it isn&apos;t refitted.
              </li>
              <li>
                <strong>Four-piece modular design.</strong> Follows the factory four-piece layout, so you can take it apart to run new wiring or swap head units. Fits standard double DIN head units; some deeper units may need minor trimming of the ducting behind the pod.
              </li>
              <li>
                <strong>Mixes with the factory pod (H0010SA950ML).</strong> Each part is modelled on the factory USDM nav pod, so it can be mixed with original parts. Only need one piece? See <Link href="/products/dash-replacement-parts">Dash Replacement Parts</Link>.
              </li>
            </ul>
            <div className="product-kit-contents">
              <h3>What&apos;s in the Kit</h3>
              <ul>
                <li>Top cover (the main hood)</li>
                <li>Front fascia (the trim around the screen)</li>
                <li>Left and right radio mount brackets</li>
              </ul>
            </div>
          </div>

          <div className="product-faq-section">
            <h2>Frequently Asked Questions: {NAV_POD_SHORT_NAME}</h2>
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
                      aria-controls={`product-faq-answer-${idx}`}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`product-faq-chevron ${isOpen ? 'product-faq-chevron-rotated' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="product-faq-answer" id={`product-faq-answer-${idx}`}>
                        <p>{faq.answer}</p>
                        {faq.media === 'oem-fitment' && (
                          <div className="faq-media">
                            <figure className="faq-media-figure">
                              <CompareSlider
                                beforeSrc="/images/photos/compare/original.webp"
                                beforeAlt="Original Subaru USDM nav pod installed on an SG Forester dashboard"
                                beforeLabel="Original (OEM)"
                                afterSrc="/images/photos/compare/new.webp"
                                afterAlt="Foz Prints nav pod installed in the same position on an SG Forester dashboard"
                                afterLabel="Foz Prints"
                                width={1600}
                                height={1200}
                              />
                              <figcaption className="faq-media-caption">
                                Drag the slider to compare the original pod with the Foz Prints pod, shot from the same spot.
                              </figcaption>
                            </figure>
                            <div className="faq-media-pair">
                              <figure className="faq-media-figure">
                                <Image
                                  src="/images/photos/oem-fitment/orig-facia-new-pod.webp"
                                  alt="Original Subaru front fascia fitted into a Foz Prints nav pod"
                                  width={1600}
                                  height={1200}
                                  sizes="(max-width: 640px) 100vw, 360px"
                                />
                                <figcaption className="faq-media-caption">Original fascia in a Foz Prints pod</figcaption>
                              </figure>
                              <figure className="faq-media-figure">
                                <Image
                                  src="/images/photos/oem-fitment/orig-nav-new-facia.webp"
                                  alt="Foz Prints front fascia fitted into an original Subaru nav pod"
                                  width={1600}
                                  height={2133}
                                  sizes="(max-width: 640px) 100vw, 360px"
                                />
                                <figcaption className="faq-media-caption">Foz Prints fascia in an original pod</figcaption>
                              </figure>
                            </div>
                            <Link href="/products/dash-replacement-parts" className="faq-media-link">
                              Shop Dash Replacement Parts
                            </Link>
                          </div>
                        )}
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
