import { test, expect } from "@playwright/test";

test("homepage loads and exposes primary shop navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Aqua Still/i);
  await expect(page.getByRole("link", { name: /katalog/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /pogledaj ponudu/i }).first()).toBeVisible();
});
