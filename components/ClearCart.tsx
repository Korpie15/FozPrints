'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store';

/** Empties the cart once an order is confirmed as paid. Renders nothing. */
export function ClearCart() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
