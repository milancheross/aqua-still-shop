import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE_NAME = "aqua_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
export type StaffRole = "admin" | "warehouse" | "editor";

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET mora biti podešen i imati najmanje 32 karaktera.");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
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
  const payload = Buffer.from(JSON.stringify({ email: normalizedEmail, expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000 })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getCurrentStaffUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let sessionEmail = email;
  if (token) {
    try {
      const [payload] = token.split(".");
      if (payload) {
        const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; expiresAt?: number };
        if (parsed.email && typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now()) sessionEmail = parsed.email.toLowerCase();
      }
    } catch {}
  }
  if (!sessionEmail) return null;
  const user = await db.user.findUnique({ where: { email: sessionEmail }, select: { id:true,name:true,email:true,role:true,isActive:true } });
  if (!user || !user.isActive) return null;
  return user;
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

export async function requireWarehouseAccess() {
  const user = await getCurrentStaffUser();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!user || !["admin","warehouse"].includes(user.role) || !isValidSession(token, user.email ?? "")) redirect("/admin-login");
  return user;
}
