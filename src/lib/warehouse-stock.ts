import type { Prisma } from "@prisma/client";

export const MAX_MOVEMENT_QUANTITY = 1_000_000;
export const MAX_NOTE_LENGTH = 500;

export class WarehouseStockError extends Error {}

export function assertPositiveQuantity(quantity: number, label = "Količina") {
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_MOVEMENT_QUANTITY) {
    throw new WarehouseStockError(`${label} mora biti ceo broj od 1 do ${MAX_MOVEMENT_QUANTITY}.`);
  }
}

export function assertCountedQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_MOVEMENT_QUANTITY) {
    throw new WarehouseStockError(`Popisana količina mora biti ceo broj od 0 do ${MAX_MOVEMENT_QUANTITY}.`);
  }
}

export async function applyReceipt(
  tx: Prisma.TransactionClient,
  input: { productId: string; quantity: number; locationId?: string | null; locationCode?: string | null; note?: string | null },
) {
  assertPositiveQuantity(input.quantity);
  const product = await tx.product.findUnique({ where: { id: input.productId }, select: { id: true } });
  if (!product) throw new WarehouseStockError("Proizvod nije pronađen.");

  await tx.product.update({
    where: { id: input.productId },
    data: {
      stockQuantity: { increment: input.quantity },
      inStock: true,
      ...(input.locationId ? { warehouseLocationId: input.locationId, wmsLocation: input.locationCode ?? null } : {}),
    },
  });
  await tx.stockMovement.create({
    data: {
      productId: input.productId,
      type: "receipt",
      quantity: input.quantity,
      locationId: input.locationId ?? null,
      note: input.note ?? null,
    },
  });
}

export async function applyIssue(
  tx: Prisma.TransactionClient,
  input: { productId: string; quantity: number; note?: string | null },
) {
  assertPositiveQuantity(input.quantity);
  const updated = await tx.product.updateMany({
    where: { id: input.productId, stockQuantity: { gte: input.quantity } },
    data: { stockQuantity: { decrement: input.quantity } },
  });
  if (updated.count !== 1) {
    throw new WarehouseStockError("Nema dovoljno robe na stanju ili je stanje zastarelo.");
  }
  const current = await tx.product.findUnique({ where: { id: input.productId }, select: { stockQuantity: true } });
  if (!current || current.stockQuantity < 0) {
    throw new WarehouseStockError("Nema dovoljno robe na stanju ili je stanje zastarelo.");
  }
  await tx.product.update({
    where: { id: input.productId },
    data: { inStock: current.stockQuantity > 0 },
  });
  await tx.stockMovement.create({
    data: {
      productId: input.productId,
      type: "issue",
      quantity: input.quantity,
      note: input.note ?? null,
    },
  });
}

export async function applyStocktake(
  tx: Prisma.TransactionClient,
  input: { productId: string; expectedQuantity: number; countedQuantity: number; locationId?: string | null; locationCode?: string | null; note?: string | null },
) {
  assertCountedQuantity(input.expectedQuantity);
  assertCountedQuantity(input.countedQuantity);
  const delta = input.countedQuantity - input.expectedQuantity;
  if (delta === 0) return { changed: false as const };

  const updated = await tx.product.updateMany({
    where: { id: input.productId, stockQuantity: input.expectedQuantity },
    data: {
      stockQuantity: input.countedQuantity,
      inStock: input.countedQuantity > 0,
      ...(input.locationId ? { warehouseLocationId: input.locationId, wmsLocation: input.locationCode ?? null } : {}),
    },
  });
  if (updated.count !== 1) {
    throw new WarehouseStockError("Stanje se promenilo. Osvežite podatke i ponovite popis.");
  }
  await tx.stockMovement.create({
    data: {
      productId: input.productId,
      type: "stocktake",
      quantity: delta,
      locationId: input.locationId ?? null,
      note: input.note ?? null,
    },
  });
  return { changed: true as const, delta };
}
