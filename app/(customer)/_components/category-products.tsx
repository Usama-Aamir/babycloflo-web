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
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 pt-1 -mx-4 px-4 sm:-mx-0 sm:px-0 sm:pt-0" aria-label="Filter by size">
          <button
            className={`h-9 shrink-0 snap-start rounded-full px-4 text-sm font-medium transition ${selectedSize === "all" ? "bg-brand-primary text-white" : "border border-zinc-300 bg-white hover:border-zinc-400"}`}
            onClick={() => setSelectedSize("all")}
            type="button"
          >
            All sizes
          </button>
          {sizes.map((size) => (
            <button
              className={`h-9 shrink-0 snap-start rounded-full px-4 text-sm font-medium transition ${selectedSize === size ? "bg-brand-primary text-white" : "border border-zinc-300 bg-white hover:border-zinc-400"}`}
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
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center text-base text-zinc-600 sm:text-lg">
          No products in this size yet
        </div>
      )}
    </>
  );
}
