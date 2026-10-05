import { db } from "@/lib/db";

type MemoryBucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, MemoryBucket>();

function pruneMemory(now: number) {
  for (const [key, entry] of memoryBuckets) {
    if (entry.resetAt <= now) memoryBuckets.delete(key);
  }
}

/**
 * Client IP as observed by the platform. `x-real-ip` and `x-vercel-forwarded-for`
 * are set by the host. The leftmost `x-forwarded-for` value is not used because
 * a client can spoof it when the proxy appends the real address.
 */
export function getTrustedClientIp(headerStore: { get(name: string): string | null }) {
  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const vercelIp = headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return vercelIp;

  return "unknown";
}

export async function isRateLimited(bucket: string, limit: number, windowMs: number) {
  const now = Date.now();
  pruneMemory(now);
  const local = memoryBuckets.get(bucket);
  if (local && local.resetAt > now && local.count >= limit) return true;
  if (!process.env.DATABASE_URL) return false;

  try {
    const count = await db.rateLimitEvent.count({
      where: { bucket, createdAt: { gte: new Date(now - windowMs) } },
    });
    return count >= limit;
  } catch (error) {
    console.error("Rate limit lookup failed:", error);
    return local !== undefined && local.resetAt > now && local.count >= limit;
  }
}

export async function recordRateLimitEvent(bucket: string, windowMs: number) {
  const now = Date.now();
  pruneMemory(now);
  const current = memoryBuckets.get(bucket);
  if (current && current.resetAt > now) {
    current.count += 1;
  } else {
    memoryBuckets.set(bucket, { count: 1, resetAt: now + windowMs });
  }

  if (!process.env.DATABASE_URL) return;

  try {
    await db.rateLimitEvent.create({ data: { bucket } });
    await db.rateLimitEvent.deleteMany({
      where: {
        OR: [
          { bucket, createdAt: { lt: new Date(now - windowMs) } },
          { createdAt: { lt: new Date(now - 48 * 60 * 60 * 1000) } },
        ],
      },
    });
  } catch (error) {
    console.error("Rate limit write failed:", error);
  }
}

export async function clearRateLimitBucket(bucket: string) {
  memoryBuckets.delete(bucket);
  if (!process.env.DATABASE_URL) return;

  try {
    await db.rateLimitEvent.deleteMany({ where: { bucket } });
  } catch (error) {
    console.error("Rate limit clear failed:", error);
  }
}
