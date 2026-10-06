import { test, expect } from "@playwright/test";

async function prepareCart(page: Parameters<typeof test>[0] extends never ? never : any) {
  await page.goto("/proizvod/makita-dhp485z-aku-udarna-busilica-18v");
  await page.getByRole("button", { name: /dodaj u korpu/i }).first().click();
  await page.goto("/placanje");
}

test("checkout validates and creates a courier order", async ({ page }) => {
  await prepareCart(page);
  await page.getByLabel("Ime *").fill("E2E");
  await page.getByLabel("Prezime *").fill("Test");
  await page.getByLabel(/Email adresa/i).fill("e2e-courier@aquastill.test");
  await page.getByLabel("Telefon *").fill("0601234567");
  await page.getByLabel(/Ulica i broj/i).fill("Test 1");
  await page.getByLabel(/Grad \/ Mesto/i).fill("Zlatibor");
  await page.getByLabel(/Poštanski broj/i).fill("31315");
  await page.getByRole("button", { name: /potvrdi porudžbinu/i }).click();
  await expect(page).toHaveURL(/\/porudzbina\/AS-/);
  await expect(page.getByText(/uspešno kreirana porudžbina/i)).toBeVisible();
});
