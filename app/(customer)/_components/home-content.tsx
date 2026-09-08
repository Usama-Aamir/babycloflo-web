"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Baby, Droplet, Scissors, Shirt, Puzzle, ShoppingBag, SearchX, type LucideIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "./product-card";
import type { CategoryTileData, ProductSummary } from "./storefront.types";
import { categoryColor } from "./playful-palette";
import { PlayfulDecor } from "./playful-decor";

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

  function scrollToCategories() {
    document.getElementById("shop-by-category")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="relative">
      <PlayfulDecor preset="home" />
      <div className="relative z-10 mx-auto w-full max-w-6xl py-6 sm:py-8">
        <section
          aria-labelledby="hero-heading"
          className="relative mb-6 overflow-hidden rounded-3xl px-5 py-12 text-center sm:px-8 sm:py-16"
          style={{ background: "linear-gradient(135deg, #EAF6FB 0%, #FBEAF0 100%)" }}
        >
          {/* Floating background icons — full product range, low opacity, gentle bob */}
          <span aria-hidden="true" className="hero-float pointer-events-none absolute left-[6%] top-[12%] text-[#4FA9D1] opacity-[0.15]" style={{ animationDelay: "0s" }}>
            <Baby size={56} strokeWidth={1.2} />
          </span>
          <span aria-hidden="true" className="hero-float pointer-events-none absolute left-[12%] bottom-[10%] text-[#5DCAA5] opacity-[0.15]" style={{ animationDelay: "0.8s" }}>
            <Droplet size={48} strokeWidth={1.2} />
          </span>
          <span aria-hidden="true" className="hero-float pointer-events-none absolute right-[8%] top-[14%] text-[#F0997B] opacity-[0.15]" style={{ animationDelay: "1.2s" }}>
            <Shirt size={52} strokeWidth={1.2} />
          </span>
          <span aria-hidden="true" className="hero-float pointer-events-none absolute right-[6%] bottom-[12%] text-[#7F77DD] opacity-[0.15]" style={{ animationDelay: "0.4s" }}>
            <Puzzle size={56} strokeWidth={1.2} />
          </span>
          <span aria-hidden="true" className="hero-float pointer-events-none absolute left-[40%] top-[6%] text-[#EF9F27] opacity-[0.12]" style={{ animationDelay: "1.6s" }}>
            <Scissors size={40} strokeWidth={1.2} />
          </span>
          <span aria-hidden="true" className="hero-float pointer-events-none absolute right-[38%] bottom-[6%] text-[#D4537E] opacity-[0.12]" style={{ animationDelay: "2s" }}>
            <ShoppingBag size={44} strokeWidth={1.2} />
          </span>
          <span aria-hidden="true" className="hero-float pointer-events-none absolute left-[44%] bottom-[16%] hidden text-[#4FA9D1] opacity-[0.10] sm:block" style={{ animationDelay: "2.4s" }}>
            <Baby size={64} strokeWidth={1} />
          </span>

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4537E] sm:text-sm">Now open in Pakistan</p>
            <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-[#1E3A45] sm:text-[32px]" id="hero-heading">
              Everything Your Little One Needs
            </h1>
            <p className="mt-3 max-w-xl text-sm text-[#4A6C77] sm:text-base">
              Feeders, clothing, toys, hair &amp; bath care — delivered across Pakistan, cash on delivery
            </p>
            <button
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#D4537E] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C2426D] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#D4537E]/30 sm:h-14 sm:text-base"
              onClick={scrollToCategories}
              type="button"
            >
              Shop Now
            </button>
            {categories.length > 0 ? (
              <ul aria-label="Categories" className="mt-6 flex flex-wrap justify-center gap-2.5">
                {categories.map((category, index) => {
                  const color = categoryColor(index);
                  const Icon = categoryIcon(category.slug);
                  return (
                    <li key={category.id}>
                      <Link
                        aria-label={category.name}
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-primary-light"
                        href={`/category/${category.slug}`}
                        style={{ backgroundColor: color.bg, color: color.text }}
                        title={category.name}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </section>

      <section className="mt-6">
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

      <section className="relative mt-8 scroll-mt-24" id="shop-by-category">
        <div className="relative z-10">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
            Shop by category
          </h2>
          <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto sm:justify-center sm:gap-4">
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
        </div>
      </section>

      <section className="relative mt-10">
        <div className="relative z-10">
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
        </div>
      </section>
    </div>
    </div>
  );
}
