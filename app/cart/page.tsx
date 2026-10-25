'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Loader2, Truck, Globe, Sparkles, Tag, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { ShippingQuote, hasFullKit } from '@/lib/shipping';
import { LAUNCH_OFFER } from '@/lib/promo';
import { openInternationalWaitlist } from '@/components/InternationalInterestModal';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import '@/styles/cart.css';

const isValidPostcode = (value: string) => /^\d{4}$/.test(value.trim());

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

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isPromoTouched, setIsPromoTouched] = useState(false);

  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();

  const isFullKitPresent = hasFullKit(items);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-apply LAUNCH50 if the full kit is in cart and user hasn't explicitly cleared it
  useEffect(() => {
    if (isFullKitPresent && !appliedPromo && !isPromoTouched) {
      setAppliedPromo('LAUNCH50');
    } else if (!isFullKitPresent && appliedPromo === 'LAUNCH50') {
      setAppliedPromo(null);
    }
  }, [isFullKitPresent, appliedPromo, isPromoTouched]);

  // Recalculate shipping whenever cart items change if postcode is entered
  useEffect(() => {
    if (isValidPostcode(postcode) && items.length > 0) {
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
    if (items.length === 0) return;
    if (!isValidPostcode(postcode)) {
      setShippingError('Please enter a valid Australian postcode.');
      return;
    }
    await calculateShipping(postcode.trim());
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPromoTouched(true);
    setPromoError(null);

    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'LAUNCH50') {
      if (!isFullKitPresent) {
        setPromoError(`${LAUNCH_OFFER.code} is only valid for the ${LAUNCH_OFFER.productName}.`);
        return;
      }
      setAppliedPromo('LAUNCH50');
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon or promotion code.');
    }
  };

  const handleRemovePromo = () => {
    setIsPromoTouched(true);
    setAppliedPromo(null);
    setPromoError(null);
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
          promoCode: appliedPromo,
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
        <h1 className="cart-title">Shopping Cart</h1>
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
          <h1 className="cart-empty-title">Your cart is empty</h1>
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

  // Calculate discount amount
  const discountAmount = appliedPromo === 'LAUNCH50' && isFullKitPresent ? 50.00 : 0;
  const grandTotal = Math.max(0.01, subtotal - discountAmount + shippingCost);

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
                    {/* Stops at 1 so an item is never removed by accident; the bin button removes it */}
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
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
                  {item.maxQuantity !== undefined && item.quantity >= item.maxQuantity && (
                    <p className="cart-item-stock-note" role="status">
                      Only {item.maxQuantity} in stock
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>

          {/* Nudge towards LAUNCH50; once applied, the Discount row says it instead */}
          {hasFullKit(items) && appliedPromo !== 'LAUNCH50' && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7dd3fc', fontSize: '0.825rem' }}>
                <Sparkles size={15} style={{ color: '#fde047', flexShrink: 0 }} />
                <span>
                  <strong>Launch offer:</strong> use code <code style={{ backgroundColor: '#ffffff', color: '#0369a1', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', fontWeight: 800, fontFamily: 'monospace' }}>{LAUNCH_OFFER.code}</code> for <strong>${LAUNCH_OFFER.discount} off</strong> ({LAUNCH_OFFER.limit})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 500 }}>
                <Truck size={14} style={{ flexShrink: 0 }} />
                <span>Includes {LAUNCH_OFFER.freeShipping.toLowerCase()}</span>
              </div>
            </div>
          )}

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>
              {formatPrice(subtotal.toString(), currencyCode)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="cart-summary-row" style={{ color: '#10b981', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={15} />
                Discount ({appliedPromo})
              </span>
              <span>
                -{formatPrice(discountAmount.toString(), currencyCode)}
              </span>
            </div>
          )}

          {/* Promo / Discount Code Input */}
          <div style={{ marginBottom: '0.85rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {appliedPromo ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.825rem', fontWeight: 500 }}>
                  <Check size={14} />
                  <span>
                    Promo code <strong>{appliedPromo}</strong> applied
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0 0.25rem',
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Promo code (e.g. LAUNCH50)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="cart-shipping-input"
                  style={{ textTransform: 'uppercase' }}
                />
                <button
                  type="submit"
                  disabled={!promoInput.trim()}
                  className="cart-shipping-calc-btn"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Apply
                </button>
              </form>
            )}
            {promoError && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                {promoError}
              </p>
            )}
          </div>

          <div className="cart-summary-row" style={{ borderBottom: 'none', paddingBottom: '0.25rem' }}>
            <span>Shipping</span>
            <span>
              {activeQuote ? (
                shippingCost === 0 ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>FREE</span>
                ) : (
                  formatPrice(shippingCost.toString(), currencyCode)
                )
              ) : isFullKitPresent ? (
                <span style={{ color: '#10b981', fontWeight: 700 }}>FREE (standard)</span>
              ) : (
                'Calculated at checkout'
              )}
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
                aria-label="Postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                maxLength={4}
                inputMode="numeric"
                autoComplete="postal-code"
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
                  const isFree = q.price === 0;
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
                        backgroundColor: isSelected ? '#0369a1' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '1px solid #0369a1' : '1px solid rgba(255, 255, 255, 0.1)',
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
                      <strong style={{ color: isFree ? '#10b981' : isSelected ? '#ffffff' : 'inherit' }}>
                        {isFree ? 'FREE' : `$${q.price.toFixed(2)} AUD`}
                      </strong>
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

          {/* PayPal Checkout */}
          <div style={{ marginTop: '0.75rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.75rem 0', color: '#6b7280', fontSize: '0.75rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <span>OR PAY WITH</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            </div>
            <PayPalCheckoutButton
              items={items}
              toPostcode={postcode.trim() || '2000'}
              serviceCode={activeQuote?.serviceCode}
              promoCode={appliedPromo || undefined}
            />
          </div>

          {/* International Shipping Waitlist Trigger */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              Outside Australia? We currently deliver domestically for launch.
            </p>
            <button
              type="button"
              onClick={() => openInternationalWaitlist(items[0]?.title)}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.825rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              <Globe size={13} />
              Register your country for international shipping notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
