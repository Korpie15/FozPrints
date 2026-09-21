'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { ShippingQuote } from '@/lib/shipping';
import '@/styles/cart.css';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Australia Post estimation state
  const [postcode, setPostcode] = useState('');
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[] | null>(null);
  const [selectedQuoteCode, setSelectedQuoteCode] = useState<string | null>(null);
  const [isEstimatingShipping, setIsEstimatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate shipping whenever cart items change if postcode is entered
  useEffect(() => {
    if (postcode && postcode.trim().length >= 3 && items.length > 0) {
      calculateShipping(postcode.trim());
    }
  }, [items]);

  const calculateShipping = async (targetPostcode: string) => {
    setIsEstimatingShipping(true);
    setShippingError(null);

    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, toPostcode: targetPostcode }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Unable to calculate shipping.');
      }

      const quotes: ShippingQuote[] = data.quotes || [];
      setShippingQuotes(quotes);
      if (quotes.length > 0 && !selectedQuoteCode) {
        setSelectedQuoteCode(quotes[0].serviceCode);
      }
    } catch (err: any) {
      console.error('Shipping quote error:', err);
      setShippingError(err.message || 'Error getting shipping quote.');
    } finally {
      setIsEstimatingShipping(false);
    }
  };

  const handleEstimateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode || postcode.trim().length < 3 || items.length === 0) return;
    await calculateShipping(postcode.trim());
  };

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
        body: JSON.stringify({
          items,
          toPostcode: postcode.trim() || '2000',
        }),
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

  const activeQuote = shippingQuotes?.find((q) => q.serviceCode === selectedQuoteCode) || shippingQuotes?.[0];
  const shippingCost = activeQuote ? activeQuote.price : 0;
  const grandTotal = subtotal + shippingCost;

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
                    sizes="120px"
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
                      disabled={item.maxQuantity !== undefined && item.quantity >= item.maxQuantity}
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

          <div className="cart-summary-row" style={{ borderBottom: 'none', paddingBottom: '0.25rem' }}>
            <span>Shipping</span>
            <span>
              {activeQuote ? formatPrice(shippingCost.toString(), currencyCode) : 'Calculated at checkout'}
            </span>
          </div>

          {/* Australia Post Shipping Estimator */}
          <div className="cart-shipping-estimator" style={{ marginTop: '0.25rem' }}>
            <div className="cart-shipping-header">
              <Truck size={18} style={{ color: '#0284c7' }} />
              <span className="cart-shipping-title">
                Australia Post Estimate
              </span>
            </div>

            <form onSubmit={handleEstimateShipping} className="cart-shipping-form">
              <input
                type="text"
                placeholder="Postcode (e.g. 3000)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                maxLength={4}
                className="cart-shipping-input"
              />
              <button
                type="submit"
                disabled={isEstimatingShipping || !postcode}
                className="cart-shipping-calc-btn"
              >
                {isEstimatingShipping ? 'Calculating...' : 'Calculate'}
              </button>
            </form>

            {shippingQuotes && shippingQuotes.length > 0 && (
              <div className="cart-shipping-quotes">
                {shippingQuotes.map((q) => {
                  const isSelected = selectedQuoteCode === q.serviceCode;
                  return (
                    <label
                      key={q.serviceCode}
                      className="cart-shipping-quote-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        backgroundColor: isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '1px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isSelected ? '#ffffff' : 'inherit',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name="shippingOption"
                          value={q.serviceCode}
                          checked={isSelected}
                          onChange={() => setSelectedQuoteCode(q.serviceCode)}
                          style={{ accentColor: '#ffffff' }}
                        />
                        <span style={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#ffffff' : 'inherit' }}>
                          {q.name} ({q.deliveryEstimate.minimum}-{q.deliveryEstimate.maximum} days)
                        </span>
                      </div>
                      <strong style={{ color: isSelected ? '#ffffff' : 'inherit' }}>${q.price.toFixed(2)} AUD</strong>
                    </label>
                  );
                })}
              </div>
            )}

            {shippingError && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {shippingError}
              </p>
            )}
          </div>

          <div className="cart-summary-total">
            <span>Total</span>
            <span>
              {formatPrice(grandTotal.toString(), currencyCode)}
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
