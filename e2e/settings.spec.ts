import { test, expect } from "@playwright/test";

test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder(/email/i).fill("admin@fieldmonitoring.com");
    await page.getByPlaceholder(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await page.goto("/settings");
  });

  test("shows profile card with user info", async ({ page }) => {
    await expect(page.getByText(/admin/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("shows update profile form", async ({ page }) => {
    await expect(page.getByRole("button", { name: /update profile|save/i })).toBeVisible();
  });

  test("shows change password form", async ({ page }) => {
    await expect(page.getByText(/change password|new password/i)).toBeVisible();
  });

  test("shows error when updating with empty name", async ({ page }) => {
    const nameInput = page.getByLabel(/name/i).first();
    await nameInput.clear();
    await page.getByRole("button", { name: /update profile|save/i }).click();
    await expect(page.getByText(/required|name.*required|fill/i)).toBeVisible({ timeout: 5000 });
  });

  test("shows error when passwords do not match", async ({ page }) => {
    const inputs = page.getByPlaceholder(/password/i);
    // Fill new password and confirm with different values
    await inputs.nth(1).fill("newpass123");
    await inputs.nth(2).fill("differentpass");
    await page.getByRole("button", { name: /change password/i }).click();
    await expect(page.getByText(/match|do not match/i)).toBeVisible({ timeout: 5000 });
  });
});
