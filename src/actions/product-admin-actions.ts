"use server";


import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export interface ProductAdminInput {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  inStock: boolean;
  wmsLocation?: string;
  shortDescription?: string;
  description?: string;
  images: string[];
  attributes?: Record<string, string | number | boolean>;
  isFeatured?: boolean;
  isPromo?: boolean;
}

export async function getAdminProducts(filters?: {
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
}) {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) return [];

    const where: Prisma.ProductWhereInput = {};
    const andFilters: Prisma.ProductWhereInput[] = [];

    if (filters?.search) {
      const q = filters.search.trim();
      if (q) {
        andFilters.push({
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
          ],
        });
      }
    }

    if (filters?.category && filters.category !== "all") {
      where.categorySlug = filters.category;
    }

    if (filters?.brand && filters.brand !== "all") {
      where.brand = filters.brand;
    }

    if (filters?.status === "in_stock") {
      where.inStock = true;
      where.stockQuantity = { gt: 0 };
    } else if (filters?.status === "out_of_stock") {
      andFilters.push({
        OR: [
          { inStock: false },
          { stockQuantity: { lte: 0 } },
        ],
      });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      vatRate: Number(p.vatRate),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return [];
  }
}

export async function getAdminProductById(id: string) {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) return null;
    const p = await db.product.findUnique({ where: { id } });
    if (!p) return null;
    return {
      ...p,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      vatRate: Number(p.vatRate),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  } catch (e) {
    console.error("Error fetching admin product by id:", e);
    return null;
  }
}

function brandSlugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureBrand(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const existingByName = await db.brand.findUnique({ where: { name: cleanName } });
  if (existingByName) return;

  let slug = brandSlugify(cleanName);
  if (!slug) return;

  const existingBySlug = await db.brand.findUnique({ where: { slug } });
  if (existingBySlug) {
    if (existingBySlug.name === cleanName) return;
    slug = `${slug}-${Date.now().toString(36).slice(-6)}`;
  }

  try {
    await db.brand.create({
      data: { name: cleanName, slug },
    });
  } catch (error) {
    // Another admin may have created the same brand concurrently.
    const code = typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
    if (code === "P2002") {
      const existing = await db.brand.findUnique({ where: { name: cleanName } });
      if (existing) return;
    }
    throw error;
  }
}

export async function createAdminProduct(input: ProductAdminInput) {
  await requireAdmin();
  if (!input.name || !input.sku || !input.slug || !input.brand || !input.categorySlug) {
    throw new Error("Molimo popunite sva obavezna polja (naziv, SKU, slug, brend, kategorija).");
  }

  if (input.price < 0 || input.stockQuantity < 0) {
    throw new Error("Cena i količina ne mogu biti negativne.");
  }

  // Check unique SKU and slug
  const existingSku = await db.product.findUnique({ where: { sku: input.sku } });
  if (existingSku) {
    throw new Error(`Proizvod sa šifrom SKU "${input.sku}" već postoji.`);
  }

  const existingSlug = await db.product.findUnique({ where: { slug: input.slug } });
  if (existingSlug) {
    throw new Error(`Proizvod sa slug-om "${input.slug}" već postoji.`);
  }

  await ensureBrand(input.brand);\n\n  await ensureBrand(input.brand);\n\n  // Ensure category exists to prevent foreign key violation
  try {
    const existingCat = await db.category.findUnique({ where: { slug: input.categorySlug } });
    if (!existingCat) {
      await db.category.create({
        data: {
          name: input.categoryName || input.categorySlug,
          slug: input.categorySlug,
          iconName: "wrench",
        },
      });
    }
  } catch (catErr) {
    console.warn("Category ensure warning:", catErr);
  }

  const product = await db.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      barcode: input.barcode || null,
      brand: input.brand,
      categorySlug: input.categorySlug,
      categoryName: input.categoryName,
      subcategorySlug: input.subcategorySlug || null,
      subcategoryName: input.subcategoryName || null,
      price: input.price,
      salePrice: input.salePrice || null,
      stockQuantity: input.stockQuantity,
      inStock: input.stockQuantity > 0 && input.inStock,
      wmsLocation: input.wmsLocation || null,
      shortDescription: input.shortDescription || null,
      description: input.description || null,
      images: input.images.length > 0 ? input.images : ["/placeholder-tool.svg"],
      attributes: input.attributes || {},
      isFeatured: input.isFeatured || false,
      isPromo: input.isPromo || false,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/katalog");
  revalidatePath("/");

  return { success: true, productId: product.id };
}

export async function updateAdminProduct(id: string, input: ProductAdminInput) {
  await requireAdmin();
  if (!input.name || !input.sku || !input.slug) {
    throw new Error("Naziv, SKU i slug su obavezni.");
  }

  if (input.price < 0 || input.stockQuantity < 0) {
    throw new Error("Cena i količina ne mogu biti negativne.");
  }

  // Ensure category exists
  try {
    const existingCat = await db.category.findUnique({ where: { slug: input.categorySlug } });
    if (!existingCat) {
      await db.category.create({
        data: {
          name: input.categoryName || input.categorySlug,
          slug: input.categorySlug,
          iconName: "wrench",
        },
      });
    }
  } catch (catErr) {
    console.warn("Category ensure warning:", catErr);
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.slug,
      sku: input.sku,
      barcode: input.barcode || null,
      brand: input.brand,
      categorySlug: input.categorySlug,
      categoryName: input.categoryName,
      subcategorySlug: input.subcategorySlug || null,
      subcategoryName: input.subcategoryName || null,
      price: input.price,
      salePrice: input.salePrice || null,
      stockQuantity: input.stockQuantity,
      inStock: input.stockQuantity > 0 && input.inStock,
      wmsLocation: input.wmsLocation || null,
      shortDescription: input.shortDescription || null,
      description: input.description || null,
      images: input.images.length > 0 ? input.images : ["/placeholder-tool.svg"],
      attributes: input.attributes || {},
      isFeatured: input.isFeatured || false,
      isPromo: input.isPromo || false,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/katalog");
  revalidatePath(`/proizvod/${product.slug}`);
  revalidatePath("/");

  return { success: true };
}

export async function duplicateAdminProduct(id: string) {
  await requireAdmin();
  const original = await db.product.findUnique({ where: { id } });
  if (!original) throw new Error("Proizvod nije pronađen.");

  const newSku = `${original.sku}-COPY`;
  const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;

  await db.product.create({
    data: {
      name: `${original.name} (Kopija)`,
      slug: newSlug,
      sku: newSku,
      barcode: original.barcode,
      brand: original.brand,
      categorySlug: original.categorySlug,
      categoryName: original.categoryName,
      subcategorySlug: original.subcategorySlug,
      subcategoryName: original.subcategoryName,
      price: original.price,
      salePrice: original.salePrice,
      vatRate: original.vatRate,
      unit: original.unit,
      inStock: original.inStock,
      stockQuantity: original.stockQuantity,
      wmsLocation: original.wmsLocation,
      shortDescription: original.shortDescription,
      description: original.description,
      images: original.images,
      attributes: original.attributes || {},
      isFeatured: original.isFeatured,
      isPromo: original.isPromo,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/katalog");
  return { success: true };
}

export async function deleteAdminProduct(id: string) {
  await requireAdmin();
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    revalidatePath("/katalog");
    revalidatePath("/");
    return { success: true };
  } catch (e: unknown) {
    throw new Error("Brisanje proizvoda nije uspelo.");
  }
}
