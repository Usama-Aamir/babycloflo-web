import Image from "next/image";
import Link from "next/link";

import type { ProductSummary } from "./storefront.types";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export function ProductCard({ product }: { product: ProductSummary }) {
  const prices = product.product_variants.map(({ price }) => Number(price));
  const startingPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <Link
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-200"
      href={`/product/${product.id}`}
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
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-zinc-900 sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-2 text-xl font-bold text-rose-700">
          {startingPrice === null
            ? "Price coming soon"
            : `From Rs ${priceFormatter.format(startingPrice)}`}
        </p>
      </div>
    </Link>
  );
}
