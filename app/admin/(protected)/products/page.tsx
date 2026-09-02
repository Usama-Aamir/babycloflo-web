import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { duplicateProduct } from "./actions";
import { DeleteProductButton } from "./_components/delete-product-button";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 2,
});

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const messages = await searchParams;
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, status, base_images, categories(name), product_variants(price)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-zinc-600">Add products and manage what customers can see.</p>
        </div>
        <Link className="inline-flex min-h-14 items-center justify-center rounded-xl bg-zinc-950 px-6 text-lg font-semibold text-white hover:bg-zinc-800" href="/admin/products/new">
          + Add Product
        </Link>
      </div>

      {messages.success ? (
        <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-green-800">
          {messages.success === "deleted" ? "Product deleted." : messages.success === "updated" ? "Product updated." : "Product added."}
        </p>
      ) : null}
      {messages.error === "duplicate" ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          We couldn&apos;t duplicate that product. Please try again.
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">
          We couldn&apos;t load the products. Please refresh the page.
        </p>
      ) : null}

      {!error && products?.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <p className="text-xl font-semibold">No products yet</p>
          <p className="mt-2 text-zinc-600">Add your first product to get started.</p>
        </div>
      ) : null}

      {products && products.length > 0 ? (
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
      ) : null}
    </main>
  );
}
