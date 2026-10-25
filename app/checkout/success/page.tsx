import Link from 'next/link';
import { CheckCircle, ArrowRight, Package, SearchX } from 'lucide-react';
import { isCheckoutSessionPaid } from '@/lib/stripe';
import { isPayPalOrderPaid } from '@/lib/paypal';
import { ClearCart } from '@/components/ClearCart';
import '@/styles/cart.css';

// Every visit checks the payment live, so this page must never be cached
export const dynamic = 'force-dynamic';

/**
 * Confirms with Stripe or PayPal that the order in the URL was really paid,
 * so a made-up link can't show "Payment Successful".
 */
async function isOrderPaid(sessionId: string | undefined): Promise<boolean> {
  if (!sessionId) {
    return false;
  }
  try {
    return sessionId.startsWith('paypal_')
      ? await isPayPalOrderPaid(sessionId.slice('paypal_'.length))
      : await isCheckoutSessionPaid(sessionId);
  } catch (error) {
    console.error('Could not verify order on success page:', error);
    return false;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const paid = await isOrderPaid(session_id);

  if (!paid) {
    return (
      <div className="cart-page">
        <div className="cart-empty" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
          <SearchX size={64} style={{ color: '#6b7280', margin: '0 auto 1.5rem' }} />
          <h1 className="cart-title" style={{ marginBottom: '0.75rem' }}>
            We couldn&apos;t find this order
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            We couldn&apos;t confirm a completed payment for this link. If you were charged, email us at{' '}
            <a href="mailto:info@fozprints.com.au" style={{ textDecoration: 'underline' }}>info@fozprints.com.au</a>{' '}
            and we&apos;ll sort it out.
          </p>
          <Link href="/cart" className="btn btn-primary btn-lg">
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <ClearCart />
      <div className="cart-empty" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <CheckCircle size={64} style={{ color: '#16a34a', margin: '0 auto 1.5rem' }} />
        <h1 className="cart-title" style={{ marginBottom: '0.75rem' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
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
            <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0.25rem 0 0 0' }}>
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
