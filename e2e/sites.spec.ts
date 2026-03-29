import { test, expect } from "@playwright/test";

test.describe("Sites page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("admin@fieldmonitoring.com");
    await page.getByPlaceholder(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await page.goto("/sites");
  });

  test("shows sites table", async ({ page }) => {
    await expect(page.getByRole("table").first()).toBeVisible({ timeout: 8000 });
  });

  test("shows Add Site button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /add site/i })).toBeVisible();
  });

  test("opens Add Site modal", async ({ page }) => {
    await page.getByRole("button", { name: /add site/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/site code/i)).toBeVisible();
  });

  test("closes modal on cancel", async ({ page }) => {
    await page.getByRole("button", { name: /add site/i }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
  });

  test("shows search input", async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("search filters the site list", async ({ page }) => {
    const input = page.getByPlaceholder(/search/i);
    await input.fill("ZZZNOMATCH99999");
    // Table should be empty or show no results message
    await expect(page.getByText(/no.*site|0 sites|not found/i)).toBeVisible({ timeout: 5000 });
  });
});
