import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { AdminProductsList, type AdminProductRow } from "./_components/admin-products-list";

const PAGE_SIZE = 20;

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
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

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

      {!error ? (
        <AdminProductsList initialProducts={(products ?? []) as AdminProductRow[]} pageSize={PAGE_SIZE} />
      ) : null}
    </main>
  );
}
