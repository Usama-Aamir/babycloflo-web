"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductCard } from "./product-card";
import type { CategoryTileData, ProductSummary } from "./storefront.types";

export function HomeContent({
  categories,
  products,
}: {
  categories: CategoryTileData[];
  products: ProductSummary[];
}) {
  const [search, setSearch] = useState("");
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? products.filter((product) => product.name.toLocaleLowerCase().includes(query))
      : products;
  }, [products, search]);

  return (
    <div className="mx-auto w-full max-w-6xl py-6 sm:py-8">
      <section>
        <label className="relative block" htmlFor="product-search">
          <span className="sr-only">Search products</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 5 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
          <input
            className="h-14 w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 text-base shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary-light sm:text-lg"
            id="product-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            type="search"
            value={search}
          />
        </label>
      </section>

      <section className="mt-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          Shop by category
        </h1>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {categories.map((category) => (
            <Link
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-primary-light"
              href={`/category/${category.slug}`}
              key={category.id}
            >
              <div className="relative aspect-[4/3] bg-brand-primary-light">
                {category.image_url ? (
                  <Image alt={category.name} className="object-cover transition duration-300 group-hover:scale-[1.03]" fill sizes="(max-width: 640px) 50vw, 25vw" src={category.image_url} unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-primary/40" aria-hidden="true">
                    <svg fill="none" height="40" viewBox="0 0 24 24" width="40">
                      <path d="M5 7h14v13H5V7Zm3 0a4 4 0 0 1 8 0M8 12h8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="px-3 py-3 text-center">
                <span className="text-sm font-medium text-zinc-900 sm:text-base">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          {search ? "Search results" : "Featured products"}
        </h2>
        {filteredProducts.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center text-base text-zinc-600 sm:text-lg">
            No products found
          </div>
        )}
      </section>
    </div>
  );
}
