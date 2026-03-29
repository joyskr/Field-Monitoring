import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("admin@fieldmonitoring.com");
    await page.getByPlaceholder(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test("shows KPI cards", async ({ page }) => {
    await expect(page.getByText(/campaigns/i).first()).toBeVisible();
    await expect(page.getByText(/sites/i).first()).toBeVisible();
  });

  test("shows period filter buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /this month/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /last 3 months/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /last year/i })).toBeVisible();
  });

  test("changes period filter", async ({ page }) => {
    await page.getByRole("button", { name: /last 3 months/i }).click();
    await expect(page).toHaveURL(/period=last-3-months/);
  });

  test("sidebar navigation links visible", async ({ page }) => {
    await expect(page.getByText(/campaigns/i).first()).toBeVisible();
    await expect(page.getByText(/sites/i).first()).toBeVisible();
    await expect(page.getByText(/monitors/i).first()).toBeVisible();
  });

  test("navigates to campaigns page", async ({ page }) => {
    await page.getByRole("link", { name: /campaigns/i }).first().click();
    await expect(page).toHaveURL(/campaigns/, { timeout: 5000 });
  });
});
