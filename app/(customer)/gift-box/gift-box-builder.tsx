"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCart } from "../_components/cart-context";
import type { GiftBoxContent } from "../_components/cart-context";

const MIN_GIFT_ITEMS = 3;
const MAX_GIFT_ITEMS = 5;

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
});

type GiftableProduct = {
  id: string;
  name: string;
  base_images: string[] | null;
  product_variants: {
    price: number;
    size: string;
    stock_status: string;
  }[];
};

export function GiftBoxBuilder({
  products,
  giftWrapFee,
}: {
  products: GiftableProduct[];
  giftWrapFee: number;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [giftNote, setGiftNote] = useState("");
  const [added, setAdded] = useState(false);
  const { addGiftBox } = useCart();
  const router = useRouter();

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.has(p.id)),
    [products, selectedIds],
  );

  const contents = useMemo<GiftBoxContent[]>(
    () =>
      selectedProducts.map((product) => {
        const availableVariants = product.product_variants.filter(
          (v) => v.stock_status !== "out_of_stock",
        );
        const variant = availableVariants[0] ?? product.product_variants[0];
        return {
          product_id: product.id,
          product_name: product.name,
          product_image: product.base_images?.[0] ?? null,
          variant_id: `gift-${product.id}-${variant?.size ?? "default"}`,
          size: variant?.size ?? "",
          finish: null,
          color_id: null,
          color_name: null,
          price: variant?.price ?? 0,
        };
      }),
    [selectedProducts],
  );

  const contentsTotal = contents.reduce((sum, item) => sum + item.price, 0);
  const total = contentsTotal + giftWrapFee;
  const count = selectedIds.size;
  const canAdd = count >= MIN_GIFT_ITEMS && count <= MAX_GIFT_ITEMS;
  const progressMessage =
    count === 0
      ? `Pick ${MIN_GIFT_ITEMS}–${MAX_GIFT_ITEMS} gifts`
      : count < MIN_GIFT_ITEMS
        ? `${MIN_GIFT_ITEMS - count} more to go`
        : count <= MAX_GIFT_ITEMS
          ? `Great choice — ${count} of ${MAX_GIFT_ITEMS} selected`
          : `Max ${MAX_GIFT_ITEMS} gifts — remove ${count - MAX_GIFT_ITEMS}`;

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_GIFT_ITEMS) {
        next.add(id);
      }
      return next;
    });
  }

  function handleAddToCart() {
    if (!canAdd) return;
    addGiftBox(contents, giftWrapFee, giftNote.trim() || null);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6 sm:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Build a Gift Box</h1>
          <p className="mt-2 text-zinc-600">
            Choose {MIN_GIFT_ITEMS}–{MAX_GIFT_ITEMS} items for a beautifully wrapped baby gift.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 font-medium text-zinc-700 hover:bg-zinc-50"
          href="/"
        >
          Back to shop
        </Link>
      </div>

      <div
        className={`mt-6 rounded-2xl px-5 py-4 text-center font-semibold ${
          count >= MIN_GIFT_ITEMS && count <= MAX_GIFT_ITEMS
            ? "bg-green-50 text-green-800"
            : "bg-amber-50 text-amber-800"
        }`}
      >
        {progressMessage}
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <p className="text-lg text-zinc-600">No giftable products yet.</p>
          <p className="mt-2 text-zinc-500">Check back soon for curated gift items.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const selected = selectedIds.has(product.id);
            const startingPrice =
              product.product_variants.length > 0
                ? Math.min(...product.product_variants.map((v) => v.price))
                : null;
            const disabled = !selected && count >= MAX_GIFT_ITEMS;

            return (
              <button
                aria-pressed={selected}
                className={`group relative block overflow-hidden rounded-2xl border text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-rose-200 ${
                  selected
                    ? "border-rose-600 bg-rose-50 ring-2 ring-rose-600"
                    : disabled
                      ? "border-zinc-200 bg-white opacity-50"
                      : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                }`}
                disabled={disabled}
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                type="button"
              >
                <div className="relative aspect-square bg-rose-50">
                  {product.base_images?.[0] ? (
                    <Image
                      alt={product.name}
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      src={product.base_images[0]}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-rose-300" aria-hidden="true">
                      <svg fill="none" height="56" viewBox="0 0 24 24" width="56">
                        <path d="M4 6h16v14H4V6Zm4 0a4 4 0 0 1 8 0M8 14l2.5-2.5 2 2L15 11l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    </div>
                  )}
                  {selected ? (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow">
                      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
                        <path d="M5 12l5 5L20 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                    </div>
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-zinc-900 sm:text-lg">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xl font-bold text-rose-700">
                    {startingPrice === null ? "—" : priceFormatter.format(startingPrice)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {count >= MIN_GIFT_ITEMS ? (
        <div className="mt-8 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Your gift box</h2>
          <ul className="mt-4 space-y-3">
            {contents.map((item) => (
              <li className="flex items-center justify-between text-sm" key={item.product_id}>
                <span className="text-zinc-700">{item.product_name}</span>
                <span className="font-medium text-zinc-900">{priceFormatter.format(item.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-zinc-700">
            <div className="flex justify-between">
              <span>Gift wrap</span>
              <span className="font-medium">{giftWrapFee ? priceFormatter.format(giftWrapFee) : "Free"}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{priceFormatter.format(total)}</span>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-base font-medium" htmlFor="gift-note">
              Add a gift note (optional)
            </label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              id="gift-note"
              onChange={(e) => setGiftNote(e.target.value)}
              placeholder="Write something sweet for the little one..."
              value={giftNote}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              className="min-h-14 flex-1 rounded-xl bg-rose-600 px-6 text-lg font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canAdd}
              onClick={handleAddToCart}
              type="button"
            >
              Add Gift Box to Cart
            </button>
            <button
              className="min-h-14 rounded-xl border border-zinc-200 bg-white px-6 text-lg font-semibold text-zinc-700 hover:bg-zinc-50"
              onClick={() => router.push("/cart")}
              type="button"
            >
              Go to cart
            </button>
          </div>
        </div>
      ) : null}

      {added ? (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-zinc-950 px-6 py-3 font-semibold text-white shadow-lg" role="status">
          Gift box added to cart
        </div>
      ) : null}
    </main>
  );
}
