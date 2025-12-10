'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';

export function CartButton() {
  const itemCount = useCartStore((state) => state.itemCount);

  return (
    <Link 
      href="/cart" 
      className="relative flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
          {itemCount}
        </span>
      )}
      <span className="hidden sm:inline text-sm font-medium">Cart</span>
    </Link>
  );
}
