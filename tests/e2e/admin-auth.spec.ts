import { test, expect } from "@playwright/test";

test("admin login protects admin routes and accepts valid credentials", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin-login/);

  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL || "admin@aquastill.test");
  await page.getByLabel("Lozinka").fill("password");
  await page.getByRole("button", { name: /prijavi se/i }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText(/Aqua Still CMS/i)).toBeVisible();
});
