import { test, expect } from "@playwright/test";

test("product detail shows price, stock and add-to-cart control", async ({ page }) => {
  await page.goto("/proizvod/makita-dhp485z-aku-udarna-busilica-18v");
  await expect(page.getByRole("heading", { name: /Makita DHP485Z/i })).toBeVisible();
  await expect(page.getByText(/Na stanju/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /dodaj u korpu/i }).first()).toBeVisible();
});
