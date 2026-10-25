'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.error('Unhandled page error:', error);
  }, [error]);

  const handleClearCart = () => {
    useCartStore.persist.clearStorage();
    useCartStore.setState({ items: [] });
    reset();
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Something went wrong</h1>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          We hit an unexpected problem loading this page. Please try again.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} className="btn btn-primary">Try again</button>
          {pathname?.startsWith('/cart') && (
            // A broken saved cart can crash this page on every load; clearing it is the way out
            <button onClick={handleClearCart} className="btn btn-secondary">Clear cart</button>
          )}
          <Link href="/products" className="btn btn-secondary">Browse products</Link>
        </div>
      </div>
    </div>
  );
}
