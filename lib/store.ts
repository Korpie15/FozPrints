import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cartId: string | null;
  itemCount: number;
  setCartId: (id: string) => void;
  setItemCount: (count: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartId: null,
      itemCount: 0,
      setCartId: (id) => set({ cartId: id }),
      setItemCount: (count) => set({ itemCount: count }),
      clearCart: () => set({ cartId: null, itemCount: 0 }),
    }),
    {
      name: 'fozprints-cart',
    }
  )
);
