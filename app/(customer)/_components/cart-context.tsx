"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ProductCartItem = {
  kind: "product";
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

export type GiftBoxContent = {
  product_id: string;
  product_name: string;
  product_image: string | null;
  variant_id: string;
  size: string;
  finish: string | null;
  color_id: string | null;
  color_name: string | null;
  price: number;
};

export type GiftBoxCartItem = {
  kind: "gift-box";
  id: string;
  gift_contents: GiftBoxContent[];
  gift_wrap_fee: number;
  gift_note: string | null;
  price: number;
  quantity: 1;
};

export type CartItem = ProductCartItem | GiftBoxCartItem;

function productKey(variantId: string, colorId: string | null) {
  return `${variantId}:${colorId ?? "no-color"}`;
}

function giftBoxId() {
  return `gift-box-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type CartContextValue = {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (item: ProductCartItem) => void;
  addGiftBox: (contents: GiftBoxContent[], giftWrapFee: number, giftNote: string | null) => void;
  removeItem: (key: string) => void;
  updateQuantity: (variantId: string, colorId: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "babycloflo-cart";

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

  const addItem = useCallback((item: ProductCartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.kind === "product" && productKey(i.variant_id, i.color_id) === productKey(item.variant_id, item.color_id),
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex] as ProductCartItem;
        next[existingIndex] = { ...existing, quantity: existing.quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
  }, []);

  const addGiftBox = useCallback(
    (contents: GiftBoxContent[], giftWrapFee: number, giftNote: string | null) => {
      const contentsTotal = contents.reduce((sum, item) => sum + item.price, 0);
      const giftBox: GiftBoxCartItem = {
        kind: "gift-box",
        id: giftBoxId(),
        gift_contents: contents,
        gift_wrap_fee: giftWrapFee,
        gift_note: giftNote,
        price: contentsTotal + giftWrapFee,
        quantity: 1,
      };
      setItems((prev) => [...prev, giftBox]);
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.kind === "product") {
          return productKey(item.variant_id, item.color_id) !== key;
        }
        return item.id !== key;
      }),
    );
  }, []);

  const updateQuantity = useCallback(
    (variantId: string, colorId: string | null, quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) {
          return prev.filter(
            (item) => !(item.kind === "product" && productKey(item.variant_id, item.color_id) === productKey(variantId, colorId)),
          );
        }
        return prev.map((item) => {
          if (item.kind === "product" && productKey(item.variant_id, item.color_id) === productKey(variantId, colorId)) {
            return { ...item, quantity };
          }
          return item;
        });
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
      addGiftBox,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
    }),
    [items, isLoaded, addItem, addGiftBox, removeItem, updateQuantity, clearCart, totalItems, subtotal],
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
