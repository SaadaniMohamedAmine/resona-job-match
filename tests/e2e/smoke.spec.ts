import { test, expect } from "@playwright/test";

test.describe("smoke: key public pages render", () => {
  test("homepage renders the hero and primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /analyze your resume/i })).toBeVisible();
  });

  test("login page renders the credentials form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("sign-up page renders the identity step", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("pricing page renders both plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
  });
});
