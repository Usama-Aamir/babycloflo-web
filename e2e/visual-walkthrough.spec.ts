import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import {
  getActiveCategory,
  getActiveProduct,
  uniqueTestEmail,
  customerEmail,
  customerPassword,
  adminEmail,
  adminPassword,
} from "./utils";

test.use({ launchOptions: { slowMo: 400 } });
test.setTimeout(10 * 60 * 1000);

const SCREENSHOT_DIR = "test-results/visual";

function shotPath(n: number, name: string) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  return path.join(SCREENSHOT_DIR, `${String(n).padStart(2, "0")}-${name}.png`);
}

test("full visual walkthrough (customer + admin if credentials set)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });

  const category = await getActiveCategory();
  const product = await getActiveProduct();
  if (!category || !product) throw new Error("Need at least one active category and product in the database");

  const inStock = product.product_variants.find((v) => v.stock_status === "in_stock");
  if (!inStock) throw new Error("Need at least one in-stock product variant");

  const variantLabel = [inStock.size, inStock.finish].filter(Boolean).join(" ");

  const newSignupEmail = uniqueTestEmail();
  const newSignupPassword = "E2eTest123!";

  // 1. HOMEPAGE
  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(1, "homepage") });

  await page.fill('input[placeholder="Search products"]', product.name);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  await page.screenshot({ path: shotPath(2, "homepage-search-results") });

  // 2. CATEGORY BROWSING
  await page.goto(`/category/${category.slug}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(3, "category-grid") });

  const filterButtons = page.locator('[aria-label="Filter by size"] button');
  const secondFilter = filterButtons.nth(1);
  if (await secondFilter.count() > 0) {
    await secondFilter.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: shotPath(4, "category-filtered-by-size") });
  }

  // 3. PRODUCT PAGE
  await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(5, "product-gallery") });

  await page.getByRole("button", { name: variantLabel, exact: true }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath(6, "product-size-selected") });

  if (inStock.variant_colors && inStock.variant_colors.length > 0) {
    await page.getByRole("button", { name: inStock.variant_colors[0].color_name }).first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: shotPath(7, "product-color-selected") });
  }

  await page.getByRole("button", { name: "Increase quantity" }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotPath(8, "product-quantity-2") });

  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("status")).toContainText("Added to cart", { timeout: 5000 });
  await page.screenshot({ path: shotPath(9, "product-added-to-cart") });

  // 4. CART
  await page.goto("/cart", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(10, "cart-with-item") });

  await page.getByRole("button", { name: "Increase quantity" }).first().click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: shotPath(11, "cart-quantity-increased") });

  await page.getByRole("button", { name: `Remove ${product.name}` }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: shotPath(12, "cart-empty") });

  // Add the product back for checkout flow
  await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: variantLabel, exact: true }).first().click();
  if (inStock.variant_colors && inStock.variant_colors.length > 0) {
    await page.getByRole("button", { name: inStock.variant_colors[0].color_name }).first().click();
  }
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("status")).toContainText("Added to cart", { timeout: 5000 });

  // 5. GUEST CHECKOUT
  await page.goto("/cart", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.waitForURL("/checkout", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(13, "checkout-guest-form") });

  await page.fill('input[name="name"]', "E2E Guest");
  await page.fill('input[name="phone"]', "03001234567");
  await page.fill('textarea[name="address"]', "123 Test Street");
  await page.fill('input[name="city"]', "Karachi");
  await page.screenshot({ path: shotPath(14, "checkout-guest-filled") });

  await page.getByRole("button", { name: /Place order/ }).click();
  await page.waitForURL(/\/checkout\/success/, { timeout: 15000 });
  await page.screenshot({ path: shotPath(15, "checkout-success") });

  // 6. SIGN UP
  await page.goto("/account/signup", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(16, "signup-form") });
  await page.fill('input[name="email"]', newSignupEmail);
  await page.fill('input[name="password"]', newSignupPassword);
  await page.screenshot({ path: shotPath(17, "signup-filled") });
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Account created. Please check your email and confirm it before logging in.")).toBeVisible();
  await page.screenshot({ path: shotPath(18, "signup-confirmation") });

  // 7. LOG IN with pre-confirmed customer account
  if (!customerEmail || !customerPassword) {
    throw new Error("Pre-confirmed customer credentials not configured (E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD)");
  }
  await page.goto("/account/login", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(19, "login-form") });
  await page.fill('input[name="email"]', customerEmail);
  await page.fill('input[name="password"]', customerPassword);
  await page.screenshot({ path: shotPath(20, "login-filled") });
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/account/orders", { timeout: 15000 });
  await page.screenshot({ path: shotPath(21, "logged-in-header") });

  // 8. LOGGED-IN CHECKOUT
  await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: variantLabel, exact: true }).first().click();
  if (inStock.variant_colors && inStock.variant_colors.length > 0) {
    await page.getByRole("button", { name: inStock.variant_colors[0].color_name }).first().click();
  }
  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByRole("status")).toContainText("Added to cart", { timeout: 5000 });

  await page.goto("/checkout", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(23, "checkout-logged-in-banner") });
  await expect(page.getByText(`You’re logged in as ${customerEmail}`)).toBeVisible();

  await page.fill('input[name="name"]', "E2E Customer");
  await page.fill('input[name="phone"]', "03019876543");
  await page.fill('textarea[name="address"]', "456 Test Avenue");
  await page.fill('input[name="city"]', "Lahore");
  await page.screenshot({ path: shotPath(24, "checkout-logged-in-filled") });
  await page.getByRole("button", { name: /Place order/ }).click();
  await page.waitForURL(/\/checkout\/success/, { timeout: 15000 });

  await page.goto("/account/orders", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(25, "account-orders-with-order") });

  // 9. LOG OUT
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: shotPath(26, "final-logged-out-header") });

  // 10-13. ADMIN (only if credentials are configured)
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(27, "admin-login-form") });

  if (adminEmail && adminPassword) {
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("/admin", { timeout: 15000 });
    await page.screenshot({ path: shotPath(28, "admin-dashboard") });

    await page.goto("/admin/products", { waitUntil: "networkidle" });
    await page.screenshot({ path: shotPath(29, "admin-products-list") });

    await page.goto("/admin/products/new", { waitUntil: "networkidle" });
    await page.screenshot({ path: shotPath(30, "admin-add-product-step1") });
    // We do not publish a real product in the visual pass to avoid clutter; screenshots of each step are the goal.
    // (A separate admin walkthrough can fill and publish when credentials are confirmed.)

    await page.goto("/admin/orders", { waitUntil: "networkidle" });
    await page.screenshot({ path: shotPath(31, "admin-orders-list") });

    await page.goto("/admin/settings", { waitUntil: "networkidle" });
    await page.screenshot({ path: shotPath(32, "admin-settings") });

    await page.getByRole("button", { name: "Log out" }).click();
    await page.waitForTimeout(800);
  } else {
    console.log("ADMIN SKIPPED: set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin walkthrough.");
  }

  // 14. SECURITY CHECK
  await page.goto("/account/login", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', customerEmail);
  await page.fill('input[name="password"]', customerPassword);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/account/orders", { timeout: 15000 });

  await page.goto("/admin", { waitUntil: "networkidle" });
  await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  await page.screenshot({ path: shotPath(33, "customer-blocked-from-admin") });

  // 15. MOBILE PASS
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(34, "mobile-home-390") });

  await page.goto(`/category/${category.slug}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(35, "mobile-category-390") });

  await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(36, "mobile-product-390") });

  await page.goto("/cart", { waitUntil: "networkidle" });
  await page.screenshot({ path: shotPath(37, "mobile-cart-390") });
});
