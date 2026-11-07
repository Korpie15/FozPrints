'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import '../styles/cart-button.css';

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const totalCount = safeItems.reduce((sum, item) => sum + (item?.quantity || 0), 0);

  // Pop the count whenever it goes up (not on page load), by remounting the badge
  const previousCount = useRef<number | null>(null);
  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    if (previousCount.current !== null && totalCount > previousCount.current) {
      setPopKey((k) => k + 1);
    }
    previousCount.current = totalCount;
  }, [totalCount, mounted]);

  return (
    <Link href="/cart" className="cart-button" aria-label="View shopping cart">
      <ShoppingCart className="cart-button-icon" size={24} />
      {mounted && totalCount > 0 && (
        <span key={popKey} className={`cart-badge${popKey > 0 ? ' cart-badge-pop' : ''}`}>
          {totalCount}
        </span>
      )}
    </Link>
  );
}
