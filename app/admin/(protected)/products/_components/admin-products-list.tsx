"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";
import { duplicateProduct } from "../actions";
import { DeleteProductButton } from "./delete-product-button";

export type AdminProductRow = {
  id: string;
  name: string;
  status: string;
  base_images: string[] | null;
  categories: { name: string } | null;
  product_variants: { price: number }[];
};

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 2,
});

export function AdminProductsList({
  initialProducts,
  pageSize,
}: {
  initialProducts: AdminProductRow[];
  pageSize: number;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoadingMore, startTransition] = useTransition();
  const [hasMore, setHasMore] = useState(initialProducts.length === pageSize);

  function loadMore() {
    startTransition(async () => {
      const supabase = createClient();
      const from = products.length;
      const to = from + pageSize - 1;
      const { data: nextBatch } = await supabase
        .from("products")
        .select("id, name, status, base_images, categories(name), product_variants(price)")
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

  if (products.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-xl font-semibold">No products yet</p>
        <p className="mt-2 text-zinc-600">Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[80px_2fr_1fr_1fr_1.3fr_auto] items-center gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-600 md:grid">
          <span>Photo</span><span>Name</span><span>Category</span><span>Status</span><span>Price</span><span>Actions</span>
        </div>
        <div className="divide-y divide-zinc-200">
          {products.map((product) => {
            const prices = product.product_variants.map(({ price }) => Number(price));
            const minimum = prices.length > 0 ? Math.min(...prices) : null;
            const maximum = prices.length > 0 ? Math.max(...prices) : null;
            const priceRange = minimum === null || maximum === null
              ? "No price"
              : minimum === maximum
                ? priceFormatter.format(minimum)
                : `${priceFormatter.format(minimum)} – ${priceFormatter.format(maximum)}`;
            const editHref = `/admin/products/${product.id}/edit`;

            return (
              <div className="grid gap-4 px-5 py-5 md:grid-cols-[80px_2fr_1fr_1fr_1.3fr_auto] md:items-center" key={product.id}>
                <Link className="relative h-20 w-20 overflow-hidden rounded-xl bg-zinc-100" href={editHref}>
                  {product.base_images?.[0] ? (
                    <Image alt="" className="object-cover" fill src={product.base_images[0]} unoptimized />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-zinc-500">No photo</span>
                  )}
                </Link>
                <div>
                  <span className="text-sm font-medium text-zinc-500 md:hidden">Name</span>
                  <Link className="block text-lg font-semibold hover:underline" href={editHref}>{product.name}</Link>
                </div>
                <div><span className="text-sm font-medium text-zinc-500 md:hidden">Category: </span>{product.categories?.name ?? "—"}</div>
                <div>
                  <span className="text-sm font-medium text-zinc-500 md:hidden">Status: </span>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${product.status === "active" ? "bg-green-100 text-green-800" : product.status === "out_of_stock" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"}`}>
                    {product.status === "active" ? "Active" : product.status === "out_of_stock" ? "Out of stock" : "Draft"}
                  </span>
                </div>
                <div><span className="text-sm font-medium text-zinc-500 md:hidden">Price: </span>{priceRange}</div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Link className="inline-flex min-h-11 items-center rounded-lg border border-zinc-300 px-4 font-medium hover:bg-zinc-100" href={editHref}>Edit</Link>
                  <form action={duplicateProduct.bind(null, product.id)}>
                    <button className="min-h-11 rounded-lg border border-zinc-300 px-4 font-medium hover:bg-zinc-100" type="submit">Duplicate</button>
                  </form>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-base font-semibold hover:bg-zinc-100 disabled:opacity-50"
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
