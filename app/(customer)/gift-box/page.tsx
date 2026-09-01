import { createClient } from "@/lib/supabase/server";
import { GiftBoxBuilder } from "./gift-box-builder";

export default async function GiftBoxPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, base_images, product_variants(price, size, stock_status)")
    .eq("status", "active")
    .eq("is_giftable", true)
    .order("created_at", { ascending: false });

  const { data: settings } = await supabase
    .from("store_settings")
    .select("gift_wrap_fee")
    .maybeSingle();

  return (
    <GiftBoxBuilder
      giftWrapFee={settings?.gift_wrap_fee ?? 0}
      products={products ?? []}
    />
  );
}
