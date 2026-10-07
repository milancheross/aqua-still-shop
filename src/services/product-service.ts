import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { Product, ProductCategory } from "@/types";
import { getCategoryFilterDefinitions } from "@/lib/catalog-filters";
import { AQUA_STILL_CATEGORY_ORDER } from "@/lib/catalog-taxonomy";
import { 
  getProducts as getMockProducts, 
  getProductBySlug as getMockProductBySlug, 
  getCategories as getMockCategories,
  BRANDS as getMockBrands 
} from "@/lib/mock-data";

export type StorefrontBrand = { id: string; name: string; slug: string; logoUrl: string | null };

function mockCatalogEnabled() {
  return process.env.NODE_ENV !== "production";
}

type CatalogProductOptions = {
  categorySlug?: string;
  subcategorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  attributes?: Record<string, string | number | boolean>;
  sort?: "price-asc" | "price-desc" | "name" | "popular" | "newest";
};

function devMockProducts(options?: CatalogProductOptions): Product[] {
  if (!mockCatalogEnabled()) return [];
  const { attributes, sort, ...mockOptions } = options ?? {};
  let products = getMockProducts({ ...mockOptions, sort: sort === "newest" ? undefined : sort });
  if (options?.minPrice !== undefined) {
    products = products.filter((product) => (product.salePrice ?? product.price) >= options.minPrice!);
  }
  if (options?.maxPrice !== undefined) {
    products = products.filter((product) => (product.salePrice ?? product.price) <= options.maxPrice!);
  }
  if (options?.attributes) {
    products = products.filter((product) =>
      Object.entries(options.attributes!).every(([key, value]) => String(product.attributes[key]) === String(value)),
    );
  }
  if (options?.categorySlug === "akcija") {
    return products.filter((product) => product.salePrice != null || product.isPromo);
  }
  return products;
}

function devMockBrandRecords(): StorefrontBrand[] {
  if (!mockCatalogEnabled()) return [];
  return getMockBrands.map((name) => ({
    id: name,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    logoUrl: null,
  }));
}

export async function getDbProducts(options?: {
  categorySlug?: string;
  subcategorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  search?: string;
  attributes?: Record<string, string | number | boolean>;
  sort?: "price-asc" | "price-desc" | "name" | "popular" | "newest";
}): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    return devMockProducts(options);
  }

  try {
    const count = await db.product.count();
    if (count === 0) {
      return devMockProducts(options);
    }

    const where: Prisma.ProductWhereInput = {};
    const andFilters: Prisma.ProductWhereInput[] = [];

    if (options?.categorySlug) {
      if (options.categorySlug === "akcija") {
        andFilters.push({
          OR: [{ salePrice: { not: null } }, { isPromo: true }],
        });
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

    if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
      where.price = {
        ...(options.minPrice !== undefined ? { gte: options.minPrice } : {}),
        ...(options.maxPrice !== undefined ? { lte: options.maxPrice } : {}),
      };
    }

    if (options?.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        andFilters.push({
          attributes: { path: [key], equals: value },
        });
      }
    }

    if (options?.search) {
      const q = options.search.trim();
      if (q) {
        andFilters.push({
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { barcode: { contains: q, mode: "insensitive" } },
            { categoryName: { contains: q, mode: "insensitive" } },
          ],
        });
      }
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
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
          orderBy = { isFeatured: "desc" };
          break;
        case "newest":
        default:
          orderBy = { createdAt: "desc" };
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

    const mapped = products.map((p) => ({
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

    if (options?.sort === "price-asc" || options?.sort === "price-desc") {
      const direction = options.sort === "price-asc" ? 1 : -1;
      mapped.sort((a, b) => ((a.salePrice ?? a.price) - (b.salePrice ?? b.price)) * direction);
    }

    return mapped;
  } catch (error) {
    console.error("DB product fetch failed:", error);
    return devMockProducts(options);
  }
}

export async function getDbProductBySlug(slug: string): Promise<Product | undefined> {
  if (!process.env.DATABASE_URL) {
    return mockCatalogEnabled() ? getMockProductBySlug(slug) : undefined;
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
      return mockCatalogEnabled() ? getMockProductBySlug(slug) : undefined;
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
    console.error("DB product by slug fetch failed:", error);
    return mockCatalogEnabled() ? getMockProductBySlug(slug) : undefined;
  }
}

export async function getDbCategories(): Promise<ProductCategory[]> {
  if (!process.env.DATABASE_URL) {
    return mockCatalogEnabled() ? getMockCategories() : [];
  }

  try {
    const [cats, categoryCounts, subcategoryCounts] = await Promise.all([
      db.category.findMany({ include: { subcategories: true } }),
      db.product.groupBy({
        by: ["categorySlug"],
        _count: { _all: true },
      }),
      db.product.groupBy({
        by: ["subcategorySlug"],
        _count: { _all: true },
      }),
    ]);

    if (!cats || cats.length === 0) {
      return mockCatalogEnabled() ? getMockCategories() : [];
    }

    const categoryCountMap = new Map(
      categoryCounts.map((entry) => [entry.categorySlug, entry._count._all]),
    );
    const subcategoryCountMap = new Map(
      subcategoryCounts
        .filter((entry) => entry.subcategorySlug)
        .map((entry) => [entry.subcategorySlug!, entry._count._all]),
    );
    const orderMap = new Map(AQUA_STILL_CATEGORY_ORDER.map((slug, index) => [slug, index]));

    return cats
      .sort((a, b) => (orderMap.get(a.slug) ?? 999) - (orderMap.get(b.slug) ?? 999))
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        imageUrl: c.imageUrl ?? undefined,
        itemCount: categoryCountMap.get(c.slug) ?? 0,
        iconName: (c.iconName as ProductCategory["iconName"]) || "wrench",
        subcategories: c.subcategories
          .sort((a, b) => a.name.localeCompare(b.name, "sr"))
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            itemCount: subcategoryCountMap.get(sub.slug) ?? 0,
            imageUrl: sub.imageUrl ?? undefined,
          })),
        attributes: getCategoryFilterDefinitions(c.slug).map((filter) => ({
          key: filter.key,
          label: filter.label,
          type: filter.type,
          options: filter.options,
          unit: filter.unit,
        })),
      }));
  } catch (error) {
    console.error("DB categories fetch failed:", error);
    return mockCatalogEnabled() ? getMockCategories() : [];
  }
}

export async function getDbBrands(): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    return mockCatalogEnabled() ? getMockBrands : [];
  }

  try {
    const products = await db.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
    });
    if (!products || products.length === 0) {
      return mockCatalogEnabled() ? getMockBrands : [];
    }
    return products.map((p) => p.brand).sort();
  } catch (error) {
    console.error("DB brands fetch failed:", error);
    return mockCatalogEnabled() ? getMockBrands : [];
  }
}


export async function getDbBrandRecords(): Promise<StorefrontBrand[]> {
  if (!process.env.DATABASE_URL) {
    return devMockBrandRecords();
  }

  try {
    const brands = await db.brand.findMany({ orderBy: { name: "asc" } });
    if (brands.length) return brands.map((brand) => ({ id: brand.id, name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl }));
    return devMockBrandRecords();
  } catch (error) {
    console.error("DB brand records fetch failed:", error);
    return devMockBrandRecords();
  }
}
