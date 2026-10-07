"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { parsePosCsv, type PosImportResult } from "@/lib/pos-integration";
import { revalidatePath } from "next/cache";

const POS_SOURCE = "generic";

function decimal(value: number | undefined, fallback: number) {
  return value === undefined ? fallback : Math.round(value * 100) / 100;
}

export async function importPosCsvAction(csv: string): Promise<PosImportResult> {
  await requireAdmin();
  if (!csv?.trim()) throw new Error("CSV fajl je prazan.");

  const rows = parsePosCsv(csv);
  if (!rows.length) throw new Error("Nisu pronađeni proizvodi. Proverite zaglavlja CSV fajla.");

  const result: PosImportResult = { created: 0, updated: 0, unchanged: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    try {
      const existing = row.externalId
        ? await db.product.findFirst({ where: { posSource: POS_SOURCE, posExternalId: row.externalId } })
        : row.barcode
          ? await db.product.findFirst({ where: { barcode: row.barcode } })
          : row.sku
            ? await db.product.findUnique({ where: { sku: row.sku } })
            : null;

      if (!existing && !row.sku) {
        result.skipped++;
        result.errors.push(row.name + ": nema SKU/šifru i nije pronađen po bar-kodu.");
        continue;
      }

      if (!existing) {
        // Generic importer deliberately does not auto-create catalog products yet:
        // categories, images and slugs require a human mapping step.
        result.skipped++;
        result.errors.push(row.name + ": novi proizvod — prvo ga treba mapirati u katalogu.");
        continue;
      }

      const data = {
        barcode: row.barcode ?? existing.barcode,
        price: decimal(row.price, Number(existing.price)),
        salePrice: row.salePrice ?? existing.salePrice === null ? null : Number(existing.salePrice),
        vatRate: decimal(row.vatRate, Number(existing.vatRate)),
        unit: row.unit ?? existing.unit,
        stockQuantity: row.stockQuantity ?? existing.stockQuantity,
        inStock: (row.stockQuantity ?? existing.stockQuantity) > 0,
        posSource: POS_SOURCE,
        posExternalId: row.externalId ?? existing.posExternalId,
      };

      const changed =
        data.barcode !== existing.barcode ||
        data.price !== Number(existing.price) ||
        data.salePrice !== (existing.salePrice === null ? null : Number(existing.salePrice)) ||
        data.vatRate !== Number(existing.vatRate) ||
        data.unit !== existing.unit ||
        data.stockQuantity !== existing.stockQuantity ||
        data.posExternalId !== existing.posExternalId;

      if (!changed) { result.unchanged++; continue; }
      await db.product.update({ where: { id: existing.id }, data });
      result.updated++;
    } catch (error) {
      result.errors.push(row.name + ": " + (error instanceof Error ? error.message : "nepoznata greška"));
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/katalog");
  revalidatePath("/magacin");
  return result;
}
