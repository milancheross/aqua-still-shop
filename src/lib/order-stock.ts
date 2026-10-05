import { db } from "@/lib/db";
import { STOCK_RESERVATION_MS } from "@/lib/order-present";

export { STOCK_RESERVATION_MS };

export function stockReservedUntil(from = new Date()) {
  return new Date(from.getTime() + STOCK_RESERVATION_MS);
}

/**
 * Pending cash orders hold stock until the shop accepts them or this window ends.
 * Moving an order to "processing" (or any later status) keeps the reservation.
 */
export async function releaseExpiredStockReservations() {
  if (!process.env.DATABASE_URL) return 0;

  const now = new Date();
  const createdBefore = new Date(now.getTime() - STOCK_RESERVATION_MS);
  const expired = await db.order.findMany({
    where: {
      status: "pending",
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
      const order = await tx.order.findUnique({
        where: { id },
        include: { orderItems: true },
      });
      if (!order || order.status !== "pending") return false;

      const due = order.stockReservedUntil ?? new Date(order.createdAt.getTime() + STOCK_RESERVATION_MS);
      if (due > new Date()) return false;

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity }, inStock: true },
        });
      }

      await tx.order.update({
        where: { id },
        data: { status: "cancelled", stockReservedUntil: null },
      });
      return true;
    });

    if (didRelease) released += 1;
  }

  return released;
}
