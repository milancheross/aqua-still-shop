import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CartItem } from "../../src/types";
import { CART_STORAGE_KEY, handleStorageEvent, parseStoredCart, readStoredCart, subscribeCart, updateStoredCart, writeStoredCart } from "../../src/lib/cart-storage";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}

function item(id: string, quantity: number): CartItem {
  return {
    product: {
      id,
      sku: id,
      barcode: "",
      name: id,
      slug: id,
      brand: "Aqua",
      categorySlug: "alati",
      categoryName: "Alati",
      price: 100,
      vatRate: 0.2,
      unit: "kom",
      inStock: true,
      stockQuantity: 10,
      wmsLocation: "",
      shortDescription: "",
      description: "",
      images: [],
      attributes: {},
    },
    quantity,
  };
}

describe("cart storage hydration", () => {
  it("loads a saved cart and does not overwrite it with the empty initial state", () => {
    const storage = memoryStorage();
    writeStoredCart([item("saved", 2)], storage);

    const beforeUiState = readStoredCart(storage);
    assert.equal(beforeUiState.length, 1);
    assert.equal(beforeUiState[0]?.product.id, "saved");
    assert.equal(storage.getItem(CART_STORAGE_KEY)?.includes("saved"), true);

    const afterPrematureEmptyRender = readStoredCart(storage);
    assert.equal(afterPrematureEmptyRender.length, 1);
  });

  it("adds to the stored cart instead of replacing it with an empty in-memory cart", () => {
    const storage = memoryStorage();
    writeStoredCart([item("saved", 1)], storage);

    const next = updateStoredCart((current) => [...current, item("new", 1)], storage);
    assert.deepEqual(next.map((entry) => entry.product.id), ["saved", "new"]);
    assert.equal(readStoredCart(storage).length, 2);
  });

  it("notifies same-tab subscribers and other tabs through the storage event", () => {
    const storage = memoryStorage();
    let sameTab = 0;
    let otherTab = 0;
    const unsubscribe = subscribeCart(() => { sameTab += 1; });
    writeStoredCart([item("saved", 1)], storage);
    assert.equal(sameTab, 1);
    handleStorageEvent({ key: CART_STORAGE_KEY });
    assert.equal(sameTab, 2);
    handleStorageEvent({ key: "other" });
    assert.equal(sameTab, 2);
    unsubscribe();
    const other = subscribeCart(() => { otherTab += 1; });
    handleStorageEvent({ key: null });
    assert.equal(otherTab, 1);
    other();
  });

  it("rejects malformed storage without throwing", () => {
    assert.deepEqual(parseStoredCart("not-json"), []);
    assert.deepEqual(parseStoredCart(JSON.stringify({ bad: true })), []);
    assert.deepEqual(parseStoredCart(JSON.stringify([{ quantity: 1 }])), []);
  });
});
