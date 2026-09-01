"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isValidEmail, isValidPakistaniPhone } from "@/lib/validation";

export async function saveSettings(formData: FormData) {
  const deliveryCharge = Number(formData.get("delivery_charge"));

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    redirect("/admin/settings?error=invalid");
  }

  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim() || null;
  const storeContactEmail =
    String(formData.get("store_contact_email") ?? "").trim() || null;

  if (whatsappNumber && !isValidPakistaniPhone(whatsappNumber)) {
    redirect("/admin/settings?error=validation");
  }

  if (storeContactEmail && !isValidEmail(storeContactEmail)) {
    redirect("/admin/settings?error=validation");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const values = {
    delivery_charge: deliveryCharge,
    whatsapp_number: whatsappNumber,
    store_contact_email: storeContactEmail,
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
