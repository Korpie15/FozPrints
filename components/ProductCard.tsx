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
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  const variants = product.variants;
  const hasMultipleVariants = variants.length > 1;
  const firstVariant = variants[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const isAvailable = firstVariant ? firstVariant.availableForSale : true;
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
            <h3 className="product-card-title">{product.title}</h3>
          </Link>
          <p className="product-card-description">{stripHtml(product.description)}</p>

          <div className="product-card-footer">
            <span className="product-card-price">
              {formatPrice(product.price.toString(), product.currencyCode)}
            </span>
            <div className="product-card-actions">
              {hasMultipleVariants ? (
                <div className="product-card-dropdown-wrapper">
                  <button
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
