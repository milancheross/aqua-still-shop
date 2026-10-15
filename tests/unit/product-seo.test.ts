import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { productJsonLd, productOfferPrice, productVatLabel } from "../../src/lib/product-seo";
import type { Product } from "../../src/types";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    sku: "SKU-1",
    barcode: "",
    name: "Slavina",
    slug: "slavina",
    brand: "Aqua",
    categorySlug: "sanitarije",
    categoryName: "Sanitarije",
    price: 1200,
    vatRate: 0.2,
    unit: "kom",
    inStock: true,
    stockQuantity: 3,
    wmsLocation: "",
    shortDescription: "Kratak opis",
    description: "Dug opis",
    images: ["/a.jpg"],
    attributes: {},
    ...overrides,
  };
}

describe("product seo", () => {
  it("uses the actual VAT rate and does not invent 20%", () => {
    assert.equal(productVatLabel(0.1), "Cena je sa uračunatim PDV-om (10%).");
    assert.equal(productVatLabel(0.2), "Cena je sa uračunatim PDV-om (20%).");
    assert.match(productVatLabel(Number.NaN), /PDV-om\.$/);
  });

  it("offers the sale price and in-stock availability", () => {
    const json = productJsonLd(product({ salePrice: 900 }), "/proizvod/slavina");
    assert.equal(json.offers && json.offers.price, "900.00");
    assert.equal(json.offers && json.offers.availability, "https://schema.org/InStock");
    assert.equal(productOfferPrice(product({ salePrice: 900 })), 900);
  });

  it("marks out-of-stock products and does not include a fake review", () => {
    const json = productJsonLd(product({ inStock: false, stockQuantity: 0 }), "/proizvod/slavina");
    assert.equal(json.offers && json.offers.availability, "https://schema.org/OutOfStock");
    assert.equal("aggregateRating" in json, false);
  });
});
