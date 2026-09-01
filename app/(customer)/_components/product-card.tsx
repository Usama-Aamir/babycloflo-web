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
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-primary-light"
      href={`/product/${product.id}`}
    >
      <div className="relative aspect-[4/3] bg-brand-primary-light sm:aspect-square">
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
          <div className="flex h-full items-center justify-center text-brand-primary/40" aria-hidden="true">
            <svg fill="none" height="40" viewBox="0 0 24 24" width="40">
              <path d="M4 6h16v14H4V6Zm4 0a4 4 0 0 1 8 0M8 14l2.5-2.5 2 2L15 11l3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-zinc-900 sm:min-h-[3rem] sm:text-base sm:leading-6">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-base font-semibold text-brand-primary-dark sm:text-lg">
          {startingPrice === null
            ? "Price coming soon"
            : `From Rs ${priceFormatter.format(startingPrice)}`}
        </p>
      </div>
    </Link>
  );
}
