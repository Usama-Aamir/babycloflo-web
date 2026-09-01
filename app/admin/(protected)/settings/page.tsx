import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const messages = await searchParams;
  const supabase = await createClient();
  const { data: settings, error } = await supabase
    .from("store_settings")
    .select(
      "delivery_charge, whatsapp_number, store_contact_email, store_address",
    )
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-zinc-600">
          Update delivery and store contact details.
        </p>
      </div>

      {messages.saved === "1" ? (
        <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-green-800" role="status">
          Settings saved
        </p>
      ) : null}
      {messages.error === "invalid" ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">
          Please enter valid charges of zero or more.
        </p>
      ) : null}
      {messages.error === "validation" ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">
          Please fix the highlighted fields before saving.
        </p>
      ) : null}
      {messages.error === "save" || error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">
          We couldn&apos;t save the settings. Please try again.
        </p>
      ) : null}

      <SettingsForm settings={settings} />
    </main>
  );
}
