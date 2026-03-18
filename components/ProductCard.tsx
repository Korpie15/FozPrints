'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShopifyProduct } from '@/types/shopify';
import { formatPrice } from '@/lib/utils';
import { ArrowRight, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { addToCart, createCart } from '@/lib/shopify';
import { useCartStore } from '@/lib/store';
import '../styles/product-card.css';

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartId, setCartId, setItemCount, setItems, items } = useCartStore();

  const variants = product.variants.edges;
  const hasMultipleVariants = variants.length > 1;
  const firstVariant = variants[0]?.node;
  
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

  // Check availability generically
  const checkAvailability = (variant: any) => {
    const quantityInCart = variant?.id ? (items[variant.id] || 0) : 0;
    return variant?.availableForSale && (variant?.quantityAvailable === undefined || quantityInCart < variant.quantityAvailable);
  };

  const isAvailable = checkAvailability(firstVariant);
  const hasAnyAvailableVariant = variants.some(({ node }) => checkAvailability(node));

  const handleAddToCart = async (e: React.MouseEvent, variantId: string, available: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!available) return;
    
    setAddingVariantId(variantId);
    try {
      let currentCartId = cartId;
      if (!currentCartId) {
        const newCart = await createCart();
        currentCartId = newCart.id;
        setCartId(newCart.id);
      }

      const updatedCart = await addToCart(currentCartId!, [
        { merchandiseId: variantId, quantity: 1 },
      ]);

      setCartId(updatedCart.id);
      
      const totalItems = updatedCart.lines.edges.reduce(
        (sum: number, edge: any) => sum + edge.node.quantity,
        0
      );
      setItemCount(totalItems);

      const newItems: Record<string, number> = {};
      updatedCart.lines.edges.forEach((edge: any) => {
        const variantId = edge.node.merchandise.id;
        newItems[variantId] = (newItems[variantId] || 0) + edge.node.quantity;
      });
      setItems(newItems);
      setIsDropdownOpen(false); // Close dropdown if open
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingVariantId(null);
    }
  };

  return (
    <div className="product-card-wrapper" ref={dropdownRef}>
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
                  title={hasAnyAvailableVariant ? "Choose options" : "Out of stock"}
                >
                  {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            ) : (
              <button 
                onClick={(e) => handleAddToCart(e, firstVariant.id, isAvailable)}
                disabled={addingVariantId === firstVariant.id || !isAvailable}
                className={`product-card-button product-card-button-cart ${!isAvailable ? 'product-card-button-unavailable' : ''}`}
                title={
                  !firstVariant?.availableForSale 
                    ? "Out of stock" 
                    : (firstVariant?.quantityAvailable !== undefined && (items[firstVariant.id] || 0) >= firstVariant.quantityAvailable)
                    ? "Sold out"
                    : "Quick add to cart"
                }
              >
                <ShoppingCart size={16} />
              </button>
            )}
            <button className="product-card-button">
              View
            </button>
          </div>
        </div>
      </div>
    </Link>

    {/* Dropdown rendered OUTSIDE the link so hover effects and overflow bounds don't trap it */}
      {hasMultipleVariants && isDropdownOpen && hasAnyAvailableVariant && (
        <div 
          className="product-card-dropdown"

          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {variants.map(({ node: variant }) => {
            const variantAvailable = checkAvailability(variant);
            const quantityInCart = variant?.id ? (items[variant.id] || 0) : 0;
            return (
              <div key={variant.id} className="product-card-dropdown-item">
                <span className="product-card-dropdown-title" title={variant.title}>
                  {variant.title}
                </span>
                <button
                  onClick={(e) => handleAddToCart(e, variant.id, variantAvailable)}
                  disabled={addingVariantId === variant.id || !variantAvailable}
                  className={`product-card-button product-card-button-cart ${!variantAvailable ? 'product-card-button-unavailable' : ''}`}
                  style={{ padding: '0.25rem 0.5rem' }}
                  title={
                    !variant.availableForSale 
                      ? "Out of stock" 
                      : (variant.quantityAvailable !== undefined && quantityInCart >= variant.quantityAvailable)
                      ? "Sold out"
                      : "Quick add to cart"
                  }
                >
                  <ShoppingCart size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
