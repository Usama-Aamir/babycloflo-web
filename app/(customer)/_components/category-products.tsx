"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "./product-card";
import type { ProductSummary } from "./storefront.types";

export function CategoryProducts({ products }: { products: ProductSummary[] }) {
  const [selectedSize, setSelectedSize] = useState("all");
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.product_variants.map(({ size }) => size)))).sort(),
    [products],
  );
  const filteredProducts = selectedSize === "all"
    ? products
    : products.filter((product) =>
        product.product_variants.some(({ size }) => size === selectedSize),
      );

  return (
    <>
      {sizes.length > 1 ? (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by size">
          <button
            className={`min-h-12 shrink-0 rounded-full px-5 font-semibold ${selectedSize === "all" ? "bg-brand-primary text-white" : "border border-zinc-300 bg-white"}`}
            onClick={() => setSelectedSize("all")}
            type="button"
          >
            All sizes
          </button>
          {sizes.map((size) => (
            <button
              className={`min-h-12 shrink-0 rounded-full px-5 font-semibold ${selectedSize === size ? "bg-brand-primary text-white" : "border border-zinc-300 bg-white"}`}
              key={size}
              onClick={() => setSelectedSize(size)}
              type="button"
            >
              {size}
            </button>
          ))}
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center text-lg text-zinc-600">
          No products in this size yet
        </div>
      )}
    </>
  );
}
