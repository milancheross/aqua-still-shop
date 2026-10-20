import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  createSessionToken,
  resolveStaffFromToken,
  signSessionPayload,
  type StaffUserRecord,
} from "@/lib/admin-session-token";

const COOKIE_NAME = "aqua_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
export type StaffRole = "admin" | "warehouse" | "editor";

function sign(value: string) {
  return signSessionPayload(value);
}

function isValidSession(token: string | undefined, expectedEmail: string) {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; expiresAt?: number };
    return session.email === expectedEmail && typeof session.expiresAt === "number" && session.expiresAt > Date.now();
  } catch { return false; }
}

export async function createAdminSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const token = createSessionToken(normalizedEmail, expiresAt);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

async function findActiveStaffUser(email: string): Promise<StaffUserRecord | null> {
  return db.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

export async function getCurrentStaffUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  // Identity comes only from a signature-verified, unexpired token.
  // There is no fallback to ADMIN_EMAIL or any other environment credential.
  return resolveStaffFromToken(token, findActiveStaffUser);
}

export async function isAdminAuthenticated() {
  const user = await getCurrentStaffUser();
  if (!user) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return isValidSession(token, user.email ?? "");
}

export async function requireAdmin() {
  const user = await getCurrentStaffUser();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!user || user.role !== "admin" || !isValidSession(token, user.email ?? "")) redirect("/admin-login");
  return user;
}

export async function requireAdminOrEditor() {
  const user = await getCurrentStaffUser();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!user || !["admin", "editor"].includes(user.role) || !isValidSession(token, user.email ?? "")) redirect("/admin-login");
  return user;
}

export async function requireWarehouseAccess() {
  const user = await getCurrentStaffUser();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!user || !["admin","warehouse"].includes(user.role) || !isValidSession(token, user.email ?? "")) redirect("/admin-login");
  return user;
}
