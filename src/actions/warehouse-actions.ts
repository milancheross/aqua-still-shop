"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const MOVEMENT_TYPES = ["receipt", "issue", "transfer", "stocktake"] as const;
type MovementType = (typeof MOVEMENT_TYPES)[number];

function text(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : NaN;
}

export async function getWarehouseData() {
  await requireAdmin();

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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();

  const productId = text(formData.get("productId"));
  const type = text(formData.get("type")) as MovementType;
  const quantity = numberValue(formData.get("quantity"));
  const locationId = text(formData.get("locationId")) || null;
  const note = text(formData.get("note")) || null;

  if (!productId || !MOVEMENT_TYPES.includes(type) || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Proverite proizvod, vrstu promene i količinu.");
  }

  await db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, stockQuantity: true, warehouseLocationId: true },
    });
    if (!product) throw new Error("Proizvod nije pronađen.");

    if (type === "issue" && product.stockQuantity < quantity) {
      throw new Error("Nema dovoljno robe na stanju.");
    }

    if (type === "transfer") {
      if (!locationId) throw new Error("Izaberite novu lokaciju.");
      await tx.product.update({
        where: { id: productId },
        data: { warehouseLocationId: locationId, wmsLocation: (await tx.warehouseLocation.findUnique({ where: { id: locationId }, select: { code: true } }))?.code ?? null },
      });
    } else if (type === "receipt") {
      const next = product.stockQuantity + quantity;
      const location = locationId ? await tx.warehouseLocation.findUnique({ where: { id: locationId }, select: { code: true } }) : null;
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: next,
          inStock: next > 0,
          ...(location ? { warehouseLocationId: locationId, wmsLocation: location.code } : {}),
        },
      });
    } else if (type === "issue") {
      const next = product.stockQuantity - quantity;
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: next, inStock: next > 0 },
      });
    } else if (type === "stocktake") {
      const counted = quantity;
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: counted, inStock: counted > 0 },
      });
    }

    await tx.stockMovement.create({
      data: { productId, type, quantity, locationId, note },
    });
  });

  revalidatePath("/magacin");
  revalidatePath("/katalog");
  revalidatePath("/admin/products");
  revalidatePath("/korpa");
  return { success: true };
}
