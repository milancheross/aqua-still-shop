import type { Product } from "@/types";

export function productVatLabel(vatRate: number) {
  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 1) return "Cena je sa uračunatim PDV-om.";
  return `Cena je sa uračunatim PDV-om (${Math.round(vatRate * 100)}%).`;
}

export function productOfferPrice(product: Pick<Product, "price" | "salePrice">) {
  const price = product.salePrice ?? product.price;
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function productJsonLd(product: Product, url: string) {
  const price = productOfferPrice(product);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    description: product.shortDescription || product.description || product.name,
    image: product.images.filter(Boolean),
    url,
    offers: price == null ? undefined : {
      "@type": "Offer",
      priceCurrency: "RSD",
      price: price.toFixed(2),
      availability: product.inStock && product.stockQuantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
    },
  };
}
