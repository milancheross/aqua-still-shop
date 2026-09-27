"use server";

import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession } from "@/lib/admin-auth";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const MAX_TRACKED_KEYS = 10_000;

// Process-local defense in depth. Production deployments with multiple instances
// should additionally enforce rate limits at a shared proxy or rate-limit service.
const failedLogins = new Map<string, { count: number; resetAt: number }>();

function getClientKey(email: string, forwardedFor: string | null, realIp: string | null) {
  // These headers must be set/overwritten by the hosting proxy; do not trust
  // arbitrary client-supplied forwarding headers in a direct-to-app deployment.
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  return `${email}:${ip}`;
}

function isRateLimited(key: string, now: number) {
  for (const [entryKey, entry] of failedLogins) {
    if (entry.resetAt <= now) failedLogins.delete(entryKey);
  }
  return (failedLogins.get(key)?.resetAt ?? 0) > now;
}

function recordFailedLogin(key: string, now: number) {
  const current = failedLogins.get(key);
  const next = current && current.resetAt > now
    ? { count: current.count + 1, resetAt: current.resetAt }
    : { count: 1, resetAt: now + LOGIN_WINDOW_MS };

  if (failedLogins.size >= MAX_TRACKED_KEYS && !failedLogins.has(key)) {
    const oldestKey = failedLogins.keys().next().value;
    if (oldestKey) failedLogins.delete(oldestKey);
  }
  failedLogins.set(key, next);
}

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredEmail || !passwordHash || (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.length < 32)) {
    redirect("/admin-login?error=configuration");
  }

  const requestHeaders = await headers();
  const key = getClientKey(
    email,
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  );
  const now = Date.now();

  if (isRateLimited(key, now)) {
    redirect("/admin-login?error=rate-limit");
  }

  const emailMatches = email === configuredEmail;
  const passwordMatches = await compare(password, passwordHash).catch(() => false);

  if (!emailMatches || !password.length || !passwordMatches) {
    recordFailedLogin(key, now);
    redirect("/admin-login?error=credentials");
  }

  failedLogins.delete(key);
  await createAdminSession(configuredEmail);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin-login");
}
