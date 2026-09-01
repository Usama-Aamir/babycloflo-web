"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { isValidPakistaniPhone } from "@/lib/validation";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 2,
});

type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

type PopulatedOrderItem = OrderItemRow & {
  product: { name: string } | null;
  variant: { size: string; finish: string | null } | null;
  color: { color_name: string } | null;
};

type PopulatedOrder = OrderRow & {
  order_items: PopulatedOrderItem[];
};

const statuses = ["pending", "packed", "shipped", "delivered"] as const;

function nextStatus(current: string) {
  const idx = statuses.indexOf(current as (typeof statuses)[number]);
  if (idx >= 0 && idx < statuses.length - 1) return statuses[idx + 1];
  return current;
}

function statusLabel(status: string) {
  return status === "pending" ? "Pending" : status === "packed" ? "Packed" : status === "shipped" ? "Shipped" : "Delivered";
}

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

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function orderItemSummary(order: PopulatedOrder) {
  if (order.order_items.length === 0) return "Items in notes";
  return order.order_items.map((item) => `${item.product?.name ?? "Item"} x${item.quantity}`).join(", ");
}

function buildWhatsAppMessage(order: PopulatedOrder) {
  const summary = orderItemSummary(order);
  const name = order.customer_name;
  switch (order.status) {
    case "packed":
      return `Hi ${name}, your order (${summary}) has been packed and will ship soon. Thank you for shopping with BabyCloFlo!`;
    case "shipped":
      return `Hi ${name}, your order (${summary}) is on its way!`;
    case "delivered":
      return `Hi ${name}, thank you for your order! We hope your baby loves it. - BabyCloFlo`;
    default:
      return `Hi ${name}, your order (${summary}) is being processed.`;
  }
}

type Filter = "all" | "website" | "whatsapp";

