import { test, expect } from "@playwright/test";
import { getActiveCategory, getActiveProduct, visitAndCheck, adminEmail, adminPassword } from "./utils";

test.describe("page load + no console/hydration errors", () => {
  let category: { slug: string } | null = null;
  let product: { id: string } | null = null;

  test.beforeAll(async () => {
    category = await getActiveCategory();
    product = await getActiveProduct();
  });

  const customerRoutes = [
    { name: "home", path: "/" },
    { name: "cart", path: "/cart" },
    { name: "checkout", path: "/checkout" },
    { name: "checkout success", path: "/checkout/success" },
    { name: "account login", path: "/account/login" },
    { name: "account signup", path: "/account/signup" },
    { name: "account orders", path: "/account/orders" },
    { name: "admin login", path: "/admin/login" },
  ];

  for (const { name, path } of customerRoutes) {
    test(name, async ({ page }) => {
      await visitAndCheck(page, path, name);
    });
  }

  test("category", async ({ page }) => {
    if (!category) throw new Error("No active category found in database");
    await visitAndCheck(page, `/category/${category.slug}`, "category");
  });

  test("product", async ({ page }) => {
    if (!product) {
      test.skip("No active product found in database");
      return;
    }
    await visitAndCheck(page, `/product/${product.id}`, "product");
  });

  const adminDescribe = adminEmail && adminPassword ? test.describe : test.describe.skip;

  adminDescribe("admin routes", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/login");
      await page.fill('input[name="email"]', adminEmail!);
      await page.fill('input[name="password"]', adminPassword!);
      await page.click('button[type="submit"]');
      await page.waitForURL("/admin", { timeout: 10000 });
    });

    for (const { name, path } of [
      { name: "admin dashboard", path: "/admin" },
      { name: "admin orders", path: "/admin/orders" },
      { name: "admin products", path: "/admin/products" },
      { name: "admin products new", path: "/admin/products/new" },
      { name: "admin settings", path: "/admin/settings" },
    ]) {
      test(name, async ({ page }) => {
        await visitAndCheck(page, path, name);
      });
    }
  });
});
