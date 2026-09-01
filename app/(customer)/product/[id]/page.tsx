import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProductDetailView } from "../../_components/product-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", id)
    .eq("status", "active")
    .single();

  return {
    title: product?.name ?? "Product",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: settings }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, description, base_images, product_variants(id, size, finish, price, stock_status, variant_colors(id, color_name, swatch_image_url))",
      )
      .eq("id", id)
      .eq("status", "active")
      .single(),
    supabase
      .from("store_settings")
      .select("whatsapp_number")
      .limit(1)
      .maybeSingle(),
  ]);

  if (!product) notFound();

  return (
    <ProductDetailView
      product={product}
      whatsappNumber={settings?.whatsapp_number ?? null}
    />
  );
}