function validFilter(value: string | null): Filter {
  return value === "website" || value === "whatsapp" ? value : "all";
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialFilter = validFilter(searchParams.get("filter"));

  const [orders, setOrders] = useState<PopulatedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const supabase = createClient();

  const [logName, setLogName] = useState("");
  const [logPhone, setLogPhone] = useState("");
  const [logCity, setLogCity] = useState("");
  const [logAddress, setLogAddress] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logError, setLogError] = useState<string | null>(null);
  const [logPhoneError, setLogPhoneError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(
        `*,
        order_items (
          id,
          product_id,
          variant_id,
          color_id,
          quantity,
          price_at_purchase,
          product:product_id ( name ),
          variant:variant_id ( size, finish ),
          color:color_id ( color_name )
        )`,
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("Couldn’t load orders. Please try again.");
      setIsLoading(false);
      return;
    }

    setOrders((data as PopulatedOrder[]) ?? []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadOrders();
    supabase
      .from("store_settings")
      .select("delivery_charge")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.delivery_charge != null) setDeliveryCharge(data.delivery_charge);
      });
  }, [supabase, loadOrders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.order_type === filter);
  }, [orders, filter]);

  async function advanceStatus(order: PopulatedOrder) {
    const newStatus = nextStatus(order.status);
    if (newStatus === order.status) return;

    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (updateError) {
      setError("Couldn’t update status. Please try again.");
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)),
    );
  }

  function validateLogPhone(value = logPhone) {
    if (!value.trim()) {
      setLogPhoneError("Please enter a phone number.");
      return false;
    }
    if (!isValidPakistaniPhone(value)) {
      setLogPhoneError("Please enter a valid Pakistani phone number, like 03001234567");
      return false;
    }
    setLogPhoneError(null);
    return true;
  }

  async function handleLogOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLogError(null);

    if (!logName.trim() || !logPhone.trim() || !logCity.trim() || !logAddress.trim()) {
      setLogError("Please fill in name, phone, address, and city.");
      return;
    }

    if (!validateLogPhone()) {
      return;
    }

    setIsLogging(true);

    const { error: insertError } = await supabase.from("orders").insert({
      order_type: "whatsapp",
      status: "pending",
      customer_name: logName.trim(),
      phone: logPhone.trim(),
      address: logAddress.trim(),
      city: logCity.trim(),
      delivery_charge: deliveryCharge,
      notes: logNotes.trim() || null,
    });

    setIsLogging(false);

    if (insertError) {
      setLogError("Couldn’t log the WhatsApp order. Please try again.");
      return;
    }

    setLogName("");
    setLogPhone("");
    setLogCity("");
    setLogAddress("");
    setLogNotes("");
    setIsLogging(false);
    await loadOrders();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-2 text-zinc-600">Manage website and WhatsApp orders.</p>
        </div>
        <button
          className="inline-flex min-h-14 items-center justify-center rounded-xl bg-zinc-950 px-6 text-lg font-semibold text-white hover:bg-zinc-800"
          onClick={() => setIsLogging((s) => !s)}
          type="button"
        >
          {isLogging ? "Close form" : "+ Log WhatsApp order"}
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
      ) : null}

      {isLogging ? (
        <form
          className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          onSubmit={handleLogOrder}
        >
          <h2 className="text-lg font-semibold">Log a WhatsApp order</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="logName">
                Customer name
              </label>
              <input
                className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                id="logName"
                onChange={(e) => setLogName(e.target.value)}
                required
                type="text"
                value={logName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="logPhone">
                Phone
              </label>
              <input
                className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                id="logPhone"
                inputMode="tel"
                onBlur={() => validateLogPhone()}
                onChange={(e) => setLogPhone(e.target.value)}
                required
                type="tel"
                value={logPhone}
              />
              {logPhoneError ? (
                <p className="mt-2 text-sm text-red-600">{logPhoneError}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="logCity">
                City
              </label>
              <input
                className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                id="logCity"
                onChange={(e) => setLogCity(e.target.value)}
                required
                type="text"
                value={logCity}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="logAddress">
                Address
              </label>
              <input
                className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                id="logAddress"
                onChange={(e) => setLogAddress(e.target.value)}
                required
                type="text"
                value={logAddress}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium" htmlFor="logNotes">
                What they ordered (notes)
              </label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                id="logNotes"
                onChange={(e) => setLogNotes(e.target.value)}
                value={logNotes}
              />
            </div>
          </div>
          {logError ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{logError}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-xl bg-zinc-950 px-6 font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
              type="submit"
            >
              Save order
            </button>
            <button
              className="min-h-12 rounded-xl border border-zinc-300 px-6 font-medium hover:bg-zinc-100"
              onClick={() => setIsLogging(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "website", "whatsapp"] as Filter[]).map((f) => (
          <button
            className={`min-h-10 rounded-full px-4 text-sm font-semibold ${
              filter === f
                ? "bg-zinc-950 text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
            key={f}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f === "all" ? "All" : f === "website" ? "Website Orders" : "WhatsApp Orders"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-zinc-500">Loading orders…</p>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <p className="text-xl font-semibold">No {filter === "all" ? "" : filter} orders yet</p>
          <p className="mt-2 text-zinc-600">Use the button above to log a WhatsApp order.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredOrders.map((order) => {
            const subtotal = order.order_items.reduce(
              (sum, item) => sum + item.price_at_purchase * item.quantity,
              0,
            );
            const total = subtotal + order.delivery_charge;
            const expanded = expandedId === order.id;
            const canAdvance = order.status !== "delivered";

            return (
              <div
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                key={order.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">{order.customer_name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClass(
                          order.status,
                        )}`}
                      >
                        {statusLabel(order.status)}
                      </span>
                      {order.customer_id ? (
                        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                          Account
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">
                      {order.phone} · {order.city}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {new Date(order.created_at).toLocaleString()} · #{order.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-zinc-900">{priceFormatter.format(total)}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {order.order_type}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="min-h-11 rounded-lg border border-zinc-300 px-4 font-medium hover:bg-zinc-100"
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    type="button"
                  >
                    {expanded ? "Hide details" : "View details"}
                  </button>
                  {canAdvance ? (
                    <button
                      className="min-h-11 rounded-lg bg-blue-600 px-4 font-medium text-white hover:bg-blue-700"
                      onClick={() => advanceStatus(order)}
                      type="button"
                    >
                      Mark as {statusLabel(nextStatus(order.status))}
                    </button>
                  ) : (
                    <span className="inline-flex min-h-11 items-center rounded-lg bg-green-100 px-4 text-sm font-semibold text-green-800">
                      Delivered
                    </span>
                  )}
                  <a
                    className="inline-flex min-h-11 items-center rounded-lg border border-green-600 px-4 font-medium text-green-700 hover:bg-green-50"
                    href={`https://wa.me/${cleanPhone(order.phone)}?text=${encodeURIComponent(
                      buildWhatsAppMessage(order),
                    )}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Send update
                  </a>
                </div>

                {expanded ? (
                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    <h3 className="font-semibold text-zinc-900">Items</h3>
                    {order.order_items.length > 0 ? (
                      <ul className="mt-3 divide-y divide-zinc-100">
                        {order.order_items.map((item) => (
                          <li className="flex flex-wrap justify-between gap-2 py-3" key={item.id}>
                            <div>
                              <p className="font-medium text-zinc-900">
                                {item.product?.name ?? "Product"}
                              </p>
                              <p className="text-sm text-zinc-500">
                                {[
                                  item.variant?.size,
                                  item.variant?.finish,
                                  item.color?.color_name,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-zinc-900">
                                {priceFormatter.format(item.price_at_purchase)} × {item.quantity}
                              </p>
                              <p className="text-sm text-zinc-500">
                                {priceFormatter.format(item.price_at_purchase * item.quantity)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-zinc-500">
                        No linked items. Notes: {order.notes || "—"}
                      </p>
                    )}

                    <div className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-sm text-zinc-600">
                      <p>
                        <span className="font-medium">Address:</span> {order.address}
                      </p>
                      <p>
                        <span className="font-medium">Delivery charge:</span>{" "}
                        {priceFormatter.format(order.delivery_charge)}
                      </p>
                      {order.notes ? (
                        <p>
                          <span className="font-medium">Notes:</span> {order.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          <p className="text-center text-zinc-500">Loading orders…</p>
        </main>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
