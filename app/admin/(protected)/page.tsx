import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 2,
});

function statusPillClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "packed":
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

function statusLabel(status: string) {
  return status === "pending"
    ? "Pending"
    : status === "packed"
      ? "Packed"
      : status === "shipped"
        ? "Shipped"
        : "Delivered";
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: pendingCount },
    { count: outOfStockCount },
    { count: whatsappPendingCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .eq("stock_status", "out_of_stock"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("order_type", "whatsapp")
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select(
        `*,
        order_items (
          id,
          quantity,
          price_at_purchase,
          product:product_id ( name )
        )`,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Assalam-o-Alaikum, Baby Clo Flo</h1>
      <p className="mt-2 text-zinc-600">Here&apos;s what needs attention today.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          className="group rounded-2xl bg-amber-50 p-6 transition-colors hover:bg-amber-100"
          href="/admin/orders"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">New Orders</p>
          <p className="mt-3 text-4xl font-bold text-amber-800">{pendingCount ?? 0}</p>
          <p className="mt-2 text-sm font-medium text-amber-800 group-hover:underline">
            View orders →
          </p>
        </Link>

        <Link
          className="group rounded-2xl bg-zinc-100 p-6 transition-colors hover:bg-zinc-200"
          href="/admin/products/new"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Add Product</p>
          <p className="mt-3 text-4xl font-bold text-zinc-900">+</p>
          <p className="mt-2 text-sm font-medium text-zinc-700 group-hover:underline">
            Create new →
          </p>
        </Link>

        <Link
          className="group rounded-2xl bg-red-50 p-6 transition-colors hover:bg-red-100"
          href="/admin/products"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-red-900">Out of Stock</p>
          <p className="mt-3 text-4xl font-bold text-red-800">{outOfStockCount ?? 0}</p>
          <p className="mt-2 text-sm font-medium text-red-800 group-hover:underline">
            View products →
          </p>
        </Link>

        <Link
          className="group rounded-2xl bg-green-50 p-6 transition-colors hover:bg-green-100"
          href="/admin/orders?filter=whatsapp"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-green-900">
            WhatsApp Orders
          </p>
          <p className="mt-3 text-4xl font-bold text-green-800">{whatsappPendingCount ?? 0}</p>
          <p className="mt-2 text-sm font-medium text-green-800 group-hover:underline">
            View WhatsApp →
          </p>
        </Link>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent orders</h2>
          <Link className="font-medium text-zinc-700 hover:underline" href="/admin/orders">
            View all
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <p className="text-zinc-600">No orders yet.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {recentOrders.map((order) => {
              const items =
                (order.order_items as {
                  id: string;
                  quantity: number;
                  price_at_purchase: number;
                  product: { name: string } | null;
                }[]) ??
                [];
              const itemSummary =
                items.length > 0
                  ? items.map((item) => `${item.product?.name ?? "Item"} × ${item.quantity}`).join(", ")
                  : order.notes || "No items";
              const total =
                order.delivery_charge +
                order.gift_wrap_fee +
                items.reduce((sum, item) => sum + item.quantity * item.price_at_purchase, 0);

              return (
                <Link
                  className="block p-5 transition-colors hover:bg-zinc-50"
                  href="/admin/orders"
                  key={order.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-900">{order.customer_name}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(order.status)}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{itemSummary}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-zinc-900">{priceFormatter.format(total)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
