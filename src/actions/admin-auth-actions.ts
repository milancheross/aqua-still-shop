"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredEmail || !passwordHash || !process.env.ADMIN_SESSION_SECRET) {
    redirect("/admin-login?error=configuration");
  }

  const emailMatches = email === configuredEmail;
  const passwordMatches = await compare(password, passwordHash).catch(() => false);

  if (!emailMatches || !password.length || !passwordMatches) {
    redirect("/admin-login?error=credentials");
  }

  await createAdminSession(configuredEmail);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin-login");
}
