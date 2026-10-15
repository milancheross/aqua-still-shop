import { test, expect } from "@playwright/test";

test("catalog loads seeded products", async ({ page }) => {
  await page.goto("/katalog");
  await expect(page.getByRole("heading", { name: /svi proizvodi/i })).toBeVisible();
  await expect(page.getByText(/prikazano \d+ od \d+ artikala/i)).toBeVisible();
  await expect(page.locator('a[href^="/proizvod/"]').first()).toBeVisible();
});
