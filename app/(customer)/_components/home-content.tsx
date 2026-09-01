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
    <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6 sm:pt-10">
      <section>
        <label className="relative block" htmlFor="product-search">
          <span className="sr-only">Search products</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden="true" fill="none" height="25" viewBox="0 0 24 24" width="25">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 5 5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          </svg>
          <input
            className="min-h-16 w-full rounded-2xl border border-brand-primary-light bg-white pl-14 pr-4 text-lg shadow-sm outline-none placeholder:text-zinc-500 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary-light"
            id="product-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            type="search"
            value={search}
          />
        </label>
      </section>

      <section className="mt-6">
        <Link
          className="group flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent p-5 text-white shadow-sm transition hover:shadow-md"
          href="/gift-box"
        >
          <div>
            <h2 className="text-xl font-bold">Build a Gift Box</h2>
            <p className="mt-1 text-sm font-medium text-white/90">
              Pick 3–5 items and we&apos;ll wrap them beautifully.
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/30">
            <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
              <path d="M5 12h14m0 0-7-7m7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
        </Link>
      </section>

      <section className="mt-9">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shop by category</h1>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              className="group overflow-hidden rounded-2xl border border-brand-primary-light bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-primary-light"
              href={`/category/${category.slug}`}
              key={category.id}
            >
              <div className="relative aspect-[4/3] bg-brand-primary-light">
                {category.image_url ? (
                  <Image alt={category.name} className="object-cover transition duration-300 group-hover:scale-[1.03]" fill sizes="(max-width: 640px) 50vw, 25vw" src={category.image_url} unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-primary/40" aria-hidden="true">
                    <svg fill="none" height="56" viewBox="0 0 24 24" width="56">
                      <path d="M5 7h14v13H5V7Zm3 0a4 4 0 0 1 8 0M8 12h8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex min-h-14 items-center justify-center px-3 text-center text-base font-bold sm:text-lg">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-11">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {search ? "Search results" : "Featured products"}
        </h2>
        {filteredProducts.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-12 text-center text-lg text-zinc-600">
            No products found
          </div>
        )}
      </section>
    </main>
  );
}
