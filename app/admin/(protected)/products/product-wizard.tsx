"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";
import { createProduct, updateProduct } from "./actions";
import type {
  CategoryOption,
  ColorDraft,
  ProductDraft,
  StockStatus,
  VariantDraft,
} from "./product-form.types";

type Photo = { url: string; path?: string };

type ProductWizardProps = {
  categories: CategoryOption[];
  initialProduct?: ProductDraft;
  productId?: string;
  duplicated?: boolean;
};

const inputClass =
  "min-h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
const secondaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 text-base font-semibold hover:bg-zinc-100 focus:outline-none focus:ring-4 focus:ring-zinc-300";

function emptyColor(): ColorDraft {
  return { key: crypto.randomUUID(), colorName: "", swatchImageUrl: "" };
}

function emptyVariant(): VariantDraft {
  return {
    key: crypto.randomUUID(),
    size: "",
    finish: "",
    price: "",
    stockStatus: "in_stock",
    colors: [],
  };
}

export function ProductWizard({
  categories,
  initialProduct,
  productId,
  duplicated = false,
}: ProductWizardProps) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<Photo[]>(
    () => initialProduct?.baseImages.map((url) => ({ url })) ?? [],
  );
  const [product, setProduct] = useState<ProductDraft>(
    () => initialProduct ?? {
      baseImages: [],
      name: "",
      categoryId: "",
      description: "",
      status: "draft",
      variants: [emptyVariant()],
    },
  );
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function uploadImage(file: File, folder: string) {
    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${extension}`;
      const result = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });

      if (result.error) throw result.error;

      return {
        path,
        url: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl,
      };
    } catch (uploadError) {
      throw uploadError;
    }
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setIsUploading(true);

    try {
      const uploaded: Photo[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file, "products"));
      }
      setPhotos((current) => [...current, ...uploaded]);
    } catch {
      setError("We couldn't upload those photos. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function removePhoto(index: number) {
    const photo = photos[index];
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
    if (photo.path) {
      await createClient().storage.from("product-images").remove([photo.path]);
    }
  }

  function updateVariant(index: number, changes: Partial<VariantDraft>) {
    setProduct((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...changes } : variant,
      ),
    }));
  }

  function updateColor(
    variantIndex: number,
    colorIndex: number,
    changes: Partial<ColorDraft>,
  ) {
    const variant = product.variants[variantIndex];
    updateVariant(variantIndex, {
      colors: variant.colors.map((color, index) =>
        index === colorIndex ? { ...color, ...changes } : color,
      ),
    });
  }

  async function uploadSwatch(
    variantIndex: number,
    colorIndex: number,
    file: File | undefined,
  ) {
    if (!file) return;
    setError("");
    setIsUploading(true);
    try {
      const uploaded = await uploadImage(file, "swatches");
      updateColor(variantIndex, colorIndex, { swatchImageUrl: uploaded.url });
    } catch {
      setError("We couldn't upload that color photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function validateStep() {
    if (step === 1 && photos.length === 0) return "Please add at least one photo.";
    if (step === 2 && !product.name.trim()) return "Please enter a product name.";
    if (step === 2 && !product.categoryId) return "Please choose a category.";
    if (step === 3 && product.variants.length === 0) return "Please add at least one price.";
    if (step === 3 && product.variants.some((variant) => !variant.size.trim())) {
      return "Please enter a size for every price.";
    }
    if (
      step === 3 &&
      product.variants.some(
        (variant) =>
          variant.price.trim() === "" ||
          !Number.isFinite(Number(variant.price)) ||
          Number(variant.price) < 0,
      )
    ) {
      return "Please enter a valid price for every size.";
    }
    if (
      step === 3 &&
      product.variants.some((variant) =>
        variant.colors.some((color) => !color.colorName.trim()),
      )
    ) {
      return "Please enter a name for every color.";
    }
    return "";
  }

  function nextStep() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, 4));
  }

  function publish() {
    setError("");
    const draft = { ...product, baseImages: photos.map(({ url }) => url) };
    startTransition(async () => {
      const result = productId
        ? await updateProduct(productId, draft)
        : await createProduct(draft);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-zinc-500">Step {step} of 4</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {productId ? "Edit product" : "Add product"}
          </h1>
        </div>
        <Link className="text-base font-medium underline underline-offset-4" href="/admin/products">
          Cancel
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-4 gap-2" aria-label={`Step ${step} of 4`}>
        {[1, 2, 3, 4].map((number) => (
          <div
            className={`h-2 rounded-full ${number <= step ? "bg-zinc-950" : "bg-zinc-200"}`}
            key={number}
          />
        ))}
      </div>

      {duplicated ? (
        <p className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-blue-800">
          Copy created as a draft. Change anything you need, then publish it.
        </p>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        {step === 1 ? (
          <div>
            <h2 className="text-2xl font-semibold">Photos</h2>
            <p className="mt-2 text-zinc-600">Add one or more clear product photos.</p>
            <label className={`${secondaryButtonClass} mt-6 cursor-pointer`}>
              {isUploading ? "Uploading…" : "+ Add photos"}
              <input
                accept="image/*"
                className="sr-only"
                disabled={isUploading}
                multiple
                onChange={(event) => void addPhotos(event.target.files)}
                type="file"
              />
            </label>
            {photos.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {photos.map((photo, index) => (
                  <div className="relative overflow-hidden rounded-xl border border-zinc-200" key={photo.url}>
                    <div className="relative aspect-square bg-zinc-100">
                      <Image alt={`Product photo ${index + 1}`} fill className="object-cover" src={photo.url} unoptimized />
                    </div>
                    <button
                      className="min-h-12 w-full bg-white px-3 font-medium text-red-700 hover:bg-red-50"
                      onClick={() => void removePhoto(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Name and category</h2>
              <p className="mt-2 text-zinc-600">Tell customers what this product is.</p>
            </div>
            <div>
              <label className="mb-2 block text-base font-medium" htmlFor="name">Product name</label>
              <input
                className={inputClass}
                id="name"
                onChange={(event) => setProduct((current) => ({ ...current, name: event.target.value }))}
                value={product.name}
              />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium" htmlFor="category">Category</label>
              <select
                className={inputClass}
                id="category"
                onChange={(event) => setProduct((current) => ({ ...current, categoryId: event.target.value }))}
                value={product.categoryId}
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="text-2xl font-semibold">Sizes, finishes and colors</h2>
            <p className="mt-2 text-zinc-600">Add each option customers can buy.</p>
            <p className="mt-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
              If this product only comes in one option, just enter something like &ldquo;Standard&rdquo; or &ldquo;One size&rdquo; in the size field.
            </p>
            <div className="mt-6 space-y-6">
              {product.variants.map((variant, variantIndex) => (
                <div className="rounded-2xl border border-zinc-200 p-4 sm:p-6" key={variant.key}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-medium">Size</label>
                      <input className={inputClass} onChange={(event) => updateVariant(variantIndex, { size: event.target.value })} value={variant.size} />
                    </div>
                    <div>
                      <label className="mb-2 block font-medium">Finish (optional)</label>
                      <input className={inputClass} onChange={(event) => updateVariant(variantIndex, { finish: event.target.value })} value={variant.finish} />
                    </div>
                    <div>
                      <label className="mb-2 block font-medium">Price</label>
                      <input className={inputClass} min="0" onChange={(event) => updateVariant(variantIndex, { price: event.target.value })} step="0.01" type="number" value={variant.price} />
                    </div>
                    <div>
                      <label className="mb-2 block font-medium">Stock</label>
                      <select className={inputClass} onChange={(event) => updateVariant(variantIndex, { stockStatus: event.target.value as StockStatus })} value={variant.stockStatus}>
                        <option value="in_stock">In stock</option>
                        <option value="out_of_stock">Out of stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-zinc-200 pt-5">
                    <h3 className="text-lg font-semibold">Colors</h3>
                    {variant.colors.map((color, colorIndex) => (
                      <div className="mt-4 grid items-end gap-3 rounded-xl bg-zinc-50 p-4 sm:grid-cols-[1fr_1fr_auto]" key={color.key}>
                        <div>
                          <label className="mb-2 block font-medium">Color name</label>
                          <input className={inputClass} onChange={(event) => updateColor(variantIndex, colorIndex, { colorName: event.target.value })} value={color.colorName} />
                        </div>
                        <div>
                          <label className="mb-2 block font-medium">Color photo (optional)</label>
                          <input accept="image/*" className="block min-h-14 w-full rounded-xl border border-zinc-300 bg-white p-3" onChange={(event) => void uploadSwatch(variantIndex, colorIndex, event.target.files?.[0])} type="file" />
                          {color.swatchImageUrl ? <p className="mt-1 text-sm text-green-700">Photo added</p> : null}
                        </div>
                        <button className="min-h-12 px-3 font-medium text-red-700" onClick={() => updateVariant(variantIndex, { colors: variant.colors.filter((_, index) => index !== colorIndex) })} type="button">Remove</button>
                      </div>
                    ))}
                    <button className={`${secondaryButtonClass} mt-4`} onClick={() => updateVariant(variantIndex, { colors: [...variant.colors, emptyColor()] })} type="button">+ Add color</button>
                  </div>

                  {product.variants.length > 1 ? (
                    <button className="mt-6 min-h-12 font-medium text-red-700" onClick={() => setProduct((current) => ({ ...current, variants: current.variants.filter((_, index) => index !== variantIndex) }))} type="button">Remove this size/finish</button>
                  ) : null}
                </div>
              ))}
            </div>
            <button className={`${secondaryButtonClass} mt-6`} onClick={() => setProduct((current) => ({ ...current, variants: [...current.variants, emptyVariant()] }))} type="button">+ Add another size/finish</button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Description and publish</h2>
              <p className="mt-2 text-zinc-600">Add final details and choose whether customers can see it.</p>
            </div>
            <div>
              <label className="mb-2 block text-base font-medium" htmlFor="description">Description (optional)</label>
              <textarea className={`${inputClass} min-h-40 py-4`} id="description" onChange={(event) => setProduct((current) => ({ ...current, description: event.target.value }))} value={product.description} />
            </div>
            <div>
              <label className="mb-2 block text-base font-medium" htmlFor="status">Status</label>
              <select className={inputClass} id="status" onChange={(event) => setProduct((current) => ({ ...current, status: event.target.value as "draft" | "active" }))} value={product.status}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">{error}</p> : null}

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <button className={secondaryButtonClass} onClick={() => { setError(""); setStep((current) => current - 1); }} type="button">Back</button>
          ) : <span />}
          {step < 4 ? (
            <button className="min-h-14 rounded-xl bg-zinc-950 px-8 text-lg font-semibold text-white hover:bg-zinc-800 disabled:opacity-50" disabled={isUploading} onClick={nextStep} type="button">Next</button>
          ) : (
            <button className="min-h-14 rounded-xl bg-zinc-950 px-8 text-lg font-semibold text-white hover:bg-zinc-800 disabled:opacity-50" disabled={isPending || isUploading} onClick={publish} type="button">{isPending ? "Saving…" : productId ? "Save changes" : "Publish"}</button>
          )}
        </div>
      </section>
    </main>
  );
}
