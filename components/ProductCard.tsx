'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types/product';
import { formatPrice, stripHtml } from '@/lib/utils';
import { ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import '../styles/product-card.css';

interface ProductCardProps {
  product: Product;
  /** Heading level for the title: one below the heading of the section the card sits in */
  titleLevel?: 'h2' | 'h3';
}

export function ProductCard({ product, titleLevel: Title = 'h3' }: ProductCardProps) {
  const image = product.images[0];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  const variants = product.variants;
  const hasMultipleVariants = variants.length > 1;
  const firstVariant = variants[0];

  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = `finish-options-${product.id}`;

  // Close the dropdown on an outside click, on Escape (returning focus to the
  // toggle), or when focus moves out of the card; move focus into it on open
  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        toggleRef.current?.focus();
      }
    }
    function handleFocusOut(event: FocusEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.relatedTarget as Node | null)) {
        setIsDropdownOpen(false);
      }
    }
    const wrapper = dropdownRef.current;
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    wrapper?.addEventListener('focusout', handleFocusOut);
    wrapper?.querySelector<HTMLButtonElement>('.product-card-dropdown button:not(:disabled)')?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      wrapper?.removeEventListener('focusout', handleFocusOut);
    };
  }, [isDropdownOpen]);

  const isAvailable = Boolean(firstVariant?.availableForSale);

  // Price from the finishes that can be bought now, so a sold-out cheaper
  // finish doesn't advertise a price nobody can pay
  const purchasable = variants.filter((v) => v.availableForSale);
  const pricedVariants = purchasable.length > 0 ? purchasable : variants;
  const variantPrices = pricedVariants.map((v) => parseFloat(v.price.amount)).filter((n) => !Number.isNaN(n));
  const cardPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : product.price;
  const hasPriceRange = new Set(variantPrices).size > 1;
  const hasAnyAvailableVariant = variants.some((v) => v.availableForSale);

  const handleAddToCart = (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variant.availableForSale) return;

    addItem({
      id: variant.id,
      productId: product.id,
      title: product.title,
      variantTitle: variant.title,
      price: parseFloat(variant.price.amount),
      priceCents: variant.priceCents,
      currencyCode: variant.price.currencyCode,
      image: variant.image?.url || image?.url,
      handle: product.handle,
      quantity: 1,
      maxQuantity: variant.quantityAvailable,
    });

    setIsDropdownOpen(false);
  };

  return (
    <div className="product-card-wrapper" ref={dropdownRef}>
      <div className="product-card">
        <Link href={`/products/${product.handle}`} className="product-card-image">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              // Matches the products grid (1/2/3/4 columns) so small cards don't download huge images
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              No image
            </div>
          )}
        </Link>

        <div className="product-card-content">
          <Link href={`/products/${product.handle}`} style={{ textDecoration: 'none' }}>
            <Title className="product-card-title">{product.title}</Title>
          </Link>
          <p className="product-card-description">{product.shortDescription || stripHtml(product.description)}</p>

          <div className="product-card-footer">
            <span className="product-card-price">
              {hasPriceRange && 'From '}
              {formatPrice(cardPrice.toString(), product.currencyCode)}
            </span>
            <div className="product-card-actions">
              {hasMultipleVariants ? (
                <div className="product-card-dropdown-wrapper">
                  <button
                    ref={toggleRef}
                    type="button"
                    aria-label={`Choose a finish for ${product.title}`}
                    aria-expanded={isDropdownOpen}
                    aria-controls={menuId}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (hasAnyAvailableVariant) {
                        setIsDropdownOpen(!isDropdownOpen);
                      }
                    }}
                    disabled={!hasAnyAvailableVariant}
                    className={`product-card-button product-card-button-cart ${!hasAnyAvailableVariant ? 'product-card-button-unavailable' : ''}`}
                    title={hasAnyAvailableVariant ? 'Choose options' : 'Out of stock'}
                  >
                    {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => firstVariant && handleAddToCart(e, firstVariant)}
                  disabled={!isAvailable}
                  className={`product-card-button product-card-button-cart ${!isAvailable ? 'product-card-button-unavailable' : ''}`}
                  title={!isAvailable ? 'Out of stock' : 'Quick add to cart'}
                >
                  <ShoppingCart size={16} />
                </button>
              )}
              <Link href={`/products/${product.handle}`} className="product-card-button" style={{ textDecoration: 'none' }}>
                View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown rendered outside card */}
      {hasMultipleVariants && isDropdownOpen && hasAnyAvailableVariant && (
        <div
          id={menuId}
          className="product-card-dropdown"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {variants.map((variant) => (
            <div key={variant.id} className="product-card-dropdown-item">
              <span className="product-card-dropdown-title" title={variant.title}>
                {variant.title}
              </span>
              <button
                onClick={(e) => handleAddToCart(e, variant)}
                disabled={!variant.availableForSale}
                className={`product-card-button product-card-button-cart ${!variant.availableForSale ? 'product-card-button-unavailable' : ''}`}
                style={{ padding: '0.25rem 0.5rem' }}
                title={!variant.availableForSale ? 'Out of stock' : 'Quick add to cart'}
                aria-label={variant.availableForSale ? `Add ${variant.title} to cart` : `${variant.title} is out of stock`}
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
