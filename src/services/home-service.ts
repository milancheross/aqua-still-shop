import { db } from "@/lib/db";
import { getDbBrands, getDbCategories } from "@/services/product-service";
import type { Product, ProductCategory } from "@/types";

export async function getHomepageProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const products = await db.product.findMany({
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 6,
      select: {
        id: true, sku: true, barcode: true, name: true, slug: true, brand: true,
        categorySlug: true, categoryName: true, subcategorySlug: true, subcategoryName: true,
        price: true, salePrice: true, vatRate: true, unit: true, inStock: true,
        stockQuantity: true, wmsLocation: true, shortDescription: true, description: true,
        images: true, pdfManualUrl: true, attributes: true, isFeatured: true, isPromo: true,
      },
    });

    return products.map((p) => ({
      id: p.id, sku: p.sku, barcode: p.barcode ?? "", name: p.name, slug: p.slug,
      brand: p.brand, categorySlug: p.categorySlug, categoryName: p.categoryName,
      subcategorySlug: p.subcategorySlug ?? undefined, subcategoryName: p.subcategoryName ?? undefined,
      price: Number(p.price), salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      vatRate: Number(p.vatRate), unit: p.unit, inStock: p.inStock, stockQuantity: p.stockQuantity,
      wmsLocation: p.wmsLocation ?? "", shortDescription: p.shortDescription ?? "",
      description: p.description ?? "", images: p.images, pdfManualUrl: p.pdfManualUrl ?? undefined,
      attributes: (p.attributes as Record<string, string | number | boolean>) || {},
      isFeatured: p.isFeatured, isPromo: p.isPromo,
    }));
  } catch (error) {
    console.error("Homepage products fetch failed:", error);
    return [];
  }
}

export async function getHomepageData(): Promise<{
  categories: ProductCategory[];
  popularProducts: Product[];
  brands: string[];
}> {
  const [categories, popularProducts, brands] = await Promise.all([
    getDbCategories(),
    getHomepageProducts(),
    getDbBrands(),
  ]);

  return { categories, popularProducts, brands };
}
