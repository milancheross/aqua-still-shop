import { test, expect } from "@playwright/test";

test("admin can open orders and change a pickup order to ready for pickup", async ({ page }) => {
  // Create an order through the real storefront first.
  await page.goto("/proizvod/makita-dhp485z-aku-udarna-busilica-18v");
  await page.getByRole("button", { name: /dodaj u korpu/i }).first().click();
  await page.goto("/placanje");
  await page.getByLabel(/Preuzimanje u radnji/i).check();
  await page.getByLabel("Ime *").fill("E2E");
  await page.getByLabel("Prezime *").fill("AdminOrders");
  await page.getByLabel(/Email adresa/i).fill("e2e-admin-orders@aquastill.test");
  await page.getByLabel("Telefon *").fill("0601234570");
  await page.getByRole("button", { name: /potvrdi porudžbinu/i }).click();
  await expect(page).toHaveURL(/\/porudzbina\/AS-/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin-login/);
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL || "admin@aquastill.test");
  await page.getByLabel("Lozinka").fill("password");
  await page.getByRole("button", { name: /prijavi se/i }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: /upravljanje porudžbinama/i })).toBeVisible();
  await expect(page.getByText(/E2E AdminOrders/i)).toBeVisible();

  const row = page.locator("tr").filter({ hasText: "E2E AdminOrders" }).first();
  await expect(row).toBeVisible();
  const status = row.getByLabel(/Status porudžbine/i);
  await status.selectOption("processing");
  await expect(status).toHaveValue("processing");
  await status.selectOption("ready_for_pickup");
  await expect(status).toHaveValue("ready_for_pickup");
});
