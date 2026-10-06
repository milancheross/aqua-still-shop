import { test, expect } from "@playwright/test";

test("order confirmation is protected by the confirmation token and displays order details", async ({ page }) => {
  await page.goto("/proizvod/makita-dhp485z-aku-udarna-busilica-18v");
  await page.getByRole("button", { name: /dodaj u korpu/i }).first().click();
  await page.goto("/placanje");
  await page.getByLabel(/Preuzimanje u radnji/i).check();
  await page.getByLabel("Ime *").fill("E2E");
  await page.getByLabel("Prezime *").fill("Confirmation");
  await page.getByLabel(/Email adresa/i).fill("e2e-confirmation@aquastill.test");
  await page.getByLabel("Telefon *").fill("0601234569");
  await page.getByRole("button", { name: /potvrdi porudžbinu/i }).click();

  const orderUrl = page.url();
  await expect(page.getByText(/uspešno kreirana porudžbina/i)).toBeVisible();
  await expect(page.getByText(/Ukupan iznos za uplatu/i)).toBeVisible();

  const withoutKey = orderUrl.replace(/([?&])key=[^&]+/, "").replace(/[?&]$/, "");
  await page.goto(withoutKey);
  await expect(page.getByText(/Ukupan iznos za uplatu/i)).not.toBeVisible();
});
