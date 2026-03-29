import { test, expect } from "@playwright/test";

test.describe("Monitors page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("admin@fieldmonitoring.com");
    await page.getByPlaceholder(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await page.goto("/monitors");
  });

  test("shows monitors list", async ({ page }) => {
    await expect(page.locator("table, ul, [class*='monitor']").first()).toBeVisible({ timeout: 8000 });
  });

  test("shows Add Monitor button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /add monitor/i })).toBeVisible();
  });

  test("opens Add Monitor modal", async ({ page }) => {
    await page.getByRole("button", { name: /add monitor/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
  });

  test("shows performance stats headers", async ({ page }) => {
    await expect(page.getByText(/sites|campaigns|photos|progress/i).first()).toBeVisible();
  });
});
