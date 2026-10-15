import { createHmac, timingSafeEqual } from "node:crypto";

export type VerifiedSession = {
  email: string;
  expiresAt: number;
};

export type StaffUserRecord = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET mora biti podešen i imati najmanje 32 karaktera.");
  }
  return secret;
}

export function signSessionPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(email: string, expiresAt: number) {
  const normalizedEmail = email.trim().toLowerCase();
  const payload = Buffer.from(JSON.stringify({ email: normalizedEmail, expiresAt })).toString("base64url");
  return `${payload}.${signSessionPayload(payload)}`;
}

/**
 * Verifies signature before any payload field is used for identity.
 * Rejects missing, malformed, unsigned, expired, or incomplete tokens.
 */
export function verifySessionToken(
  token: string | null | undefined,
  now = Date.now(),
): VerifiedSession | null {
  if (typeof token !== "string" || token.length === 0) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  let expectedSignature: string;
  try {
    expectedSignature = signSessionPayload(payload);
  } catch {
    return null;
  }

  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const session = parsed as { email?: unknown; expiresAt?: unknown };
  if (typeof session.email !== "string") return null;

  const email = session.email.trim().toLowerCase();
  if (email.length === 0 || email.length > 254 || !email.includes("@")) return null;

  if (typeof session.expiresAt !== "number" || !Number.isFinite(session.expiresAt) || session.expiresAt <= now) {
    return null;
  }

  return { email, expiresAt: session.expiresAt };
}

/**
 * Resolves a staff user only from a verified token. Never falls back to env credentials.
 */
export async function resolveStaffFromToken(
  token: string | null | undefined,
  findUser: (email: string) => Promise<StaffUserRecord | null>,
  now = Date.now(),
): Promise<StaffUserRecord | null> {
  const session = verifySessionToken(token, now);
  if (!session) return null;

  const user = await findUser(session.email);
  if (!user || !user.isActive || !user.email) return null;
  if (user.email.trim().toLowerCase() !== session.email) return null;

  return user;
}
