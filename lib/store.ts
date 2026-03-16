import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cartId: string | null;
  itemCount: number;
  items: Record<string, number>;
  setCartId: (id: string) => void;
  setItemCount: (count: number) => void;
  setItems: (items: Record<string, number>) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartId: null,
      itemCount: 0,
      items: {},
      setCartId: (id) => set({ cartId: id }),
      setItemCount: (count) => set({ itemCount: count }),
      setItems: (items) => set({ items }),
      clearCart: () => set({ cartId: null, itemCount: 0, items: {} }),
    }),
    {
      name: 'fozprints-cart',
    }
  )
);
