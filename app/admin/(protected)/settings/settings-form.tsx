"use client";

import { useState } from "react";

import { isValidEmail, isValidPakistaniPhone } from "@/lib/validation";
import { saveSettings } from "./actions";

const inputClass =
  "min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

type Settings = {
  delivery_charge: number;
  gift_wrap_fee: number;
  whatsapp_number: string | null;
  store_contact_email: string | null;
  store_address: string | null;
};

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  function validateWhatsapp(value: string) {
    if (!value.trim()) {
      setWhatsappError(null);
      return true;
    }
    if (!isValidPakistaniPhone(value)) {
      setWhatsappError("Please enter a valid Pakistani phone number, like 03001234567");
      return false;
    }
    setWhatsappError(null);
    return true;
  }

  function validateEmail(value: string) {
    if (!value.trim()) {
      setEmailError(null);
      return true;
    }
    if (!isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  }

  return (
    <form
      action={saveSettings}
      className="mt-8 space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8"
      onSubmit={(event) => {
        const form = event.currentTarget as HTMLFormElement;
        const whatsapp = (form.elements.namedItem("whatsapp_number") as HTMLInputElement)?.value ?? "";
        const email = (form.elements.namedItem("store_contact_email") as HTMLInputElement)?.value ?? "";
        const whatsappValid = validateWhatsapp(whatsapp);
        const emailValid = validateEmail(email);
        if (!whatsappValid || !emailValid) {
          event.preventDefault();
        }
      }}
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
          onBlur={(e) => validateWhatsapp(e.target.value)}
          onChange={(e) => {
            if (whatsappError) validateWhatsapp(e.target.value);
          }}
          type="text"
        />
        <p className="mt-2 text-sm text-zinc-600">Include country code, e.g. 923001234567</p>
        {whatsappError ? <p className="mt-2 text-sm text-red-600">{whatsappError}</p> : null}
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
          onBlur={(e) => validateEmail(e.target.value)}
          onChange={(e) => {
            if (emailError) validateEmail(e.target.value);
          }}
          type="email"
        />
        {emailError ? <p className="mt-2 text-sm text-red-600">{emailError}</p> : null}
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
  );
}
