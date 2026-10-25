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

const MAX_QUANTITY = 99;

/** A whole number from 1 up to the stock limit (or 99), whatever was stored. */
function clampQuantity(quantity: unknown, maxQuantity?: number): number {
  return Math.min(Math.max(Math.floor(Number(quantity)) || 1, 1), maxQuantity ?? MAX_QUANTITY);
}

/**
 * Repairs or drops cart items read from localStorage, which may be stale,
 * left over from the old Shopify store, or hand-edited.
 */
function sanitizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (typeof item?.id !== 'string' || !item.id.startsWith('price_')) return [];
    const price = Number(item.price);
    if (!Number.isFinite(price) || price < 0) return [];

    const maxQuantity =
      Number.isInteger(item.maxQuantity) && item.maxQuantity > 0 ? item.maxQuantity : undefined;
    const quantity = clampQuantity(item.quantity, maxQuantity);

    return [{
      ...item,
      title: typeof item.title === 'string' ? item.title : 'Item',
      handle: typeof item.handle === 'string' ? item.handle : '',
      price,
      priceCents: Math.round(price * 100),
      currencyCode: typeof item.currencyCode === 'string' && item.currencyCode ? item.currencyCode : 'AUD',
      quantity,
      maxQuantity,
    }];
  });
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
        const maxStock = newItem.maxQuantity ?? Infinity;

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const currentQty = updated[existingIndex].quantity;
          const newQty = Math.min(maxStock, currentQty + addQty);
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            maxQuantity: newItem.maxQuantity ?? updated[existingIndex].maxQuantity,
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...newItem,
                quantity: Math.min(maxStock, addQty),
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
        const existingItem = currentItems.find((item) => item.id === id);
        const maxStock = existingItem?.maxQuantity ?? Infinity;
        const cappedQty = Math.min(maxStock, quantity);

        set({
          items: currentItems.map((item) =>
            item.id === id ? { ...item, quantity: cappedQty } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        const rawItems = get().items;
        if (!Array.isArray(rawItems)) return 0;
        return rawItems.reduce((total, item) => total + clampQuantity(item.quantity, item.maxQuantity), 0);
      },

      getSubtotal: () => {
        const rawItems = get().items;
        if (!Array.isArray(rawItems)) return 0;
        return rawItems.reduce(
          (total, item) => total + (Number(item.price) || 0) * clampQuantity(item.quantity, item.maxQuantity),
          0
        );
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
      merge: (persisted, current) => ({
        ...current,
        items: sanitizeItems((persisted as { items?: unknown } | undefined)?.items),
      }),
    }
  )
);

// Keep open tabs in sync: when another tab changes the cart, reload it here so a
// stale tab can't overwrite it with an old copy
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'fozprints-cart') {
      useCartStore.persist.rehydrate();
    }
  });
}
