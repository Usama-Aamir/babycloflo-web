"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { useCart } from "../_components/cart-context";
import type { GiftBoxCartItem, ProductCartItem } from "../_components/cart-context";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
});

function ProductCartRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: ProductCartItem;
  onUpdateQuantity: (variantId: string, colorId: string | null, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const key = `${item.variant_id}:${item.color_id ?? "no-color"}`;
  return (
    <li className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm" key={key}>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-rose-50">
        {item.product_image ? (
          <Image alt={item.product_name} className="object-cover" fill sizes="96px" src={item.product_image} unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <svg aria-hidden="true" fill="none" height="32" viewBox="0 0 24 24" width="32">
              <path d="M4 6h16v14H4V6Zm4 0a4 4 0 0 1 8 0M8 14l2.5-2.5 2 2L15 11l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-semibold text-zinc-900">{item.product_name}</p>
          <p className="mt-1 text-sm text-zinc-500">
            {[item.size, item.finish, item.color_name].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 font-medium text-zinc-700">{priceFormatter.format(item.price)} each</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <button
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center hover:bg-zinc-50"
              onClick={() => onUpdateQuantity(item.variant_id, item.color_id, item.quantity - 1)}
              type="button"
            >
              −
            </button>
            <span className="flex h-9 w-10 items-center justify-center text-sm font-semibold">
              {item.quantity}
            </span>
            <button
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center hover:bg-zinc-50"
              onClick={() => onUpdateQuantity(item.variant_id, item.color_id, item.quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-semibold text-zinc-900">{priceFormatter.format(item.price * item.quantity)}</p>
            <button
              aria-label={`Remove ${item.product_name}`}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
              onClick={() => onRemove(key)}
              type="button"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function GiftBoxCartRow({ item, onRemove }: { item: GiftBoxCartItem; onRemove: (key: string) => void }) {
  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm" key={item.id}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
              <path d="M4 9h16v12H4V9Zm-1-4h18v4H3V5Zm9 0v16M12 5c-1-3-5-3-5-1 0 1 2 1 5 1Zm0 0c1-3 5-3 5-1 0 1-2 1-5 1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-zinc-900">Gift Box</p>
            <p className="text-sm text-zinc-500">{item.gift_contents.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="font-semibold text-zinc-900">{priceFormatter.format(item.price)}</p>
          <button
            aria-label="Remove gift box"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
            onClick={() => onRemove(item.id)}
            type="button"
          >
            Remove
          </button>
        </div>
      </div>

      <ul className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
        {item.gift_contents.map((content) => (
          <li className="flex items-center gap-3 text-sm" key={`${content.product_id}-${content.variant_id}`}>
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-100">
              {content.product_image ? (
                <Image alt={content.product_name} className="object-cover" fill sizes="40px" src={content.product_image} unoptimized />
              ) : null}
            </div>
            <div className="flex-1">
              <p className="font-medium text-zinc-800">{content.product_name}</p>
              <p className="text-xs text-zinc-500">{[content.size, content.finish].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="text-zinc-700">{priceFormatter.format(content.price)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 text-sm text-zinc-600">
        <span>Gift wrap</span>
        <span>{priceFormatter.format(item.gift_wrap_fee)}</span>
      </div>

      {item.gift_note ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm italic text-zinc-700">
          “{item.gift_note}”
        </p>
      ) : null}
    </li>
  );
}

export default function CartPage() {
  const { items, isLoaded, updateQuantity, removeItem, subtotal } = useCart();
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("delivery_charge")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.delivery_charge != null) {
          setDeliveryCharge(data.delivery_charge);
        }
      });
  }, [supabase]);

  if (!isLoaded) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-10">
        <p className="text-center text-zinc-500">Loading cart…</p>
      </main>
    );
  }

  const total = subtotal + deliveryCharge;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg text-zinc-600">Your cart is empty.</p>
          <p className="mt-2 text-zinc-500">Browse products and add something you love.</p>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-6 font-semibold text-white hover:bg-rose-700"
            href="/"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <ul className="space-y-4">
            {items.map((item) =>
              item.kind === "product" ? (
                <ProductCartRow
                  item={item}
                  key={`${item.variant_id}:${item.color_id ?? "no-color"}`}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ) : (
                <GiftBoxCartRow item={item} key={item.id} onRemove={removeItem} />
              ),
            )}
          </ul>

          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Order summary</h2>
            <div className="mt-4 space-y-3 text-zinc-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{priceFormatter.format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-medium">
                  {deliveryCharge ? priceFormatter.format(deliveryCharge) : "Free"}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-3 text-lg font-bold">
                <span>Estimated total</span>
                <span>{priceFormatter.format(total)}</span>
              </div>
            </div>

            <button
              className="mt-6 min-h-14 w-full rounded-xl bg-rose-600 px-5 text-lg font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={items.length === 0}
              onClick={() => router.push("/checkout")}
              type="button"
            >
              Checkout
            </button>

            <Link
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-zinc-200 px-4 font-medium text-zinc-700 hover:bg-zinc-50"
              href="/"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
