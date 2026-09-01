"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
});

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const rawTotal = searchParams.get("total");
  const orderId = searchParams.get("order");
  const total = rawTotal ? Number(rawTotal) : 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="rounded-3xl bg-white px-6 py-14 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg aria-hidden="true" fill="none" height="32" viewBox="0 0 24 24" width="32">
            <path d="M5 12l5 5L20 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you for your order!</h1>
        <p className="mt-3 text-lg text-zinc-600">
          We received your order{orderId ? ` (#${orderId.slice(0, 8)})` : ""} and will contact you soon to confirm delivery details.
        </p>

        <p className="mt-6 text-2xl font-bold text-rose-700">
          {Number.isFinite(total) && total > 0 ? priceFormatter.format(total) : "Total confirmed"}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-6 font-semibold text-white hover:bg-rose-700"
            href="/"
          >
            Continue shopping
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 px-6 font-semibold text-zinc-700 hover:bg-zinc-50"
            href="/account/orders"
          >
            View my orders
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-zinc-500">Loading order details…</p>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
