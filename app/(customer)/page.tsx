import { createClient } from "@/lib/supabase/server";
import { HomeContent } from "./_components/home-content";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .order("sort_order"),
    supabase
      .from("products")
      .select("id, name, base_images, product_variants(price, size)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return <HomeContent categories={categories ?? []} products={products ?? []} />;
}
