import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The requested page or Subaru Forester print could not be found.',
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '500px' }}>
        <h1
          style={{
            fontSize: '4rem',
            fontWeight: 800,
            color: '#0284c7',
            marginBottom: '0.5rem',
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '1rem',
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            color: '#475569',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          Sorry, we couldn't find the page or print you were looking for. It might have been moved or deleted.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/products" className="btn btn-primary btn-lg">
            <ShoppingBag size={18} />
            Shop All Parts
          </Link>
          <Link href="/manuals" className="btn btn-secondary btn-lg">
            <BookOpen size={18} />
            View Manuals
          </Link>
        </div>
      </div>
    </div>
  );
}
