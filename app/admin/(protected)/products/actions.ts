"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type {
  ProductDraft,
  ProductFormResult,
  ProductStatus,
  StockStatus,
} from "./product-form.types";

function validateProduct(product: ProductDraft): string | null {
  if (product.baseImages.length === 0) return "Please add at least one photo.";
  if (!product.name.trim()) return "Please enter a product name.";
  if (!product.categoryId) return "Please choose a category.";
  if (product.variants.length === 0) return "Please add at least one price.";
  if (!(["draft", "active"] as ProductStatus[]).includes(product.status)) {
    return "Please choose Draft or Active.";
  }

  for (const variant of product.variants) {
    if (!variant.size.trim()) return "Please enter a size for every price.";
    if (variant.price.trim() === "" || !Number.isFinite(Number(variant.price)) || Number(variant.price) < 0) {
      return "Please enter a valid price for every size.";
    }
    if (!(["in_stock", "out_of_stock"] as StockStatus[]).includes(variant.stockStatus)) {
      return "Please choose a stock option for every size.";
    }
    if (variant.colors.some((color) => !color.colorName.trim())) {
      return "Please enter a name for every color.";
    }
  }

  return null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

async function insertVariants(
  supabase: NonNullable<Awaited<ReturnType<typeof requireUser>>>,
  productId: string,
  product: ProductDraft,
) {
  const variants = product.variants.map((variant) => ({
    id: crypto.randomUUID(),
    product_id: productId,
    size: variant.size.trim(),
    finish: variant.finish.trim() || null,
    price: Number(variant.price),
    stock_status: variant.stockStatus,
  }));

  if (variants.length === 0) return { error: null, variantIds: [] };

  const { error: variantError } = await supabase
    .from("product_variants")
    .insert(variants);
  if (variantError) return { error: variantError, variantIds: variants.map(({ id }) => id) };

  const colors = product.variants.flatMap((variant, variantIndex) =>
    variant.colors.map((color) => ({
      variant_id: variants[variantIndex].id,
      color_name: color.colorName.trim(),
      swatch_image_url: color.swatchImageUrl || null,
    })),
  );

  if (colors.length > 0) {
    const { error: colorError } = await supabase.from("variant_colors").insert(colors);
    if (colorError) return { error: colorError, variantIds: variants.map(({ id }) => id) };
  }

  return { error: null, variantIds: variants.map(({ id }) => id) };
}

async function removeVariants(
  supabase: NonNullable<Awaited<ReturnType<typeof requireUser>>>,
  variantIds: string[],
) {
  if (variantIds.length === 0) return;
  await supabase.from("variant_colors").delete().in("variant_id", variantIds);
  await supabase.from("product_variants").delete().in("id", variantIds);
}

export async function createProduct(product: ProductDraft): Promise<ProductFormResult> {
  const validationError = validateProduct(product);
  if (validationError) return { error: validationError };

  const supabase = await requireUser();
  if (!supabase) return { error: "Your session has ended. Please log in again." };

  const productId = crypto.randomUUID();
  const { error: productError } = await supabase.from("products").insert({
    id: productId,
    category_id: product.categoryId,
    name: product.name.trim(),
    description: product.description.trim() || null,
    base_images: product.baseImages,
    status: product.status,
    is_giftable: product.isGiftable,
  });
  if (productError) return { error: "We couldn't save this product. Please try again." };

  const result = await insertVariants(supabase, productId, product);
  if (result.error) {
    await removeVariants(supabase, result.variantIds);
    await supabase.from("products").delete().eq("id", productId);
    return { error: "We couldn't save the sizes and colors. Please try again." };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products?success=created");
}

export async function updateProduct(
  productId: string,
  product: ProductDraft,
): Promise<ProductFormResult> {
  const validationError = validateProduct(product);
  if (validationError) return { error: validationError };

  const supabase = await requireUser();
  if (!supabase) return { error: "Your session has ended. Please log in again." };

  const { data: oldVariants, error: loadError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  if (loadError) return { error: "We couldn't load this product. Please try again." };

  const result = await insertVariants(supabase, productId, product);
  if (result.error) {
    await removeVariants(supabase, result.variantIds);
    return { error: "We couldn't save the sizes and colors. Please try again." };
  }

  const oldVariantIds = oldVariants.map(({ id }) => id);
  if (oldVariantIds.length > 0) {
    const { error: colorDeleteError } = await supabase
      .from("variant_colors")
      .delete()
      .in("variant_id", oldVariantIds);
    const { error: variantDeleteError } = await supabase
      .from("product_variants")
      .delete()
      .in("id", oldVariantIds);

    if (colorDeleteError || variantDeleteError) {
      await removeVariants(supabase, result.variantIds);
      return { error: "This product has order history, so its sizes can't be replaced." };
    }
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      category_id: product.categoryId,
      name: product.name.trim(),
      description: product.description.trim() || null,
      base_images: product.baseImages,
      status: product.status,
      is_giftable: product.isGiftable,
    })
    .eq("id", productId);

  if (productError) return { error: "We couldn't update this product. Please try again." };

  revalidatePath("/admin/products");
  redirect("/admin/products?success=updated");
}

export async function duplicateProduct(productId: string) {
  const supabase = await requireUser();
  if (!supabase) redirect("/admin/login");

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "name, category_id, description, base_images, is_giftable, product_variants(size, finish, price, stock_status, variant_colors(color_name, swatch_image_url))",
    )
    .eq("id", productId)
    .single();

  if (error || !product) redirect("/admin/products?error=duplicate");

  const copy: ProductDraft = {
    baseImages: product.base_images ?? [],
    name: `${product.name} (Copy)`,
    categoryId: product.category_id,
    isGiftable: product.is_giftable,
    description: product.description ?? "",
    status: "draft",
    variants: product.product_variants.map((variant) => ({
      key: crypto.randomUUID(),
      size: variant.size,
      finish: variant.finish ?? "",
      price: String(variant.price),
      stockStatus: variant.stock_status as StockStatus,
      colors: variant.variant_colors.map((color) => ({
        key: crypto.randomUUID(),
        colorName: color.color_name,
        swatchImageUrl: color.swatch_image_url ?? "",
      })),
    })),
  };

  const copyId = crypto.randomUUID();
  const { error: copyError } = await supabase.from("products").insert({
    id: copyId,
    category_id: copy.categoryId,
    name: copy.name,
    description: copy.description || null,
    base_images: copy.baseImages,
    status: "draft",
    is_giftable: copy.isGiftable,
  });
  if (copyError) redirect("/admin/products?error=duplicate");

  const result = await insertVariants(supabase, copyId, copy);
  if (result.error) {
    await removeVariants(supabase, result.variantIds);
    await supabase.from("products").delete().eq("id", copyId);
    redirect("/admin/products?error=duplicate");
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${copyId}/edit?duplicated=1`);
}
