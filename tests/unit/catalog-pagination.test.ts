import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCatalogQuery,
  catalogCanonicalPath,
  catalogOrderBy,
  catalogTotalPages,
  clampCatalogPage,
  parseCatalogPage,
  parseCatalogTake,
} from "../../src/lib/catalog-pagination";

describe("catalog pagination", () => {
  it("rejects invalid, negative, and oversized page/take values", () => {
    assert.equal(parseCatalogPage(undefined), 1);
    assert.equal(parseCatalogPage("0"), 1);
    assert.equal(parseCatalogPage("-3"), 1);
    assert.equal(parseCatalogPage("abc"), 1);
    assert.equal(parseCatalogPage("2"), 2);
    assert.equal(parseCatalogTake(undefined), 24);
    assert.equal(parseCatalogTake("-1"), 24);
    assert.equal(parseCatalogTake("0"), 24);
    assert.equal(parseCatalogTake("1000"), 48);
    assert.equal(parseCatalogTake("12"), 12);
  });

  it("preserves filters and sort while changing page", () => {
    const url = buildCatalogQuery({
      current: { category: "alati", q: "busilica", sort: "name", inStock: "true" },
      changes: { page: "2" },
    });
    assert.equal(url, "/katalog?category=alati&q=busilica&sort=name&inStock=true&page=2");
  });

  it("resets page when a filter or search changes", () => {
    const url = buildCatalogQuery({
      current: { category: "alati", page: "3", sort: "price-asc" },
      changes: { q: "ventil" },
      resetPage: true,
    });
    assert.equal(url.includes("page="), false);
    assert.equal(url.includes("q=ventil"), true);
  });

  it("uses a unique secondary sort key", () => {
    for (const sort of ["newest", "popular", "price-asc", "price-desc", "name"] as const) {
      const order = catalogOrderBy(sort);
      assert.equal(order.some((item) => "id" in item), true);
    }
  });

  it("clamps an out-of-range page and handles an empty catalog", () => {
    assert.equal(catalogTotalPages(0, 24), 1);
    assert.equal(clampCatalogPage(5, 0, 24), 1);
    assert.equal(clampCatalogPage(9, 50, 24), 3);
    assert.equal(clampCatalogPage(2, 50, 24), 2);
  });

  it("keeps paginated canonicals distinct from page one", () => {
    const current = { category: "alati", take: "12" };
    assert.equal(catalogCanonicalPath({ current, page: 1 }), "/katalog?category=alati");
    assert.equal(catalogCanonicalPath({ current, page: 2 }), "/katalog?category=alati&page=2");
  });
});
