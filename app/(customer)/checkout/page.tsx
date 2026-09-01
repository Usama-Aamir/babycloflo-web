"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isValidPakistaniPhone } from "@/lib/validation";
import { useCart } from "../_components/cart-context";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
});

export default function CheckoutPage() {
  const { items, isLoaded, subtotal, clearCart } = useCart();
  const router = useRouter();
  const supabase = createClient();

  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const total = subtotal + deliveryCharge;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    supabase
      .from("store_settings")
      .select("delivery_charge")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.delivery_charge != null) {
          setDeliveryCharge(data.delivery_charge);
        }
      });
  }, [supabase]);

  const cartOrderItems = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        color_id: item.color_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
    [items],
  );

  function validatePhone(value = phone) {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, phone: "Please enter a phone number." }));
      return false;
    }
    if (!isValidPakistaniPhone(value)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid Pakistani phone number, like 03001234567",
      }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      return next;
    });
    return true;
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your full name.";
    if (!phone.trim()) {
      next.phone = "Please enter a phone number.";
    } else if (!isValidPakistaniPhone(phone)) {
      next.phone = "Please enter a valid Pakistani phone number, like 03001234567";
    }
    if (!address.trim()) next.address = "Please enter your delivery address.";
    if (!city.trim()) next.city = "Please enter your city.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!validate() || items.length === 0) return;

    setIsBusy(true);

    const orderPayload = {
      order_type: "website" as const,
      customer_name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      delivery_charge: deliveryCharge,
      status: "pending" as const,
      customer_id: session?.user.id ?? null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (orderError || !order) {
      setIsBusy(false);
      setSubmitError("We couldn’t place your order. Please try again.");
      return;
    }

    const orderItems = cartOrderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      color_id: item.color_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      setIsBusy(false);
      setSubmitError("We saved the order but had trouble adding the items. Please contact us.");
      return;
    }

    clearCart();
    router.push(`/checkout/success?total=${total}&order=${order.id}`);
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center py-10">
        <p className="text-center text-zinc-500">Loading checkout…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Checkout</h1>
        <p className="mt-4 text-zinc-600">Your cart is empty.</p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-primary px-6 font-semibold text-white hover:bg-brand-primary-dark"
          href="/"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Checkout</h1>

      {!session ? (
        <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          Checking out as a guest.{" "}
          <Link className="font-semibold text-brand-primary-dark hover:underline" href="/account/login?redirect=/checkout">
            Log in
          </Link>{" "}
          if you have an account — it’s optional.
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900">
          You’re logged in as {session.user.email}.{" "}
          <button
            className="font-semibold text-green-800 hover:underline"
            onClick={() => supabase.auth.signOut().then(() => setSession(null))}
            type="button"
          >
            Log out
          </button>{" "}
          to check out as a guest instead.
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700 sm:text-base">
          {items.map((item) => (
            <li className="flex justify-between" key={`${item.variant_id}:${item.color_id ?? "no-color"}`}>
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span className="font-medium">{priceFormatter.format(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <div className="flex justify-between text-sm text-zinc-700 sm:text-base">
            <span>Subtotal</span>
            <span className="font-medium">{priceFormatter.format(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-700 sm:text-base">
            <span>Delivery</span>
            <span className="font-medium">
              {deliveryCharge ? priceFormatter.format(deliveryCharge) : "Free"}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{priceFormatter.format(total)}</span>
          </div>
        </div>
      </div>

      <form className="mt-6 space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:text-base" htmlFor="name">
            Full name
          </label>
          <input
            autoComplete="name"
            className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:text-lg"
            id="name"
            name="name"
            onChange={(e) => setName(e.target.value)}
            required
            type="text"
            value={name}
          />
          {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:text-base" htmlFor="phone">
            Phone number
          </label>
          <input
            autoComplete="tel"
            className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:text-lg"
            id="phone"
            inputMode="tel"
            name="phone"
            onBlur={() => validatePhone()}
            onChange={(e) => setPhone(e.target.value)}
            required
            type="tel"
            value={phone}
          />
          {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:text-base" htmlFor="address">
            Delivery address
          </label>
          <textarea
            autoComplete="street-address"
            className="min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:text-lg"
            id="address"
            name="address"
            onChange={(e) => setAddress(e.target.value)}
            required
            value={address}
          />
          {errors.address ? <p className="mt-2 text-sm text-red-600">{errors.address}</p> : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-800 sm:text-base" htmlFor="city">
            City
          </label>
          <input
            autoComplete="address-level2"
            className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 sm:h-14 sm:text-lg"
            id="city"
            name="city"
            onChange={(e) => setCity(e.target.value)}
            required
            type="text"
            value={city}
          />
          {errors.city ? <p className="mt-2 text-sm text-red-600">{errors.city}</p> : null}
        </div>

        {submitError ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-700" role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          className="h-14 w-full rounded-2xl bg-brand-primary px-5 text-base font-bold text-white transition hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:text-lg"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? "Placing order…" : `Place order — ${priceFormatter.format(total)}`}
        </button>

        <p className="text-center text-sm text-zinc-500">
          By placing this order you agree to our terms. No account required.
        </p>
      </form>
    </div>
  );
}
