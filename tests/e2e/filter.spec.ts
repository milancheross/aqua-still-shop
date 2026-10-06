import { test, expect } from "@playwright/test";

test("catalog filters combine category, subcategory, brand and search", async ({ page }) => {
  await page.goto("/katalog?category=alati&subcategory=aku-busilice&brand=Makita&q=Makita");
  await expect(page.getByText(/Makita DHP485Z/i)).toBeVisible();
  await expect(page.getByText(/Bosch Professional GSB 18V-50/i)).not.toBeVisible();
  await expect(page.locator('a[href^="/proizvod/"]')).toHaveCount(1);
});
