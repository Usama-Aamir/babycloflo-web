"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function saveSettings(formData: FormData) {
  const deliveryCharge = Number(formData.get("delivery_charge"));
  const giftWrapFee = Number(formData.get("gift_wrap_fee"));

  if (
    !Number.isFinite(deliveryCharge) ||
    deliveryCharge < 0 ||
    !Number.isFinite(giftWrapFee) ||
    giftWrapFee < 0
  ) {
    redirect("/admin/settings?error=invalid");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const values = {
    delivery_charge: deliveryCharge,
    gift_wrap_fee: giftWrapFee,
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim() || null,
    store_contact_email:
      String(formData.get("store_contact_email") ?? "").trim() || null,
    store_address: String(formData.get("store_address") ?? "").trim() || null,
  };

  const { data: existing, error: loadError } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (loadError) redirect("/admin/settings?error=save");

  const { error } = existing
    ? await supabase.from("store_settings").update(values).eq("id", existing.id)
    : await supabase.from("store_settings").insert(values);

  if (error) redirect("/admin/settings?error=save");

  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
