"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Baby, Droplet, Scissors, Shirt, Puzzle, ShoppingBag, Heart, Star, Baby as BabyIcon, SearchX, type LucideIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "./product-card";
import type { CategoryTileData, ProductSummary } from "./storefront.types";
import { categoryColor, BANNER_PINK } from "./playful-palette";

const SEARCH_LIMIT = 20;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  feeding: Baby,
  "bath-hygiene": Droplet,
  "hair-care": Scissors,
  clothing: Shirt,
  "baby-toys": Puzzle,
};

function categoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? ShoppingBag;
}

function WaveDivider({ flip = false, color = "#fffaf7" }: { flip?: boolean; color?: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none -mt-1 h-6 w-full sm:h-8"
      preserveAspectRatio="none"
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
      viewBox="0 0 1440 48"
    >
      <path
        d="M0,24 C120,40 240,8 360,24 C480,40 600,8 720,24 C840,40 960,8 1080,24 C1200,40 1320,8 1440,24 L1440,48 L0,48 Z"
        fill={color}
      />
    </svg>
  );
}

export function HomeContent({
  categories,
  products,
}: {
  categories: CategoryTileData[];
  products: ProductSummary[];
}) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSummary[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const trimmedSearch = search.trim();

  // Debounced search against the full active product catalogue.
  useEffect(() => {
    if (!trimmedSearch) {
      setSearchResults(null);
      return;
    }

    const handle = setTimeout(async () => {
      setIsSearching(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, base_images, created_at, product_variants(id, price, size)")
        .eq("status", "active")
        .ilike("name", `%${trimmedSearch}%`)
        .order("created_at", { ascending: false })
        .range(0, SEARCH_LIMIT - 1);
      setSearchResults(data ?? []);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(handle);
  }, [trimmedSearch]);

  const displayProducts = searchResults ?? products;

  return (
    <div className="mx-auto w-full max-w-6xl py-6 sm:py-8">
      <section
        className="relative mb-6 overflow-hidden rounded-3xl px-5 py-5 text-white sm:px-6 sm:py-6"
        style={{ backgroundColor: BANNER_PINK }}
      >
        {/* Soft floating blobs */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full opacity-25 sm:h-44 sm:w-44"
          style={{ backgroundColor: "#F0997B" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 bottom-6 h-24 w-24 rounded-full opacity-20 sm:h-32 sm:w-32"
          style={{ backgroundColor: "#F7B6CE" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 top-2 h-16 w-16 rounded-full opacity-20 sm:h-20 sm:w-20"
          style={{ backgroundColor: "#FCE8EE" }}
        />

        <BabyIcon className="pointer-events-none absolute -right-3 -top-3 text-white/20" size={80} strokeWidth={1.2} aria-hidden="true" />
        <Heart className="pointer-events-none absolute right-14 bottom-2 text-white/25" size={34} strokeWidth={1.5} aria-hidden="true" />
        <Star className="pointer-events-none absolute left-4 top-2 text-white/20" size={26} strokeWidth={1.5} aria-hidden="true" />
        <div className="relative">
          <p className="text-lg font-bold sm:text-xl">Now Open — Affordable Baby Feeders, Bottles &amp; More</p>
          <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">Quality baby essentials, delivered across Pakistan.</p>
        </div>
      </section>

      <WaveDivider />

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
        <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto sm:gap-4">
          {categories.map((category, index) => {
            const color = categoryColor(index);
            const Icon = categoryIcon(category.slug);
            return (
              <Link
                className="group w-[42vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-black/5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-primary-light sm:w-48"
                href={`/category/${category.slug}`}
                key={category.id}
                style={{ backgroundColor: color.bg }}
              >
                <div
                  className="relative aspect-[4/3]"
                  style={{ backgroundColor: color.bg }}
                >
                  {category.image_url ? (
                    <Image alt={category.name} className="object-cover transition duration-300 group-hover:scale-[1.03]" fill sizes="(max-width: 640px) 42vw, 192px" src={category.image_url} unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center" aria-hidden="true" style={{ color: color.text, opacity: 0.55 }}>
                      <Icon size={44} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="px-3 py-3 text-center">
                  <span className="text-sm font-semibold sm:text-base" style={{ color: color.text }}>
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <WaveDivider flip />

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          {trimmedSearch ? "Search results" : "Featured products"}
        </h2>
        {isSearching ? (
          <p className="mt-4 text-base text-zinc-500">Searching…</p>
        ) : displayProducts.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {displayProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center sm:py-16">
            <SearchX className="mx-auto h-10 w-10 text-zinc-400" strokeWidth={1.5} />
            <p className="mt-3 text-base font-medium text-zinc-700 sm:text-lg">
              {trimmedSearch ? "No products match your search" : "No products found"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {trimmedSearch ? "Try a different keyword or browse categories instead." : "Check back soon — new arrivals are on the way!"}
            </p>
            {trimmedSearch ? (
              <button
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-white transition active:scale-95 hover:bg-brand-primary-dark sm:h-12 sm:text-base"
                onClick={() => setSearch("")}
                type="button"
              >
                Clear search
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
