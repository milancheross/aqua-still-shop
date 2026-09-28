import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { Product, ProductCategory } from "@/types";
import { 
  getProducts as getMockProducts, 
  getProductBySlug as getMockProductBySlug, 
  getCategories as getMockCategories,
  BRANDS as getMockBrands 
} from "@/lib/mock-data";

export async function getDbProducts(options?: {
  categorySlug?: string;
  subcategorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  sort?: "price-asc" | "price-desc" | "name" | "popular";
}): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    if (options?.categorySlug === "akcija") {
      const mockAll = getMockProducts(options);
      return mockAll.filter(p => p.salePrice != null || p.isPromo);
    }
    return getMockProducts(options);
  }

  try {
    const count = await db.product.count();
    if (count === 0) {
      if (options?.categorySlug === "akcija") {
        const mockAll = getMockProducts(options);
        return mockAll.filter(p => p.salePrice != null || p.isPromo);
      }
      return getMockProducts(options);
    }

    const where: Prisma.ProductWhereInput = {};

    if (options?.categorySlug) {
      if (options.categorySlug === "akcija") {
        where.OR = [
          { salePrice: { not: null } },
          { isPromo: true },
        ];
      } else {
        where.categorySlug = options.categorySlug;
      }
    }

    if (options?.subcategorySlug) {
      where.subcategorySlug = options.subcategorySlug;
    }

    if (options?.brand) {
      where.brand = {
        equals: options.brand,
        mode: "insensitive",
      };
    }

    if (options?.inStockOnly) {
      where.inStock = true;
      where.stockQuantity = { gt: 0 };
    }

    if (options?.search) {
      const q = options.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { barcode: { contains: q, mode: "insensitive" } },
        { categoryName: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { isFeatured: "desc" };
    if (options?.sort) {
      switch (options.sort) {
        case "price-asc":
          orderBy = { price: "asc" };
          break;
        case "price-desc":
          orderBy = { price: "desc" };
          break;
        case "name":
          orderBy = { name: "asc" };
          break;
        case "popular":
        default:
          orderBy = { isFeatured: "desc" };
          break;
      }
    }

    const products = await db.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        subcategory: true,
      },
    });

    return products.map((p) => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode ?? "",
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      categorySlug: p.categorySlug,
      categoryName: p.categoryName,
      subcategorySlug: p.subcategorySlug ?? undefined,
      subcategoryName: p.subcategoryName ?? undefined,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      vatRate: Number(p.vatRate),
      unit: p.unit,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      wmsLocation: p.wmsLocation ?? "",
      shortDescription: p.shortDescription ?? "",
      description: p.description ?? "",
      images: p.images,
      pdfManualUrl: p.pdfManualUrl ?? undefined,
      attributes: (p.attributes as Record<string, string | number | boolean>) || {},
      isFeatured: p.isFeatured,
      isPromo: p.isPromo,
    }));
  } catch (error) {
    console.warn("DB product fetch failed, falling back to mock data:", error);
    if (options?.categorySlug === "akcija") {
      const mockAll = getMockProducts(options);
      return mockAll.filter(p => p.salePrice != null || p.isPromo);
    }
    return getMockProducts(options);
  }
}

export async function getDbProductBySlug(slug: string): Promise<Product | undefined> {
  if (!process.env.DATABASE_URL) {
    return getMockProductBySlug(slug);
  }

  try {
    const p = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
      },
    });

    if (!p) {
      return getMockProductBySlug(slug);
    }

    return {
      id: p.id,
      sku: p.sku,
      barcode: p.barcode ?? "",
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      categorySlug: p.categorySlug,
      categoryName: p.categoryName,
      subcategorySlug: p.subcategorySlug ?? undefined,
      subcategoryName: p.subcategoryName ?? undefined,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      vatRate: Number(p.vatRate),
      unit: p.unit,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      wmsLocation: p.wmsLocation ?? "",
      shortDescription: p.shortDescription ?? "",
      description: p.description ?? "",
      images: p.images,
      pdfManualUrl: p.pdfManualUrl ?? undefined,
      attributes: (p.attributes as Record<string, string | number | boolean>) || {},
      isFeatured: p.isFeatured,
      isPromo: p.isPromo,
    };
  } catch (error) {
    console.warn("DB product by slug fetch failed, falling back to mock data:", error);
    return getMockProductBySlug(slug);
  }
}

export async function getDbCategories(): Promise<ProductCategory[]> {
  if (!process.env.DATABASE_URL) {
    return getMockCategories();
  }

  try {
    const cats = await db.category.findMany({
      include: {
        subcategories: true,
      },
    });

    if (!cats || cats.length === 0) {
      return getMockCategories();
    }

    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      imageUrl: c.imageUrl ?? undefined,
      itemCount: c.itemCount,
      iconName: (c.iconName as ProductCategory["iconName"]) || "wrench",
      subcategories: c.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        itemCount: sub.itemCount,
      })),
      attributes: [],
    }));
  } catch (error) {
    console.warn("DB categories fetch failed, falling back to mock data:", error);
    return getMockCategories();
  }
}

export async function getDbBrands(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    return getMockBrands;
  }

  try {
    const products = await db.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
    });
    if (!products || products.length === 0) {
      return getMockBrands;
    }
    return products.map((p) => p.brand).sort();
  } catch (error) {
    console.warn("DB brands fetch failed, falling back to mock data:", error);
    return getMockBrands;
  }
}
