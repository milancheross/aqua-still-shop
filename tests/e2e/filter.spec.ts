import { test, expect } from "@playwright/test";

test("catalog filters combine category, subcategory, brand and search", async ({ page }) => {
  await page.goto("/katalog?category=alati&subcategory=aku-busilice&brand=Makita&q=Makita");
  await expect(page.getByText(/Makita DHP485Z/i)).toBeVisible();
  await expect(page.getByText(/Bosch Professional GSB 18V-50/i)).not.toBeVisible();

  // A product card can contain separate image and title links to the same product.
  // Assert unique product destinations, not the number of anchor elements.
  const productHrefs = await page
    .locator('a[href^="/proizvod/"]')
    .evaluateAll((links) =>
      [...new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute("href")))],
    );
  expect(productHrefs).toHaveLength(1);
});
