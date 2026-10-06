import { test, expect } from "@playwright/test";

test("warehouse module is protected and usable", async ({ page }) => {
  await page.goto("/magacin");
  await expect(page).toHaveURL(/\/admin-login/);

  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL || "admin@aquastill.test");
  await page.getByLabel("Lozinka").fill("password");
  await page.getByRole("button", { name: /prijavi se/i }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/magacin");

  await expect(page.getByRole("heading", { name: "Magacin" })).toBeVisible();
  await expect(page.getByText(/5 redova × 10 polja × 3 sprata/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Prijem" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Izdavanje" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Provera stanja" })).toBeVisible();

  await page.getByPlaceholder("Unesite šifru proizvoda...").fill("MAK-DHP485Z");
  await page.getByRole("button", { name: /Pronađi \/ skeniraj/i }).click();
  await expect(page.getByText("Makita DHP485Z")).toBeVisible();
});
