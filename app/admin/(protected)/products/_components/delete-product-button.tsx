"use client";

import { useState, useTransition } from "react";

import { deleteProduct } from "../actions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        setError(result.error);
        setShowConfirm(false);
      }
    });
  }

  if (showConfirm) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-700">Delete {productName}?</span>
        <button
          className="min-h-11 rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          disabled={isPending}
          onClick={handleConfirm}
          type="button"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          className="min-h-11 rounded-lg border border-zinc-300 px-4 font-medium hover:bg-zinc-100"
          disabled={isPending}
          onClick={() => setShowConfirm(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        className="min-h-11 rounded-lg border border-red-300 px-4 font-medium text-red-600 hover:bg-red-50"
        onClick={() => setShowConfirm(true)}
        type="button"
      >
        Delete
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
