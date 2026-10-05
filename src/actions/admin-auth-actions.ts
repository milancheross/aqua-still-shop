"use server";

import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";
import { clearRateLimitBucket, getTrustedClientIp, isRateLimited, recordRateLimitEvent } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredEmail || !passwordHash || (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32)) {
    redirect("/admin-login?error=configuration");
  }

  const requestHeaders = await headers();
  const ip = getTrustedClientIp(requestHeaders);
  const buckets = [`login:ip:${ip}`];
  if (email) buckets.push(`login:email:${email}`);

  for (const bucket of buckets) {
    if (await isRateLimited(bucket, MAX_FAILED_ATTEMPTS, LOGIN_WINDOW_MS)) {
      redirect("/admin-login?error=rate-limit");
    }
  }

  const emailMatches = email === configuredEmail;
  const passwordMatches = await compare(password, passwordHash).catch(() => false);

  if (!emailMatches || !password.length || !passwordMatches) {
    await Promise.all(buckets.map((bucket) => recordRateLimitEvent(bucket, LOGIN_WINDOW_MS)));
    redirect("/admin-login?error=credentials");
  }

  await Promise.all(buckets.map((bucket) => clearRateLimitBucket(bucket)));
  await createAdminSession(configuredEmail);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin-login");
}
