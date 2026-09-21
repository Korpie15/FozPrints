'use client';

import { useEffect, useState } from 'react';
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

  return (
    <Link href="/cart" className="cart-button" aria-label="View shopping cart">
      <ShoppingCart className="cart-button-icon" size={24} />
      {mounted && totalCount > 0 && (
        <span className="cart-badge">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
