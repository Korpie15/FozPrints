import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/product';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const rawItems = get().items;
        const currentItems = Array.isArray(rawItems) ? rawItems : [];
        const existingIndex = currentItems.findIndex((item) => item.id === newItem.id);
        const addQty = newItem.quantity || 1;

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + addQty,
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...newItem,
                quantity: addQty,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        const rawItems = get().items;
        const currentItems = Array.isArray(rawItems) ? rawItems : [];
        set({
          items: currentItems.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const rawItems = get().items;
        const currentItems = Array.isArray(rawItems) ? rawItems : [];
        set({
          items: currentItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        const rawItems = get().items;
        if (!Array.isArray(rawItems)) return 0;
        return rawItems.reduce((total, item) => total + (item.quantity || 0), 0);
      },

      getSubtotal: () => {
        const rawItems = get().items;
        if (!Array.isArray(rawItems)) return 0;
        return rawItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
      },
    }),
    {
      name: 'fozprints-cart',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // If coming from version 1 or unversioned state where items was an object or cartId existed
        if (version < 2 || !Array.isArray(persistedState?.items)) {
          return { items: [] };
        }
        return persistedState;
      },
    }
  )
);
