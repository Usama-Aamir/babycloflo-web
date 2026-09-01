import { createClient } from "@/lib/supabase/server";
import { saveSettings } from "./actions";

const inputClass =
  "min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

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
      "delivery_charge, gift_wrap_fee, whatsapp_number, store_contact_email, store_address",
    )
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-zinc-600">
          Update delivery, gift wrapping, and store contact details.
        </p>
      </div>

      {messages.saved === "1" ? (
        <p
          className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-green-800"
          role="status"
        >
          Settings saved
        </p>
      ) : null}
      {messages.error === "invalid" ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">
          Please enter valid charges of zero or more.
        </p>
      ) : null}
      {messages.error === "save" || error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">
          We couldn&apos;t save the settings. Please try again.
        </p>
      ) : null}

      <form
        action={saveSettings}
        className="mt-8 space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-base font-medium" htmlFor="delivery_charge">
              Delivery charge
            </label>
            <input
              className={inputClass}
              defaultValue={settings?.delivery_charge ?? 0}
              id="delivery_charge"
              min="0"
              name="delivery_charge"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div>
            <label className="mb-2 block text-base font-medium" htmlFor="gift_wrap_fee">
              Gift wrap fee
            </label>
            <input
              className={inputClass}
              defaultValue={settings?.gift_wrap_fee ?? 0}
              id="gift_wrap_fee"
              min="0"
              name="gift_wrap_fee"
              required
              step="0.01"
              type="number"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-base font-medium" htmlFor="whatsapp_number">
            WhatsApp number
          </label>
          <input
            className={inputClass}
            defaultValue={settings?.whatsapp_number ?? ""}
            id="whatsapp_number"
            inputMode="tel"
            name="whatsapp_number"
            type="text"
          />
          <p className="mt-2 text-sm text-zinc-600">
            Include country code, e.g. 923001234567
          </p>
        </div>

        <div>
          <label className="mb-2 block text-base font-medium" htmlFor="store_contact_email">
            Store contact email (optional)
          </label>
          <input
            autoComplete="email"
            className={inputClass}
            defaultValue={settings?.store_contact_email ?? ""}
            id="store_contact_email"
            name="store_contact_email"
            type="email"
          />
        </div>

        <div>
          <label className="mb-2 block text-base font-medium" htmlFor="store_address">
            Store address (optional)
          </label>
          <textarea
            className={`${inputClass} min-h-36 py-4`}
            defaultValue={settings?.store_address ?? ""}
            id="store_address"
            name="store_address"
          />
        </div>

        <button
          className="min-h-14 w-full rounded-xl bg-zinc-950 px-6 text-lg font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-400 sm:w-auto"
          type="submit"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}
