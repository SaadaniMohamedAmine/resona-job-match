import { test, expect } from "@playwright/test";
import path from "path";

test("full flow: upload -> analyze -> results -> tracker", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "demo@resona.dev");
  await page.fill('input[type="password"]', "demo-password-2026");
  await page.click('button[type="submit"]');

  await page.waitForURL("/upload");
  await page.setInputFiles('input[type="file"]', path.join(__dirname, "../fixtures/sample-resume.pdf"));
  await page.fill('input[placeholder="Job title"]', "Senior Frontend Engineer");
  await page.fill("textarea", "We are looking for a Senior Frontend Engineer with React and TypeScript experience.");
  await page.click('button:has-text("Analyze")');

  await page.waitForURL(/\/results\//, { timeout: 30000 });
  await expect(page.getByText("Matching skills")).toBeVisible();

  await page.goto("/tracker");
  await expect(page.getByText("Applied")).toBeVisible();
});
