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
    <li className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm sm:gap-4 sm:p-4" key={key}>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-primary-light sm:h-24 sm:w-24">
        {item.product_image ? (
          <Image alt={item.product_name} className="object-cover" fill sizes="96px" src={item.product_image} unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <svg aria-hidden="true" fill="none" height="28" viewBox="0 0 24 24" width="28">
              <path d="M4 6h16v14H4V6Zm4 0a4 4 0 0 1 8 0M8 14l2.5-2.5 2 2L15 11l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900 sm:text-base">{item.product_name}</p>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
            {[item.size, item.finish, item.color_name].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-0.5 text-sm font-medium text-zinc-700 sm:text-base">{priceFormatter.format(item.price)} each</p>
        </div>

        <div className="mt-2 flex items-center justify-between sm:mt-3">
          <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <button
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-base font-semibold hover:bg-zinc-50 sm:h-9 sm:w-9 sm:text-lg"
              onClick={() => onUpdateQuantity(item.variant_id, item.color_id, item.quantity - 1)}
              type="button"
            >
              −
            </button>
            <span className="flex h-8 w-9 items-center justify-center text-sm font-semibold sm:h-9 sm:w-10">
              {item.quantity}
            </span>
            <button
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-base font-semibold hover:bg-zinc-50 sm:h-9 sm:w-9 sm:text-lg"
              onClick={() => onUpdateQuantity(item.variant_id, item.color_id, item.quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <p className="text-sm font-semibold text-zinc-900 sm:text-base">{priceFormatter.format(item.price * item.quantity)}</p>
            <button
              aria-label={`Remove ${item.product_name}`}
              className="text-sm font-medium text-brand-accent hover:text-brand-accent-dark"
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
    <li className="rounded-2xl bg-white p-3 shadow-sm sm:p-4" key={item.id}>
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary sm:h-12 sm:w-12">
            <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
              <path d="M4 9h16v12H4V9Zm-1-4h18v4H3V5Zm9 0v16M12 5c-1-3-5-3-5-1 0 1 2 1 5 1Zm0 0c1-3 5-3 5-1 0 1-2 1-5 1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 sm:text-base">Gift Box</p>
            <p className="text-xs text-zinc-500 sm:text-sm">{item.gift_contents.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <p className="text-sm font-semibold text-zinc-900 sm:text-base">{priceFormatter.format(item.price)}</p>
          <button
            aria-label="Remove gift box"
            className="text-sm font-medium text-brand-accent hover:text-brand-accent-dark"
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
            <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-zinc-100 sm:h-10 sm:w-10">
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
        <p className="mt-3 rounded-lg bg-brand-accent-light px-3 py-2 text-sm italic text-zinc-700">
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
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center py-10">
        <p className="text-center text-zinc-500">Loading cart…</p>
      </div>
    );
  }

  const total = subtotal + deliveryCharge;

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white px-6 py-14 text-center shadow-sm sm:mt-10 sm:py-16">
          <p className="text-lg text-zinc-600">Your cart is empty.</p>
          <p className="mt-2 text-zinc-500">Browse products and add something you love.</p>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-primary px-6 font-semibold text-white hover:bg-brand-primary-dark"
            href="/"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <ul className="space-y-3 sm:space-y-4">
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

          <div className="h-fit rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700 sm:text-base">
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
              <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-bold sm:text-lg">
                <span>Estimated total</span>
                <span>{priceFormatter.format(total)}</span>
              </div>
            </div>

            <button
              className="mt-6 min-h-12 w-full rounded-xl bg-brand-primary px-5 text-base font-bold text-white hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14 sm:text-lg"
              disabled={items.length === 0}
              onClick={() => router.push("/checkout")}
              type="button"
            >
              Checkout
            </button>

            <Link
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:text-base"
              href="/"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
