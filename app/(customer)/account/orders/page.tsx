"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/account/login?redirect=/account/orders");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn’t load your orders. Please try again.");
        setIsLoading(false);
        return;
      }

      setOrders((data as Order[]) ?? []);
      setIsLoading(false);
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center py-10">
        <p className="text-center text-zinc-500">Loading your orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-6 sm:py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">My orders</h1>
        <button
          className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100"
          onClick={handleLogout}
          type="button"
        >
          Log out
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white px-5 py-14 text-center shadow-sm sm:mt-10 sm:py-16">
          <p className="text-base text-zinc-600 sm:text-lg">You haven’t placed any orders yet.</p>
          <Link
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white transition hover:bg-brand-primary-dark sm:h-12 sm:text-base"
            href="/"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <li className="rounded-2xl bg-white p-4 shadow-sm sm:p-5" key={order.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900">Order #{order.id.slice(0, 8)}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "shipped" || order.status === "packed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p className="mt-3 text-sm text-zinc-600">
                Placed from {order.city}. We&apos;ll contact you at {order.phone} when it ships.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
