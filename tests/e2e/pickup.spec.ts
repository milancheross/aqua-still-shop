import { test, expect } from "@playwright/test";

test("store pickup removes address requirement and costs zero delivery", async ({ page }) => {
  await page.goto("/proizvod/makita-dhp485z-aku-udarna-busilica-18v");
  await page.getByRole("button", { name: /dodaj u korpu/i }).first().click();
  await page.goto("/placanje");

  await page.getByLabel(/Preuzimanje u radnji/i).check();
  await expect(page.getByText(/Spremno za preuzimanje narednog dana/i)).toBeVisible();
  await expect(page.getByText(/Lokacija preuzimanja/i)).toBeVisible();
  await expect(page.getByText(/Plaćanje prilikom preuzimanja u radnji/i)).toBeVisible();
  await expect(page.getByText("Besplatno").last()).toBeVisible();

  await page.getByLabel("Ime *").fill("E2E");
  await page.getByLabel("Prezime *").fill("Pickup");
  await page.getByLabel(/Email adresa/i).fill("e2e-pickup@aquastill.test");
  await page.getByLabel("Telefon *").fill("0601234568");
  await expect(page.getByLabel(/Ulica i broj/i)).toHaveCount(0);

  await page.getByRole("button", { name: /potvrdi porudžbinu/i }).click();
  await expect(page).toHaveURL(/\/porudzbina\/AS-/);
  await expect(page.getByText(/uspešno kreirana porudžbina/i)).toBeVisible();
});
