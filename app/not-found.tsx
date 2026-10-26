import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, BookOpen } from 'lucide-react';
import '../styles/not-found.css';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The requested page or Subaru Forester print could not be found.',
  // The layout's self-canonical would point search engines at the missing URL
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-inner">
        <p className="not-found-code" aria-hidden="true">404</p>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-text">
          Sorry, we couldn&apos;t find the page or print you were looking for. It might have been moved or deleted.
        </p>

        <div className="not-found-actions">
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
