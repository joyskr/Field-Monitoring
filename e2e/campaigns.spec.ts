import { test, expect } from "@playwright/test";

test.describe("Campaigns page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("admin@fieldmonitoring.com");
    await page.getByPlaceholder(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await page.goto("/campaigns");
  });

  test("shows campaign list", async ({ page }) => {
    // Should show at least one campaign from seed data
    await expect(page.locator("table, [data-testid='campaign-row']").first()).toBeVisible({ timeout: 8000 });
  });

  test("shows status filter tabs", async ({ page }) => {
    await expect(page.getByRole("button", { name: /active/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /upcoming/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /expired/i })).toBeVisible();
  });

  test("filters campaigns by status tab", async ({ page }) => {
    await page.getByRole("button", { name: /expired/i }).click();
    await expect(page).toHaveURL(/status=EXPIRED/);
  });

  test("search input filters results", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("nonexistent_xyz_campaign_12345");
    // Should show empty state or no results
    await expect(page.getByText(/no.*campaign|not found|0 campaigns/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows expiring soon button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /expiring soon/i })).toBeVisible();
  });
});
