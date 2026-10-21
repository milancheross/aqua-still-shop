"use server";

import { requireAdminOrEditor } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { CsvProductRow, ImportBatchResult, StockUpdateMode } from "@/lib/product-csv-types";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Osigurava da brend postoji u bazi pre dodavanja proizvoda.
 */
async function ensureBrandExists(name: string): Promise<string> {
  const cleanName = name.trim();
  if (!cleanName) return "Aqua Still";

  const existingByName = await db.brand.findUnique({ where: { name: cleanName } });
  if (existingByName) return existingByName.name;

  let slug = slugify(cleanName);
  if (!slug) slug = `brend-${Date.now().toString(36)}`;

  const existingBySlug = await db.brand.findUnique({ where: { slug } });
  if (existingBySlug) {
    if (existingBySlug.name.toLowerCase() === cleanName.toLowerCase()) {
      return existingBySlug.name;
    }
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  try {
    const created = await db.brand.create({
      data: { name: cleanName, slug },
    });
    return created.name;
  } catch {
    const fallback = await db.brand.findUnique({ where: { name: cleanName } });
    return fallback?.name || cleanName;
  }
}

/**
 * Osigurava da kategorija postoji u bazi kako se ne bi narušio strani ključ.
 */
async function ensureCategoryExists(categoryName: string): Promise<{ slug: string; name: string }> {
  const cleanName = categoryName.trim();
  let targetSlug = slugify(cleanName);
  if (!targetSlug) targetSlug = "ostalo";

  const existing = await db.category.findFirst({
    where: {
      OR: [
        { slug: targetSlug },
        { name: { equals: cleanName, mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    return { slug: existing.slug, name: existing.name };
  }

  try {
    const created = await db.category.create({
      data: {
        name: cleanName,
        slug: targetSlug,
        iconName: "wrench",
      },
    });
    return { slug: created.slug, name: created.name };
  } catch {
    const fallback = await db.category.findFirst({
      where: {
        OR: [
          { slug: targetSlug },
          { name: { equals: cleanName, mode: "insensitive" } },
        ],
      },
    });
    return fallback ? { slug: fallback.slug, name: fallback.name } : { slug: targetSlug, name: cleanName };
  }
}

/**
 * Server Action za uvoz jedne serije proizvoda (npr. 50 artikala po pozivu).
 * Izvršava se unutar zaštićenog administratorskog konteksta uz Prisma upsert logiku baziranu na SKU polju.
 *
 * Podržava tri strogo razdvojena režima rukovanja zalihama:
 * - "set": Apsolutno postavljanje zaliha (Popis/Inventar) uz evidentiranje razlike u StockMovement tabeli.
 * - "increment": Uvećavanje postojećih zaliha za količinu iz CSV-a (Prijem robe).
 * - "ignore": Zalihe ostaju netaknute, ažuriraju se samo cene i opisni podaci.
 */
export async function importProductsBatchAction(
  batch: CsvProductRow[],
  stockMode: StockUpdateMode = "set"
): Promise<ImportBatchResult> {
  await requireAdminOrEditor();

  if (!Array.isArray(batch) || batch.length === 0) {
    return {
      success: true,
      batchSize: 0,
      createdCount: 0,
      updatedCount: 0,
      stockMovementsCount: 0,
      errors: [],
    };
  }

  let createdCount = 0;
  let updatedCount = 0;
  let stockMovementsCount = 0;
  const errors: { sku: string; error: string }[] = [];

  for (const item of batch) {
    const cleanSku = String(item.sku || "").trim();
    const cleanName = String(item.name || "").trim();

    if (!cleanSku) {
      errors.push({ sku: "NEPOZNATO", error: "Nedostaje obavezna šifra proizvoda (SKU)." });
      continue;
    }

    if (!cleanName) {
      errors.push({ sku: cleanSku, error: "Nedostaje obavezni naziv proizvoda." });
      continue;
    }

    const price = Math.max(0, Number(item.price) || 0);
    const salePrice =
      item.salePrice !== null && item.salePrice !== undefined && !isNaN(Number(item.salePrice)) && Number(item.salePrice) > 0
        ? Math.max(0, Number(item.salePrice))
        : null;

    const rawCategory = item.category?.trim() || "Alati i oprema";
    const rawBrand = item.brand?.trim() || "Aqua Still";
    const cleanUnit = item.unit?.trim() || "kom";
    const cleanBarcode = item.barcode?.trim() || null;
    const cleanDescription = item.description?.trim() || null;
    const cleanImages = item.imageUrl && item.imageUrl.trim().startsWith("http") ? [item.imageUrl.trim()] : [];

    try {
      // 1. Osiguravanje brenda i kategorije
      const brandName = await ensureBrandExists(rawBrand);
      const category = await ensureCategoryExists(rawCategory);

      // 2. Obrada artikla u atomskoj transakciji
      await db.$transaction(async (tx) => {
        const existing = await tx.product.findUnique({
          where: { sku: cleanSku },
          select: {
            id: true,
            sku: true,
            slug: true,
            stockQuantity: true,
            inStock: true,
            images: true,
          },
        });

        if (existing) {
          // --- SCENARIO A: AŽURIRANJE POSTOJEĆEG PROIZVODA ---
          let finalStock = existing.stockQuantity;
          let stockMovementData: { type: string; quantity: number; note: string } | null = null;

          if (stockMode === "set") {
            // Apsolutno postavljanje (Popis/Inventar)
            if (item.stockQuantity !== null) {
              finalStock = Math.max(0, item.stockQuantity);
              const delta = finalStock - existing.stockQuantity;
              if (delta !== 0) {
                stockMovementData = {
                  type: "stocktake",
                  quantity: delta,
                  note: `CSV popis zaliha: promena sa ${existing.stockQuantity} na ${finalStock} ${cleanUnit}`,
                };
              }
            }
          } else if (stockMode === "increment") {
            // Uvećavanje zaliha (Prijem robe)
            if (item.stockQuantity !== null && item.stockQuantity > 0) {
              const toAdd = item.stockQuantity;
              finalStock = existing.stockQuantity + toAdd;
              stockMovementData = {
                type: "receipt",
                quantity: toAdd,
                note: `CSV prijem robe: uvećanje za +${toAdd} ${cleanUnit} (novo stanje: ${finalStock})`,
              };
            }
          }
          // Ako je stockMode === "ignore", finalStock ostaje existing.stockQuantity

          const finalInStock = finalStock > 0;

          await tx.product.update({
            where: { id: existing.id },
            data: {
              name: cleanName,
              brand: brandName,
              categorySlug: category.slug,
              categoryName: category.name,
              price: new Prisma.Decimal(price),
              salePrice: salePrice !== null ? new Prisma.Decimal(salePrice) : null,
              stockQuantity: finalStock,
              inStock: finalInStock,
              unit: cleanUnit,
              ...(cleanBarcode ? { barcode: cleanBarcode } : {}),
              ...(cleanDescription ? { description: cleanDescription } : {}),
              ...(cleanImages.length > 0 && existing.images.length === 0 ? { images: cleanImages } : {}),
              updatedAt: new Date(),
            },
          });

          // Ako je došlo do promene zaliha, evidentiraj kretanje u magacinu
          if (stockMovementData) {
            await tx.stockMovement.create({
              data: {
                productId: existing.id,
                type: stockMovementData.type,
                quantity: stockMovementData.quantity,
                note: stockMovementData.note,
              },
            });
            stockMovementsCount++;
          }

          updatedCount++;
        } else {
          // --- SCENARIO B: KREIRANJE NOVOG PROIZVODA ---
          const initialStock = item.stockQuantity !== null ? Math.max(0, item.stockQuantity) : 0;
          const initialInStock = initialStock > 0;

          let productSlug = slugify(cleanName);
          if (!productSlug) productSlug = `artikal-${slugify(cleanSku)}`;

          const existingSlug = await tx.product.findUnique({ where: { slug: productSlug } });
          if (existingSlug) {
            productSlug = `${productSlug}-${slugify(cleanSku)}`;
          }

          const secondCheck = await tx.product.findUnique({ where: { slug: productSlug } });
          if (secondCheck) {
            productSlug = `${productSlug}-${Date.now().toString(36).slice(-4)}`;
          }

          const newProduct = await tx.product.create({
            data: {
              sku: cleanSku,
              name: cleanName,
              slug: productSlug,
              brand: brandName,
              categorySlug: category.slug,
              categoryName: category.name,
              price: new Prisma.Decimal(price),
              salePrice: salePrice !== null ? new Prisma.Decimal(salePrice) : null,
              vatRate: new Prisma.Decimal(0.20),
              unit: cleanUnit,
              inStock: initialInStock,
              stockQuantity: initialStock,
              barcode: cleanBarcode,
              description: cleanDescription,
              images: cleanImages,
            },
          });

          // Inicijalni zapis u kartici artikla ukoliko ima početnih zaliha
          if (initialStock > 0) {
            await tx.stockMovement.create({
              data: {
                productId: newProduct.id,
                type: stockMode === "increment" ? "receipt" : "stocktake",
                quantity: initialStock,
                note: `Inicijalno stanje artikla iz CSV uvoza (${initialStock} ${cleanUnit})`,
              },
            });
            stockMovementsCount++;
          }

          createdCount++;
        }
      });
    } catch (itemError: unknown) {
      const msg = itemError instanceof Error ? itemError.message : "Neuspešan upis artikla u bazu.";
      errors.push({ sku: cleanSku, error: msg });
    }
  }

  // Invalidacija keširanih stranica kataloga
  try {
    revalidatePath("/admin/products");
    revalidatePath("/magacin");
    revalidatePath("/katalog");
    revalidatePath("/");
  } catch (revalidateErr) {
    console.warn("Revalidate path warning during CSV import:", revalidateErr);
  }

  return {
    success: errors.length === 0,
    batchSize: batch.length,
    createdCount,
    updatedCount,
    stockMovementsCount,
    errors,
  };
}
