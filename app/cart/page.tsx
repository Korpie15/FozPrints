'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import '@/styles/cart.css';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to initiate checkout.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
      setIsCheckingOut(false);
    }
  };

  if (!mounted) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <ShoppingCart size={64} style={{ margin: '0 auto 1rem', color: '#9ca3af' }} />
          <h2>Your cart is empty</h2>
          <p>
            Start adding some FozPrints products to your cart!
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const currencyCode = items[0]?.currencyCode || 'AUD';

  return (
    <div className="cart-page">
      <h1 className="cart-title">Shopping Cart</h1>

      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
                    No image
                  </div>
                )}
              </div>

              <div className="cart-item-details">
                <Link
                  href={`/products/${item.handle}`}
                  className="cart-item-title"
                >
                  {item.title}
                </Link>
                {item.variantTitle && item.variantTitle !== 'Default' && (
                  <p className="cart-item-variant">
                    {item.variantTitle}
                  </p>
                )}

                <div className="cart-item-actions">
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="cart-quantity-button"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="cart-quantity-value">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="cart-quantity-button"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <span className="cart-item-price">
                    {formatPrice((item.price * item.quantity).toString(), item.currencyCode)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="cart-item-remove"
                    aria-label="Remove item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>
              {formatPrice(subtotal.toString(), currencyCode)}
            </span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout (Australia Post)</span>
          </div>

          <div className="cart-summary-row">
            <span>Total</span>
            <span>
              {formatPrice(subtotal.toString(), currencyCode)}
            </span>
          </div>

          {checkoutError && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
              {checkoutError}
            </div>
          )}

          <Link href="/products" className="cart-continue-shopping">
            Continue Shopping
          </Link>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="cart-checkout-button"
            style={{ width: '100%', cursor: isCheckingOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isCheckingOut ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting to Stripe...
              </>
            ) : (
              'Proceed to Checkout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
