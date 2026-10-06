import { test, expect } from "@playwright/test";

test("customer can add a product to cart and change quantity", async ({ page }) => {
  await page.goto("/proizvod/makita-dhp485z-aku-udarna-busilica-18v");
  await page.getByRole("button", { name: /dodaj u korpu/i }).first().click();
  await page.goto("/korpa");
  await expect(page.getByText(/Makita DHP485Z/i)).toBeVisible();
  await expect(page.getByText(/Međuzbir/i)).toBeVisible();

  const quantityInput = page.locator('input[type="number"]').first();
  if (await quantityInput.count()) {
    await quantityInput.fill("2");
    await quantityInput.press("Enter");
    await expect(quantityInput).toHaveValue("2");
  }
});
