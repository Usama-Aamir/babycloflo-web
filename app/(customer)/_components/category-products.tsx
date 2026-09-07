"use client";

import { useMemo, useState, useTransition } from "react";
import { PackageSearch } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { ProductCard } from "./product-card";
import type { ProductSummary } from "./storefront.types";

export function CategoryProducts({
  categoryId,
  initialProducts,
  pageSize,
}: {
  categoryId: string;
  initialProducts: ProductSummary[];
  pageSize: number;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoadingMore, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialProducts.length === pageSize);
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

  function loadMore() {
    startTransition(async () => {
      const supabase = createClient();
      const from = products.length;
      const to = from + pageSize - 1;
      const { data: nextBatch } = await supabase
        .from("products")
        .select("id, name, base_images, created_at, product_variants(id, price, size)")
        .eq("category_id", categoryId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (nextBatch && nextBatch.length > 0) {
        setProducts((current) => [...current, ...nextBatch]);
        setHasMore(nextBatch.length === pageSize);
      } else {
        setHasMore(false);
      }
    });
  }

  return (
    <>
      {sizes.length > 1 ? (
        <div className="mt-4 flex w-full min-w-0 snap-x gap-2 overflow-x-auto pb-2 pt-1 -mx-4 px-4 sm:-mx-0 sm:px-0 sm:pt-0" aria-label="Filter by size">
          <button
            className={`h-9 shrink-0 snap-start rounded-full px-4 text-sm font-medium transition active:scale-95 ${selectedSize === "all" ? "bg-brand-primary text-white" : "border border-zinc-300 bg-white hover:border-zinc-400"}`}
            onClick={() => setSelectedSize("all")}
            type="button"
          >
            All sizes
          </button>
          {sizes.map((size) => (
            <button
              className={`h-9 shrink-0 snap-start rounded-full px-4 text-sm font-medium transition active:scale-95 ${selectedSize === size ? "bg-brand-primary text-white" : "border border-zinc-300 bg-white hover:border-zinc-400"}`}
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
          {filteredProducts.map((product, index) => <ProductCard key={product.id} index={index} product={product} />)}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center sm:py-16">
          <PackageSearch className="mx-auto h-10 w-10 text-zinc-400" strokeWidth={1.4} />
          <p className="mt-3 text-base font-medium text-zinc-700 sm:text-lg">No products found here</p>
          <p className="mt-1 text-sm text-zinc-500">Try another size or check back later.</p>
        </div>
      )}

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-base font-semibold transition hover:bg-zinc-100 active:scale-95 disabled:opacity-50"
            disabled={isLoadingMore}
            onClick={loadMore}
            type="button"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
