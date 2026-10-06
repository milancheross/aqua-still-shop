"use server";

import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";
import { clearRateLimitBucket, getTrustedClientIp, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestHeaders = await headers();
  const ip = getTrustedClientIp(requestHeaders);
  const buckets = [`login:ip:${ip}`];
  if (email) buckets.push(`login:email:${email}`);

  for (const bucket of buckets) if (await isRateLimited(bucket, MAX_FAILED_ATTEMPTS, LOGIN_WINDOW_MS)) redirect("/admin-login?error=rate-limit");

  let user = email ? await db.user.findUnique({ where: { email } }) : null;
  let passwordMatches = false;

  if (user?.isActive && user.password) passwordMatches = await compare(password, user.password).catch(() => false);

  // Backward-compatible bootstrap: if the database user is missing, allow the existing
  // env admin credentials to create the first database-backed administrator.
  if (!user) {
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (configuredEmail === email && passwordHash) {
      passwordMatches = await compare(password, passwordHash).catch(() => false);
      if (passwordMatches) {
        user = await db.user.upsert({
          where: { email },
          update: { isActive: true, role: "admin" },
          create: { email, name: "Administrator", password: passwordHash, role: "admin", isActive: true },
        });
      }
    }
  }

  if (!user || !user.isActive || !user.password || !passwordMatches) {
    await Promise.all(buckets.map((bucket) => recordRateLimitEvent(bucket, LOGIN_WINDOW_MS)));
    redirect("/admin-login?error=credentials");
  }

  await Promise.all(buckets.map((bucket) => clearRateLimitBucket(bucket)));
  await createAdminSession(user.email!);
  redirect(user.role === "warehouse" ? "/magacin" : "/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin-login");
}
