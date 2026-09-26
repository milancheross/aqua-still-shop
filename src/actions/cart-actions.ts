"use server";

import { db } from "@/lib/db";
import { getDbProductBySlug } from "@/services/product-service";
import { Product } from "@/types";

export interface ServerCartItem {
  product: Product;
  quantity: number;
}

/**
 * Server Action to validate a product and get its latest server-side price and stock.
 * Security: NEVER trust client-supplied prices.
 */
export async function validateAndGetProduct(productIdOrSlug: string, requestedQuantity: number = 1) {
  if (requestedQuantity <= 0) {
    throw new Error("Količina mora biti veća od nule.");
  }

  // Try fetching by ID first, then by slug
  let product: Product | undefined;
  
  try {
    const dbProduct = await db.product.findFirst({
      where: {
        OR: [
          { id: productIdOrSlug },
          { slug: productIdOrSlug },
        ],
      },
    });

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        sku: dbProduct.sku,
        barcode: dbProduct.barcode ?? "",
        name: dbProduct.name,
        slug: dbProduct.slug,
        brand: dbProduct.brand,
        categorySlug: dbProduct.categorySlug,
        categoryName: dbProduct.categoryName,
        subcategorySlug: dbProduct.subcategorySlug ?? undefined,
        subcategoryName: dbProduct.subcategoryName ?? undefined,
        price: Number(dbProduct.price),
        salePrice: dbProduct.salePrice ? Number(dbProduct.salePrice) : undefined,
        vatRate: Number(dbProduct.vatRate),
        unit: dbProduct.unit,
        inStock: dbProduct.inStock,
        stockQuantity: dbProduct.stockQuantity,
        wmsLocation: dbProduct.wmsLocation ?? "",
        shortDescription: dbProduct.shortDescription ?? "",
        description: dbProduct.description ?? "",
        images: dbProduct.images,
        pdfManualUrl: dbProduct.pdfManualUrl ?? undefined,
        attributes: (dbProduct.attributes as Record<string, string | number | boolean>) || {},
        isFeatured: dbProduct.isFeatured,
        isPromo: dbProduct.isPromo,
      };
    } else {
      product = await getDbProductBySlug(productIdOrSlug);
    }
  } catch (error) {
    console.warn("Error fetching product from DB in server action, trying slug lookup:", error);
    product = await getDbProductBySlug(productIdOrSlug);
  }

  if (!product) {
    throw new Error("Proizvod nije pronađen.");
  }

  if (!product.inStock || product.stockQuantity < requestedQuantity) {
    throw new Error(`Tražena količina (${requestedQuantity}) premašuje raspoložive zalihe (${product.stockQuantity}) za proizvod: ${product.name}`);
  }

  return {
    product,
    unitPrice: product.salePrice ?? product.price,
    vatRate: product.vatRate,
  };
}

/**
 * Server Action for calculating cart summary (subtotal, tax, shipping, total)
 * ensuring server-authoritative prices.
 */
export async function calculateCartServerSummary(items: { productId: string; quantity: number }[]) {
  let subtotal = 0;
  let taxAmount = 0;
  const validatedItems: { product: Product; quantity: number; lineTotal: number }[] = [];

  for (const item of items) {
    if (item.quantity <= 0) continue;
    const validated = await validateAndGetProduct(item.productId, item.quantity);
    const effectivePrice = validated.unitPrice;
    const lineTotal = effectivePrice * item.quantity;

    subtotal += lineTotal;
    taxAmount += lineTotal * (validated.vatRate / (1 + validated.vatRate)); // Uračunati PDV

    validatedItems.push({
      product: validated.product,
      quantity: item.quantity,
      lineTotal,
    });
  }

  const FREE_SHIPPING_THRESHOLD = 5000;
  const DEFAULT_SHIPPING_COST = 500;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : DEFAULT_SHIPPING_COST;
  const total = subtotal + shippingCost;

  return {
    items: validatedItems,
    subtotal,
    taxAmount,
    shippingCost,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    total,
  };
}
