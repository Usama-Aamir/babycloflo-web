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
    <div className="mx-auto max-w-2xl py-12 text-center sm:py-16">
      <div className="rounded-3xl bg-white px-5 py-12 shadow-sm sm:px-6 sm:py-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 sm:h-16 sm:w-16">
          <svg aria-hidden="true" fill="none" height="28" viewBox="0 0 24 24" width="28">
            <path d="M5 12l5 5L20 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900 sm:mt-6 sm:text-3xl">
          Thank you for your order!
        </h1>
        <p className="mt-3 text-base text-zinc-600 sm:text-lg">
          We received your order{orderId ? ` (#${orderId.slice(0, 8)})` : ""} and will contact you soon to confirm delivery details.
        </p>

        <p className="mt-5 text-xl font-semibold text-brand-primary-dark sm:text-2xl">
          {Number.isFinite(total) && total > 0 ? priceFormatter.format(total) : "Total confirmed"}
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white transition hover:bg-brand-primary-dark sm:h-12 sm:text-base"
            href="/"
          >
            Continue shopping
          </Link>
          <Link
            className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-xl border border-zinc-200 px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:h-12 sm:text-base"
            href="/account/orders"
          >
            View my orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center py-16 text-center">
          <p className="text-zinc-500">Loading order details…</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
