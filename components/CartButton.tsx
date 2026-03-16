'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { getCart } from '@/lib/shopify';
import '../styles/cart-button.css';

export function CartButton() {
  const { itemCount, cartId, setItemCount, setItems, clearCart } = useCartStore();

  useEffect(() => {
    async function syncCart() {
      if (!cartId) return;
      try {
        const cart = await getCart(cartId);
        if (!cart) {
          // Cart is gone (e.g. checked out)
          clearCart();
        } else {
          // Sync exact item count
          const totalItems = cart.lines.edges.reduce(
            (sum: number, edge: any) => sum + edge.node.quantity,
            0
          );
          if (totalItems !== itemCount) {
            setItemCount(totalItems);
          }
          
          // Sync items map
          const newItems: Record<string, number> = {};
          cart.lines.edges.forEach((edge: any) => {
            const variantId = edge.node.merchandise.id;
            newItems[variantId] = (newItems[variantId] || 0) + edge.node.quantity;
          });
          setItems(newItems);
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    }
    
    syncCart();
  }, [cartId, clearCart, setItemCount, setItems, itemCount]);

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
