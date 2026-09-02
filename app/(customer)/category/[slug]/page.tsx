import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CategoryProducts } from "../../_components/category-products";

const PAGE_SIZE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();

  return {
    title: category?.name ?? "Category",
  };
}

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
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return (
    <div className="mx-auto w-full max-w-6xl py-6 sm:py-8">
      <Link
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-brand-primary-light"
        href="/"
      >
        <span aria-hidden="true">←</span> Back
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:mt-4 sm:text-3xl">
        {category.name}
      </h1>
      <CategoryProducts
        categoryId={category.id}
        initialProducts={products ?? []}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
