import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProductWizard } from "../../product-wizard";
import type { StockStatus } from "../../product-form.types";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ duplicated?: string }>;
}) {
  const { id } = await params;
  const { duplicated } = await searchParams;
  const supabase = await createClient();
  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase
      .from("products")
      .select(
        "name, category_id, description, base_images, status, product_variants(id, size, finish, price, stock_status, variant_colors(id, color_name, swatch_image_url))",
      )
      .eq("id", id)
      .single(),
  ]);

  if (!product) notFound();

  return (
    <ProductWizard
      categories={categories ?? []}
      duplicated={duplicated === "1"}
      initialProduct={{
        baseImages: product.base_images ?? [],
        name: product.name,
        categoryId: product.category_id,
        description: product.description ?? "",
        status: product.status === "active" ? "active" : "draft",
        variants: product.product_variants.map((variant) => ({
          key: variant.id,
          size: variant.size,
          finish: variant.finish ?? "",
          price: String(variant.price),
          stockStatus: variant.stock_status as StockStatus,
          colors: variant.variant_colors.map((color) => ({
            key: color.id,
            colorName: color.color_name,
            swatchImageUrl: color.swatch_image_url ?? "",
          })),
        })),
      }}
      productId={id}
    />
  );
}
