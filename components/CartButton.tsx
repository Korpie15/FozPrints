'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import '../styles/cart-button.css';

export function CartButton() {
  const itemCount = useCartStore((state) => state.itemCount);

  return (
    <Link href="/cart" className="cart-button">
      <ShoppingCart className="cart-button-icon" size={24} />
      {itemCount > 0 && (
        <span className="cart-badge">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
