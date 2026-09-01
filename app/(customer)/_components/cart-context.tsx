"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  product_id: string;
  product_name: string;
  product_image: string | null;
  variant_id: string;
  size: string;
  finish: string | null;
  color_id: string | null;
  color_name: string | null;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string, colorId?: string | null) => void;
  updateQuantity: (variantId: string, colorId: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "babycloflo-cart";

function itemKey(variantId: string, colorId: string | null) {
  return `${variantId}:${colorId ?? "no-color"}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.variant_id === item.variant_id && i.color_id === item.color_id,
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((variantId: string, colorId?: string | null) => {
    setItems((prev) =>
      prev.filter((i) => itemKey(i.variant_id, i.color_id) !== itemKey(variantId, colorId ?? null)),
    );
  }, []);

  const updateQuantity = useCallback(
    (variantId: string, colorId: string | null, quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (i) => itemKey(i.variant_id, i.color_id) !== itemKey(variantId, colorId),
          );
        }
        return prev.map((i) =>
          itemKey(i.variant_id, i.color_id) === itemKey(variantId, colorId)
            ? { ...i, quantity }
            : i,
        );
      });
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isLoaded,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
    }),
    [items, isLoaded, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
