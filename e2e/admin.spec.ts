import { test, expect } from "@playwright/test";
import { customerEmail, customerPassword, adminEmail, adminPassword } from "./utils";

test.describe("admin security", () => {
  test("customer account is rejected at admin login", async ({ page }) => {
    if (!customerEmail || !customerPassword) {
      test.skip("pre-confirmed customer credentials not configured (E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD)");
      return;
    }

    await page.goto("/account/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', customerEmail);
    await page.fill('input[name="password"]', customerPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("/account/orders", { timeout: 15000 });

    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', customerEmail);
    await page.fill('input[name="password"]', customerPassword);
    await page.getByRole("button", { name: "Log in" }).click();

    await page.waitForURL(/\/admin\/login\?error=/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin\/login\?error=/);
  });

  test("logged-in customer is redirected away from /admin", async ({ page }) => {
    if (!customerEmail || !customerPassword) {
      test.skip("pre-confirmed customer credentials not configured (E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD)");
      return;
    }

    await page.goto("/account/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', customerEmail);
    await page.fill('input[name="password"]', customerPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("/account/orders", { timeout: 15000 });

    await page.goto("/admin", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("real admin can log in and reach dashboard", async ({ page }) => {
    if (!adminEmail || !adminPassword) {
      test.skip("real admin credentials not provided (set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD)");
      return;
    }

    await page.goto("/admin/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', adminEmail!);
    await page.fill('input[name="password"]', adminPassword!);
    await page.getByRole("button", { name: "Log in" }).click();
    await page.waitForURL("/admin", { timeout: 10000 });
    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("heading", { name: /Assalam/ })).toBeVisible();
  });
});
