import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { Product, ProductCategory } from "@/types";
import { getCategoryFilterDefinitions } from "@/lib/catalog-filters";
import { catalogOrderBy, type CatalogSort } from "@/lib/catalog-pagination";
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

function catalogWhere(options?: CatalogProductOptions): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const andFilters: Prisma.ProductWhereInput[] = [];
  if (options?.categorySlug) {
    if (options.categorySlug === "akcija") {
      andFilters.push({ OR: [{ salePrice: { not: null } }, { isPromo: true }] });
    } else {
      where.categorySlug = options.categorySlug;
    }
  }
  if (options?.subcategorySlug) where.subcategorySlug = options.subcategorySlug;
  if (options?.brand) where.brand = { equals: options.brand, mode: "insensitive" };
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
      andFilters.push({ attributes: { path: [key], equals: value } });
    }
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
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
  if (andFilters.length > 0) where.AND = andFilters;
  return where;
}

function mapProduct(p: Prisma.ProductGetPayload<{ include: { category: true; subcategory: true } }>): Product {
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
}

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
  sort?: CatalogSort;
  limit?: number;
}): Promise<Product[]> {
  const page = await getDbCatalogPage({ ...options, page: 1, take: options?.limit });
  return page.products;
}

export async function getDbCatalogAttributes(options?: CatalogProductOptions): Promise<Array<Record<string, unknown>>> {
  if (!process.env.DATABASE_URL) return devMockProducts(options).map((product) => product.attributes);
  try {
    const rows = await db.product.findMany({
    where: catalogWhere(options),
    select: { attributes: true },
  });
  return rows.map((row) => (row.attributes && typeof row.attributes === "object" && !Array.isArray(row.attributes) ? row.attributes as Record<string, unknown> : {}));
  } catch (error) {
    console.error("DB catalog attributes fetch failed:", error);
    return [];
  }
}

export async function getDbCatalogPage(options?: CatalogProductOptions & { page?: number; take?: number }): Promise<{ products: Product[]; total: number }> {
  const page = Math.max(options?.page ?? 1, 1);
  const take = options?.take;
  if (!process.env.DATABASE_URL) {
    const products = devMockProducts(options);
    const start = (page - 1) * (take ?? products.length);
    return { products: take ? products.slice(start, start + take) : products, total: products.length };
  }
  try {
    const where = catalogWhere(options);
    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: catalogOrderBy(options?.sort),
        skip: take ? (page - 1) * take : undefined,
        take,
        include: { category: true, subcategory: true },
      }),
    ]);
    if (total === 0 && mockCatalogEnabled()) {
      const mocked = devMockProducts(options);
      const start = (page - 1) * (take ?? mocked.length);
      return { products: take ? mocked.slice(start, start + take) : mocked, total: mocked.length };
    }
    return { products: products.map(mapProduct), total };
  } catch (error) {
    console.error("DB product fetch failed:", error);
    const mocked = devMockProducts(options);
    return { products: mocked, total: mocked.length };
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
      db.category.findMany({ include: { subcategories: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
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
    return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        seoTitle: c.seoTitle ?? undefined,
        seoDescription: c.seoDescription ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        featured: c.featured,
        sortOrder: c.sortOrder,
        itemCount: categoryCountMap.get(c.slug) ?? 0,
        iconName: (c.iconName as ProductCategory["iconName"]) || "wrench",
        subcategories: c.subcategories
          .sort((a, b) => a.name.localeCompare(b.name, "sr"))
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description ?? undefined,
            seoTitle: sub.seoTitle ?? undefined,
            seoDescription: sub.seoDescription ?? undefined,
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
