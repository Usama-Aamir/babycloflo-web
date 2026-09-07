import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import type { ProductSummary } from "./storefront.types";
import { useCart } from "./cart-context";
import { productColor } from "./playful-palette";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

const NEW_THRESHOLD_DAYS = 30;

function isNewProduct(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const cutoff = Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  return created > cutoff;
}

export function ProductCard({ product, index }: { product: ProductSummary; index: number }) {
  const { addItem } = useCart();
  const variants = product.product_variants;
  const cheapestVariant = variants.length > 0
    ? variants.reduce((min, v) => (Number(v.price) < Number(min.price) ? v : min), variants[0])
    : null;
  const startingPrice = cheapestVariant ? Number(cheapestVariant.price) : null;
  const color = productColor(index);
  const showNewBadge = isNewProduct(product.created_at);

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!cheapestVariant) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.base_images?.[0] ?? null,
      variant_id: cheapestVariant.id,
      size: cheapestVariant.size,
      finish: null,
      color_id: null,
      color_name: null,
      price: Number(cheapestVariant.price),
      quantity: 1,
    });
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-within:ring-4 focus-within:ring-brand-primary-light">
      <Link className="relative block aspect-[4/3] bg-brand-primary-light sm:aspect-square" href={`/product/${product.id}`}>
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
        {showNewBadge ? (
          <span
            className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:text-xs"
            style={{ backgroundColor: "#D4537E", color: "#4B1528" }}
          >
            New
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-zinc-900 sm:min-h-[3rem] sm:text-base sm:leading-6">
            {product.name}
          </h3>
        </Link>
        <p className="mt-auto pt-2 text-base font-bold text-[#D4537E] sm:text-lg">
          {startingPrice === null
            ? "Price coming soon"
            : `From Rs ${priceFormatter.format(startingPrice)}`}
        </p>
        {cheapestVariant ? (
          <button
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-white transition active:scale-95 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:h-10 sm:text-base"
            onClick={handleAddToCart}
            style={{ backgroundColor: color.bg, color: color.text }}
            type="button"
          >
            <ShoppingCart size={16} strokeWidth={2} />
            Add to cart
          </button>
        ) : null}
      </div>
    </div>
  );
}
