'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import '@/styles/cart.css';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="cart-page">
      <div className="cart-empty" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <CheckCircle size={64} style={{ color: '#16a34a', margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#111827' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Thank you for your order. We have received your payment and are preparing your 3D printed parts for manufacturing and dispatch.
        </p>

        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <Package size={32} style={{ color: '#0284c7', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
              Australia Post Tracking
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              You will receive an email notification with your tracking number as soon as your parcel is lodged.
            </p>
          </div>
        </div>

        <Link href="/products" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Continue Browsing Products
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
