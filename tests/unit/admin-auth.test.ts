import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  createSessionToken,
  resolveStaffFromToken,
  signSessionPayload,
  verifySessionToken,
  type StaffUserRecord,
} from "../../src/lib/admin-session-token";

const SECRET = "unit-test-admin-session-secret-32-chars-min";
const EMAIL = "admin@aquastill.test";

function activeUser(overrides: Partial<StaffUserRecord> = {}): StaffUserRecord {
  return {
    id: "user_1",
    name: "Administrator",
    email: EMAIL,
    role: "admin",
    isActive: true,
    ...overrides,
  };
}

describe("admin session token verification", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_EMAIL;
  });

  it("accepts a valid token and returns the normalized email", () => {
    const expiresAt = Date.now() + 60_000;
    const token = createSessionToken("  Admin@AquaStill.Test  ", expiresAt);
    const verified = verifySessionToken(token);
    assert.equal(verified?.email, EMAIL);
    assert.equal(verified?.expiresAt, expiresAt);
  });

  it("rejects a missing cookie/token", () => {
    assert.equal(verifySessionToken(undefined), null);
    assert.equal(verifySessionToken(null), null);
    assert.equal(verifySessionToken(""), null);
  });

  it("rejects an invalid signature", () => {
    const expiresAt = Date.now() + 60_000;
    const token = createSessionToken(EMAIL, expiresAt);
    const [payload] = token.split(".");
    const bad = `${payload}.${signSessionPayload("different-payload")}`;
    assert.equal(verifySessionToken(bad), null);
  });

  it("rejects a modified payload even if the original signature is kept", () => {
    const expiresAt = Date.now() + 60_000;
    const token = createSessionToken(EMAIL, expiresAt);
    const [, signature] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ email: "attacker@example.com", expiresAt }),
    ).toString("base64url");
    assert.equal(verifySessionToken(`${forgedPayload}.${signature}`), null);
  });

  it("rejects an expired token", () => {
    const token = createSessionToken(EMAIL, Date.now() - 1_000);
    assert.equal(verifySessionToken(token), null);
  });

  it("rejects a malformed Base64URL payload", () => {
    const signature = signSessionPayload("%%%not-base64%%%");
    assert.equal(verifySessionToken(`%%%not-base64%%%.${signature}`), null);
  });

  it("rejects tokens with extra segments or missing parts", () => {
    const token = createSessionToken(EMAIL, Date.now() + 60_000);
    assert.equal(verifySessionToken(`${token}.extra`), null);
    assert.equal(verifySessionToken("only-one-part"), null);
    assert.equal(verifySessionToken(".signature"), null);
  });

  it("does not use ADMIN_EMAIL when the token is absent or invalid", async () => {
    process.env.ADMIN_EMAIL = EMAIL;
    const calls: string[] = [];
    const lookup = async (email: string) => {
      calls.push(email);
      return activeUser();
    };

    assert.equal(await resolveStaffFromToken(undefined, lookup), null);
    assert.equal(await resolveStaffFromToken("not-a-token", lookup), null);
    assert.deepEqual(calls, []);
  });

  it("returns null for a valid token of a non-existent user", async () => {
    const token = createSessionToken(EMAIL, Date.now() + 60_000);
    const result = await resolveStaffFromToken(token, async () => null);
    assert.equal(result, null);
  });

  it("returns null for a valid token of an inactive user", async () => {
    const token = createSessionToken(EMAIL, Date.now() + 60_000);
    const result = await resolveStaffFromToken(token, async () => activeUser({ isActive: false }));
    assert.equal(result, null);
  });

  it("returns the active user for a valid token and never falls back to env", async () => {
    process.env.ADMIN_EMAIL = "other@example.com";
    const token = createSessionToken(EMAIL, Date.now() + 60_000);
    const result = await resolveStaffFromToken(token, async (email) => {
      assert.equal(email, EMAIL);
      return activeUser();
    });
    assert.equal(result?.email, EMAIL);
    assert.equal(result?.role, "admin");
  });

  it("keeps cookie token format as payload.signature with HMAC-SHA256 base64url", () => {
    const expiresAt = 1_700_000_000_000;
    const token = createSessionToken(EMAIL, expiresAt);
    const [payload, signature, extra] = token.split(".");
    assert.equal(extra, undefined);
    const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
    assert.equal(signature, expected);
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    assert.equal(decoded.email, EMAIL);
    assert.equal(decoded.expiresAt, expiresAt);
  });
});
