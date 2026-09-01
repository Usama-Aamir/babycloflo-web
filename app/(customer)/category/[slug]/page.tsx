import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CategoryProducts } from "../../_components/category-products";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, base_images, product_variants(price, size)")
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6 sm:px-6 sm:pt-10">
      <Link className="inline-flex min-h-12 items-center gap-2 rounded-xl pr-4 font-semibold text-zinc-700" href="/">
        <span aria-hidden="true">←</span> Back
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
      <CategoryProducts products={products ?? []} />
    </main>
  );
}
