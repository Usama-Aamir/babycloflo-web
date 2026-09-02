import { test, expect } from "@playwright/test";
import { getActiveCategory, getActiveProduct } from "./utils";

const viewports = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 12", width: 390, height: 844 },
];

const customerRoutes = [
  { name: "home", path: "/" },
  { name: "cart", path: "/cart" },
  { name: "checkout", path: "/checkout" },
  { name: "checkout success", path: "/checkout/success" },
  { name: "account login", path: "/account/login" },
  { name: "account signup", path: "/account/signup" },
  { name: "account orders", path: "/account/orders" },
];

test.describe("responsive / no horizontal overflow", () => {
  let category: { slug: string } | null = null;
  let product: { id: string } | null = null;

  test.beforeAll(async () => {
    category = await getActiveCategory();
    product = await getActiveProduct();
  });

  for (const viewport of viewports) {
    test.describe(viewport.name, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const { name, path } of customerRoutes) {
        test(`${name} at ${viewport.width}px`, async ({ page }) => {
          await page.goto(path, { waitUntil: "networkidle" });
          const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          expect(overflow, `horizontal overflow detected on ${name} at ${viewport.width}px`).toBe(false);
        });
      }

      test(`category at ${viewport.width}px`, async ({ page }) => {
        if (!category) throw new Error("No active category found in database");
        await page.goto(`/category/${category.slug}`, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflow, `horizontal overflow detected on category at ${viewport.width}px`).toBe(false);
      });

      test(`product at ${viewport.width}px`, async ({ page }) => {
        if (!product) {
          test.skip("No active product found in database");
          return;
        }
        await page.goto(`/product/${product.id}`, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(overflow, `horizontal overflow detected on product at ${viewport.width}px`).toBe(false);
      });
    });
  }
});
