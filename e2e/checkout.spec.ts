import { test, expect } from "@playwright/test";
import { getActiveProduct, uniqueTestEmail, setupConsoleWatcher } from "./utils";

async function addFirstVariantToCart(page: import("@playwright/test").Page, product: { product_variants: { id: string; size: string; stock_status: string }[] }) {
  const inStock = product.product_variants.find((v) => v.stock_status === "in_stock");
  if (!inStock) throw new Error("No in-stock product variant found for checkout test");

  await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: inStock.size, exact: true }).first().click();
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("status")).toContainText("Added to cart");
  return inStock;
}

test.describe("checkout flow", () => {
  let product: { id: string; product_variants: { id: string; size: string; stock_status: string }[] } | null = null;

  test.beforeAll(async () => {
    product = await getActiveProduct();
  });

  test.beforeEach(async ({ page }) => {
    setupConsoleWatcher(page);
  });

  test("guest checkout", async ({ page }) => {
    if (!product) throw new Error("No active product found in database");
    await addFirstVariantToCart(page, product);

    await page.goto("/cart", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Checkout/ }).click();
    await page.waitForURL("/checkout", { waitUntil: "networkidle" });

    await page.fill('input[name="name"]', "E2E Guest");
    await page.fill('input[name="phone"]', "03001234567");
    await page.fill('textarea[name="address"]', "123 Test Street");
    await page.fill('input[name="city"]', "Karachi");
    await page.getByRole("button", { name: /Place order/ }).click();

    await page.waitForURL(/\/checkout\/success/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByRole("heading", { name: /Thank you/ })).toBeVisible();
  });

  test("customer account + order flow", async ({ page }) => {
    if (!product) throw new Error("No active product found in database");

    const email = uniqueTestEmail();
    const password = "E2eTest123!";

    await page.goto("/account/signup", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("/account/orders", { timeout: 15000 });
    await expect(page).toHaveURL("/account/orders");

    await addFirstVariantToCart(page, product);

    await page.goto("/checkout", { waitUntil: "networkidle" });
    await page.fill('input[name="name"]', "E2E Customer");
    await page.fill('input[name="phone"]', "03019876543");
    await page.fill('textarea[name="address"]', "456 Test Avenue");
    await page.fill('input[name="city"]', "Lahore");
    await page.getByRole("button", { name: /Place order/ }).click();

    await page.waitForURL(/\/checkout\/success/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/checkout\/success/);

    await page.goto("/account/orders", { waitUntil: "networkidle" });
    await expect(page.getByText(/Placed from Lahore/)).toBeVisible();
    await expect(page.getByText(/03019876543/)).toBeVisible();
  });
});
