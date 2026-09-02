import { test, expect } from "@playwright/test";
import { getActiveProduct, uniqueTestEmail } from "./utils";

test.describe("form validation", () => {
  test("signup shows error for invalid email", async ({ page }) => {
    await page.goto("/account/signup", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', "notanemail");
    await page.fill('input[name="password"]', "short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("signup with valid credentials shows confirmation message", async ({ page }) => {
    const email = `e2e-confirm-${Date.now()}@example.com`;
    await page.goto("/account/signup", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "E2eTest123!");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Account created. Please check your email and confirm it before logging in.")).toBeVisible();
  });

  test("checkout shows error for invalid phone", async ({ page }) => {
    const product = await getActiveProduct();
    if (!product) throw new Error("No active product found in database");

    const inStock = product.product_variants.find((v) => v.stock_status === "in_stock");
    if (!inStock) throw new Error("No in-stock product variant found for form validation test");

    const variantLabel = [inStock.size, inStock.finish].filter(Boolean).join(" ");

    await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: variantLabel, exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("status")).toContainText("Added to cart");

    await page.goto("/checkout", { waitUntil: "networkidle" });
    await page.fill('input[name="name"]', "E2E Guest");
    await page.fill('input[name="phone"]', "12345");
    await page.fill('textarea[name="address"]', "123 Test Street");
    await page.fill('input[name="city"]', "Karachi");
    await page.getByRole("button", { name: /Place order/ }).click();

    await expect(page.getByText("Please enter a valid Pakistani phone number, like 03001234567")).toBeVisible();
  });
});
