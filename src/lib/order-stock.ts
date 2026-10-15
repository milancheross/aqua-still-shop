import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { STOCK_RESERVATION_MS } from "@/lib/order-present";

export { STOCK_RESERVATION_MS };

/** Statuses that still hold reserved stock and may be cancelled under current rules. */
export const RELEASABLE_STATUSES = ["pending", "processing", "ready_for_pickup"] as const;

export function stockReservedUntil(from = new Date()) {
  return new Date(from.getTime() + STOCK_RESERVATION_MS);
}

export type ReleaseMode = "cancel" | "expiry";

export type ReleaseResult = {
  released: boolean;
};

function expiryWhere(orderId: string, now: Date): Prisma.OrderWhereInput {
  const createdBefore = new Date(now.getTime() - STOCK_RESERVATION_MS);
  return {
    id: orderId,
    status: "pending",
    stockReleasedAt: null,
    OR: [
      { stockReservedUntil: { lte: now } },
      { stockReservedUntil: null, createdAt: { lte: createdBefore } },
    ],
  };
}

function cancelWhere(orderId: string): Prisma.OrderWhereInput {
  return {
    id: orderId,
    stockReleasedAt: null,
    status: { in: [...RELEASABLE_STATUSES] },
  };
}

/**
 * Atomically claims the right to release reserved stock.
 * Historical cancelled orders (stockReleasedAt NULL) are not candidates:
 * cancel/expiry predicates exclude status=cancelled, so NULL is not treated as "not returned".
 * No stock backfill is performed.
 */
export async function releaseOrderStock(
  tx: Prisma.TransactionClient,
  orderId: string,
  mode: ReleaseMode,
  now = new Date(),
): Promise<ReleaseResult> {
  const claimed = await tx.order.updateMany({
    where: mode === "expiry" ? expiryWhere(orderId, now) : cancelWhere(orderId),
    data: {
      status: "cancelled",
      stockReleasedAt: now,
      stockReservedUntil: null,
    },
  });

  if (claimed.count !== 1) return { released: false };

  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true },
  });

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Stavka porudžbine nema važeću količinu za oslobađanje rezervacije.");
    }
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity }, inStock: true },
    });
    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        type: "reservation_release",
        quantity: item.quantity,
        note: `order:${orderId}`,
      },
    });
  }

  return { released: true };
}

/**
 * Pending -> processing must win the row before expiry can cancel it.
 * Does not release stock. Returns false if the row is no longer pending.
 */
export async function claimProcessingTransition(
  tx: Prisma.TransactionClient,
  orderId: string,
): Promise<boolean> {
  const moved = await tx.order.updateMany({
    where: { id: orderId, status: "pending", stockReleasedAt: null },
    data: { status: "processing", stockReservedUntil: null },
  });
  return moved.count === 1;
}

/**
 * Conditional status move that does not release stock.
 * Fails closed if the row changed since it was read.
 */
export async function claimStatusTransition(
  tx: Prisma.TransactionClient,
  orderId: string,
  fromStatus: string,
  toStatus: string,
): Promise<boolean> {
  const moved = await tx.order.updateMany({
    where: { id: orderId, status: fromStatus, stockReleasedAt: null },
    data: { status: toStatus, stockReservedUntil: null },
  });
  return moved.count === 1;
}

/**
 * Pending cash orders hold stock until the shop accepts them or this window ends.
 * Only pending orders with an expired reservation are eligible. Processing is never cancelled here.
 */
export async function releaseExpiredStockReservations() {
  if (!process.env.DATABASE_URL) return 0;

  const now = new Date();
  const createdBefore = new Date(now.getTime() - STOCK_RESERVATION_MS);
  const expired = await db.order.findMany({
    where: {
      status: "pending",
      stockReleasedAt: null,
      OR: [
        { stockReservedUntil: { lte: now } },
        { stockReservedUntil: null, createdAt: { lte: createdBefore } },
      ],
    },
    select: { id: true },
    take: 50,
    orderBy: { createdAt: "asc" },
  });

  let released = 0;
  for (const { id } of expired) {
    const didRelease = await db.$transaction(async (tx) => {
      const result = await releaseOrderStock(tx, id, "expiry", now);
      return result.released;
    });
    if (didRelease) released += 1;
  }

  return released;
}
