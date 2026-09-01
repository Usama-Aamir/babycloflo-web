"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { ProductDetail } from "./storefront.types";
import { useCart } from "./cart-context";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export function ProductDetailView({
  product,
  whatsappNumber,
}: {
  product: ProductDetail;
  whatsappNumber: string | null;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState("");
  const { addItem } = useCart();

  const selectedVariant = product.product_variants.find(
    ({ id }) => id === selectedVariantId,
  );
  const selectedColor = selectedVariant?.variant_colors.find(
    ({ id }) => id === selectedColorId,
  );
  const cleanWhatsAppNumber = whatsappNumber?.replace(/\D/g, "") ?? "";
  const whatsappUrl = useMemo(() => {
    if (!selectedVariant || !cleanWhatsAppNumber) return null;
    const details = [
      "Hello, I would like to order:",
      `Product: ${product.name}`,
      `Size: ${selectedVariant.size}`,
      selectedVariant.finish ? `Finish: ${selectedVariant.finish}` : null,
      selectedColor ? `Color: ${selectedColor.color_name}` : null,
      `Price: Rs ${priceFormatter.format(Number(selectedVariant.price))}`,
    ].filter(Boolean);
    return `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(details.join("\n"))}`;
  }, [cleanWhatsAppNumber, product.name, selectedColor, selectedVariant]);

  function handleAddToCart() {
    if (!selectedVariant) return;

    addItem({
      kind: "product",
      product_id: product.id,
      product_name: product.name,
      product_image: product.base_images?.[0] ?? null,
      variant_id: selectedVariant.id,
      size: selectedVariant.size,
      finish: selectedVariant.finish,
      color_id: selectedColor?.id ?? null,
      color_name: selectedColor?.color_name ?? null,
      price: Number(selectedVariant.price),
      quantity,
    });

    setToast("Added to cart");
    window.setTimeout(() => setToast(""), 2500);
  }

  function increment() {
    setQuantity((q) => q + 1);
  }

  function decrement() {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  }

  const images = product.base_images ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl pb-16 sm:px-6 sm:pt-8">
      <Link className="mx-4 mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl pr-4 font-semibold text-zinc-700 sm:mx-0 sm:mt-0" href="/">
        <span aria-hidden="true">←</span> Back
      </Link>

      <div className="mt-3 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <section aria-label="Product photos">
          {images.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:px-0">
              {images.map((image, index) => (
                <div className="relative aspect-square w-[88vw] max-w-xl shrink-0 snap-center overflow-hidden rounded-2xl bg-brand-primary-light sm:w-[75vw] lg:w-full" key={`${image}-${index}`}>
                  <Image alt={`${product.name}, photo ${index + 1}`} className="object-cover" fill priority={index === 0} sizes="(max-width: 1024px) 88vw, 55vw" src={image} unoptimized />
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-4 flex aspect-square items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary/40 sm:mx-0" aria-label="No product photo available">
              <svg aria-hidden="true" fill="none" height="72" viewBox="0 0 24 24" width="72">
                <path d="M4 6h16v14H4V6Zm4 0a4 4 0 0 1 8 0M8 14l2.5-2.5 2 2L15 11l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
              </svg>
            </div>
          )}
          {images.length > 1 ? (
            <p className="mt-2 text-center text-sm font-medium text-zinc-500">Swipe to see more photos</p>
          ) : null}
        </section>

        <section className="px-4 sm:px-0 lg:sticky lg:top-24">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-brand-primary-dark">
            {selectedVariant
              ? `Rs ${priceFormatter.format(Number(selectedVariant.price))}`
              : "Choose a size"}
          </p>

          {product.description ? (
            <p className="mt-5 whitespace-pre-line text-lg leading-8 text-zinc-700">
              {product.description}
            </p>
          ) : null}

          <div className="mt-8">
            <h2 className="text-lg font-bold">1. Choose size and finish</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.product_variants.map((variant) => {
                const selected = variant.id === selectedVariantId;
                const outOfStock = variant.stock_status === "out_of_stock";
                return (
                  <button
                    className={`min-h-14 rounded-xl border-2 px-5 text-left font-semibold ${selected ? "border-brand-primary bg-brand-primary-light text-brand-primary-dark" : "border-zinc-200 bg-white"} disabled:cursor-not-allowed disabled:opacity-45`}
                    disabled={outOfStock}
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setSelectedColorId(null);
                    }}
                    type="button"
                  >
                    <span className="block">{variant.size}</span>
                    {variant.finish ? <span className="block text-sm font-normal">{variant.finish}</span> : null}
                    {outOfStock ? <span className="block text-xs font-normal">Out of stock</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedVariant && selectedVariant.variant_colors.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-lg font-bold">2. Choose a color</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedVariant.variant_colors.map((color) => (
                  <button
                    className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 font-semibold ${selectedColorId === color.id ? "border-brand-primary bg-brand-primary-light" : "border-zinc-200 bg-white"}`}
                    key={color.id}
                    onClick={() => setSelectedColorId(color.id)}
                    type="button"
                  >
                    {color.swatch_image_url ? (
                      <span className="relative h-9 w-9 overflow-hidden rounded-full border border-zinc-200">
                        <Image alt="" className="object-cover" fill sizes="36px" src={color.swatch_image_url} unoptimized />
                      </span>
                    ) : (
                      <span className="h-9 w-9 rounded-full border-2 border-zinc-300 bg-zinc-100" aria-hidden="true" />
                    )}
                    {color.color_name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!selectedVariant ? (
            <p className="mt-7 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              Please choose a size first
            </p>
          ) : !cleanWhatsAppNumber ? (
            <p className="mt-7 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              WhatsApp ordering is temporarily unavailable
            </p>
          ) : null}

          {selectedVariant ? (
            <div className="mt-7 flex items-center gap-4">
              <span className="text-base font-semibold text-zinc-700">Quantity</span>
              <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <button
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-lg font-semibold hover:bg-zinc-50"
                  onClick={decrement}
                  type="button"
                >
                  −
                </button>
                <span className="flex h-12 w-14 items-center justify-center text-lg font-semibold">
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-lg font-semibold hover:bg-zinc-50"
                  onClick={increment}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {whatsappUrl ? (
              <a className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-green-600 px-5 text-center text-lg font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200" href={whatsappUrl} rel="noreferrer" target="_blank">
                Order via WhatsApp
              </a>
            ) : (
              <button className="min-h-16 rounded-2xl bg-green-600 px-5 text-lg font-bold text-white opacity-45" disabled type="button">
                Order via WhatsApp
              </button>
            )}
            <button
              className="min-h-16 rounded-2xl bg-brand-primary px-5 text-lg font-bold text-white hover:bg-brand-primary-dark focus:outline-none focus:ring-4 focus:ring-brand-primary-light disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!selectedVariant}
              onClick={handleAddToCart}
              type="button"
            >
              Add to Cart
            </button>
          </div>
        </section>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-zinc-950 px-6 py-3 font-semibold text-white shadow-lg" role="status">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
