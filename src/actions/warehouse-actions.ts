"use server";

import { revalidatePath } from "next/cache";
import { requireWarehouseAccess } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { applyIssue, applyReceipt, applyStocktake, MAX_NOTE_LENGTH, WarehouseStockError } from "@/lib/warehouse-stock";

const MOVEMENT_TYPES = ["receipt", "issue", "transfer", "stocktake"] as const;
type MovementType = (typeof MOVEMENT_TYPES)[number];

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return NaN;
  if (!/^-?\d+$/.test(value.trim())) return NaN;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : NaN;
}

function boundedText(value: FormDataEntryValue | null, maxLength: number) {
  const textValue = text(value);
  return textValue.length > maxLength ? textValue.slice(0, maxLength) : textValue;
}

export async function getWarehouseData() {
  await requireWarehouseAccess();

  const [productCount, lowStockCount, outOfStockCount, unassignedCount, locationCount, recentMovements, products] =
    await Promise.all([
      db.product.count(),
      db.product.count({ where: { stockQuantity: { gt: 0, lte: 5 } } }),
      db.product.count({ where: { stockQuantity: { lte: 0 } } }),
      db.product.count({ where: { warehouseLocationId: null } }),
      db.warehouseLocation.count({ where: { isActive: true } }),
      db.stockMovement.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true, sku: true } }, location: { select: { code: true } } },
      }),
      db.product.findMany({
        take: 80,
        orderBy: [{ stockQuantity: "asc" }, { name: "asc" }],
        select: {
          id: true, sku: true, barcode: true, name: true, brand: true,
          stockQuantity: true, unit: true, wmsLocation: true,
          warehouseLocation: { select: { code: true, label: true } },
        },
      }),
    ]);

  return {
    stats: { productCount, lowStockCount, outOfStockCount, unassignedCount, locationCount },
    products,
    movements: recentMovements.map((movement) => ({
      id: movement.id,
      type: movement.type,
      quantity: movement.quantity,
      note: movement.note,
      createdAt: movement.createdAt.toISOString(),
      productName: movement.product.name,
      sku: movement.product.sku,
      location: movement.location?.code ?? null,
    })),
  };
}

export async function searchWarehouseProduct(value: string) {
  await requireWarehouseAccess();
  const query = value.trim();
  if (!query) return null;

  return db.product.findFirst({
    where: {
      OR: [
        { sku: { equals: query, mode: "insensitive" } },
        { barcode: { equals: query } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true, sku: true, barcode: true, name: true, brand: true,
      stockQuantity: true, unit: true,
      warehouseLocation: { select: { id: true, code: true, label: true } },
    },
  });
}

export async function assignWarehouseLocation(productId: string, locationId: string) {
  await requireWarehouseAccess();
  if (!productId || !locationId) throw new Error("Proizvod i lokacija su obavezni.");

  const [product, location] = await Promise.all([
    db.product.findUnique({ where: { id: productId }, select: { id: true } }),
    db.warehouseLocation.findFirst({ where: { id: locationId, isActive: true } }),
  ]);

  if (!product) throw new Error("Proizvod nije pronađen.");
  if (!location) throw new Error("Lokacija nije pronađena.");

  await db.product.update({
    where: { id: productId },
    data: { warehouseLocationId: location.id, wmsLocation: location.code },
  });

  revalidatePath("/magacin");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function recordWarehouseMovement(formData: FormData) {
  await requireWarehouseAccess();

  const productId = text(formData.get("productId"));
  const type = text(formData.get("type")) as MovementType;
  const quantity = numberValue(formData.get("quantity"));
  const expectedQuantity = numberValue(formData.get("expectedQuantity"));
  const locationId = text(formData.get("locationId")) || null;
  const note = boundedText(formData.get("note"), MAX_NOTE_LENGTH) || null;

  if (!productId || productId.length > 200 || !MOVEMENT_TYPES.includes(type)) {
    throw new Error("Proverite proizvod i vrstu promene.");
  }

  try {
    await db.$transaction(async (tx) => {
      const location = locationId
        ? await tx.warehouseLocation.findUnique({ where: { id: locationId }, select: { id: true, code: true } })
        : null;
      if (locationId && !location) throw new WarehouseStockError("Izaberite važeću lokaciju.");

      if (type === "transfer") {
        if (!location) throw new WarehouseStockError("Izaberite novu lokaciju.");
        if (!Number.isInteger(quantity) || quantity <= 0) throw new WarehouseStockError("Proverite količinu premeštanja.");
        await tx.product.update({
          where: { id: productId },
          data: { warehouseLocationId: location.id, wmsLocation: location.code },
        });
        await tx.stockMovement.create({
          data: { productId, type, quantity, locationId: location.id, note },
        });
        return;
      }

      if (type === "receipt") {
        await applyReceipt(tx, { productId, quantity, locationId: location?.id, locationCode: location?.code, note });
        return;
      }
      if (type === "issue") {
        await applyIssue(tx, { productId, quantity, note });
        return;
      }
      await applyStocktake(tx, {
        productId,
        expectedQuantity,
        countedQuantity: quantity,
        locationId: location?.id,
        locationCode: location?.code,
        note,
      });
    });
  } catch (error) {
    if (error instanceof WarehouseStockError) throw new Error(error.message);
    if (error instanceof Error && error.message === "Proizvod nije pronađen.") throw error;
    throw new Error("Promena magacina nije sačuvana. Pokušajte ponovo.");
  }

  revalidatePath("/magacin");
  revalidatePath("/katalog");
  revalidatePath("/admin/products");
  revalidatePath("/korpa");
  return { success: true };
}
