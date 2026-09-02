import { expect, Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

export async function getActiveCategory() {
  const { data, error } = await supabase
    .from("categories")
    .select("slug")
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getActiveProduct() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, base_images, product_variants(id, size, finish, price, stock_status, variant_colors(id, color_name, swatch_image_url))")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export const adminEmail = process.env.E2E_ADMIN_EMAIL;
export const adminPassword = process.env.E2E_ADMIN_PASSWORD;

export const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
export const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;

export function setupConsoleWatcher(page: Page) {
  const messages: { type: string; text: string }[] = [];
  const errors: { type: string; text: string }[] = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    messages.push({ type, text });
    if (type === "error" || (type === "warning" && text.toLowerCase().includes("hydrat"))) {
      errors.push({ type, text });
      // print to terminal so we can see the actual error without opening DevTools
      console.error(`[browser console ${type}]`, text);
    }
  });

  page.on("pageerror", (err) => {
    errors.push({ type: "uncaught", text: err.message });
  });

  return {
    messages,
    errors,
    assertNoIssues(label: string) {
      expect(errors, `Console/uncaught errors on ${label}: ${JSON.stringify(errors, null, 2)}`).toHaveLength(0);
    },
  };
}

export async function visitAndCheck(page: Page, url: string, label: string) {
  const { assertNoIssues } = setupConsoleWatcher(page);
  await page.goto(url, { waitUntil: "networkidle" });
  assertNoIssues(label);
}

export function uniqueTestEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
}
