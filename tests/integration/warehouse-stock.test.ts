import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";
import { applyIssue, applyReceipt, applyStocktake, WarehouseStockError } from "../../src/lib/warehouse-stock";

const databaseUrl = process.env.STOCK_TEST_DATABASE_URL;
const hasDb = Boolean(databaseUrl);

function client() {
  return new PrismaClient({ datasourceUrl: databaseUrl });
}

async function seed(db: PrismaClient, suffix: string, stock: number) {
  await db.category.create({
    data: { id: `cat_${suffix}`, name: `Cat ${suffix}`, slug: `cat-${suffix}`, iconName: "wrench" },
  });
  await db.product.create({
    data: {
      id: `prod_${suffix}`,
      sku: `SKU-${suffix}`,
      name: `Product ${suffix}`,
      slug: `product-${suffix}`,
      brand: "Test",
      categorySlug: `cat-${suffix}`,
      categoryName: `Cat ${suffix}`,
      price: 100,
      stockQuantity: stock,
      inStock: stock > 0,
      updatedAt: new Date(),
    },
  });
  return `prod_${suffix}`;
}

async function cleanup(db: PrismaClient, suffix: string) {
  await db.stockMovement.deleteMany({ where: { productId: `prod_${suffix}` } });
  await db.product.deleteMany({ where: { id: `prod_${suffix}` } });
  await db.category.deleteMany({ where: { id: `cat_${suffix}` } });
}

describe("warehouse stock", { skip: hasDb ? false : "STOCK_TEST_DATABASE_URL is not set" }, () => {
  const a = client();
  const b = client();

  before(async () => {
    await a.$connect();
    await b.$connect();
  });
  after(async () => {
    await a.$disconnect();
    await b.$disconnect();
  });

  it("adds concurrent receipts without a lost update", async () => {
    const suffix = `rc_${Date.now()}`;
    const productId = await seed(a, suffix, 10);
    await Promise.all([
      a.$transaction((tx) => applyReceipt(tx, { productId, quantity: 3 })),
      b.$transaction((tx) => applyReceipt(tx, { productId, quantity: 4 })),
    ]);
    const product = await a.product.findUniqueOrThrow({ where: { id: productId } });
    const movements = await a.stockMovement.count({ where: { productId, type: "receipt" } });
    assert.equal(product.stockQuantity, 17);
    assert.equal(movements, 2);
    await cleanup(a, suffix);
  });

  it("lets at most one issue succeed when stock cannot cover both", async () => {
    const suffix = `is_${Date.now()}`;
    const productId = await seed(a, suffix, 5);
    const results = await Promise.allSettled([
      a.$transaction((tx) => applyIssue(tx, { productId, quantity: 4 })),
      b.$transaction((tx) => applyIssue(tx, { productId, quantity: 4 })),
    ]);
    const fulfilled = results.filter((result) => result.status === "fulfilled").length;
    const product = await a.product.findUniqueOrThrow({ where: { id: productId } });
    const movements = await a.stockMovement.count({ where: { productId, type: "issue" } });
    assert.equal(fulfilled, 1);
    assert.equal(product.stockQuantity, 1);
    assert.ok(product.stockQuantity >= 0);
    assert.equal(movements, 1);
    await cleanup(a, suffix);
  });

  it("combines concurrent receipt and issue", async () => {
    const suffix = `ri_${Date.now()}`;
    const productId = await seed(a, suffix, 10);
    await Promise.all([
      a.$transaction((tx) => applyReceipt(tx, { productId, quantity: 5 })),
      b.$transaction((tx) => applyIssue(tx, { productId, quantity: 3 })),
    ]);
    const product = await a.product.findUniqueOrThrow({ where: { id: productId } });
    assert.equal(product.stockQuantity, 12);
    await cleanup(a, suffix);
  });

  it("rejects a stale stocktake without overwriting a concurrent receipt", async () => {
    const suffix = `st_${Date.now()}`;
    const productId = await seed(a, suffix, 8);
    const [receipt, stocktake] = await Promise.allSettled([
      a.$transaction((tx) => applyReceipt(tx, { productId, quantity: 2 })),
      b.$transaction((tx) => applyStocktake(tx, { productId, expectedQuantity: 8, countedQuantity: 9 })),
    ]);
    const product = await a.product.findUniqueOrThrow({ where: { id: productId } });
    const movements = await a.stockMovement.findMany({ where: { productId } });
    assert.equal(receipt.status, "fulfilled");
    assert.equal(movements.filter((movement) => movement.type === "receipt").length, 1);
    if (stocktake.status === "fulfilled") {
      assert.equal(product.stockQuantity, 11);
      assert.equal(movements.filter((movement) => movement.type === "stocktake").length, 1);
    } else {
      assert.equal(product.stockQuantity, 10);
      assert.equal(movements.filter((movement) => movement.type === "stocktake").length, 0);
    }
    await cleanup(a, suffix);
  });

  it("does not write a movement when stocktake delta is zero", async () => {
    const suffix = `dz_${Date.now()}`;
    const productId = await seed(a, suffix, 6);
    const result = await a.$transaction((tx) => applyStocktake(tx, { productId, expectedQuantity: 6, countedQuantity: 6 }));
    const movements = await a.stockMovement.count({ where: { productId } });
    const product = await a.product.findUniqueOrThrow({ where: { id: productId } });
    assert.equal(result.changed, false);
    assert.equal(movements, 0);
    assert.equal(product.stockQuantity, 6);
    await cleanup(a, suffix);
  });

  it("rolls back the stock change when the movement insert fails", async () => {
    const suffix = `rb_${Date.now()}`;
    const productId = await seed(a, suffix, 4);
    await a.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION fail_warehouse_movement() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'forced movement failure';
      END;
      $$ LANGUAGE plpgsql;
    `);
    await a.$executeRawUnsafe(`
      CREATE TRIGGER fail_warehouse_movement_trg
      BEFORE INSERT ON stock_movements
      FOR EACH ROW EXECUTE FUNCTION fail_warehouse_movement();
    `);
    await assert.rejects(
      () => a.$transaction((tx) => applyReceipt(tx, { productId, quantity: 3 })),
      /forced movement failure/,
    );
    const product = await a.product.findUniqueOrThrow({ where: { id: productId } });
    assert.equal(product.stockQuantity, 4);
    await a.$executeRawUnsafe("DROP TRIGGER IF EXISTS fail_warehouse_movement_trg ON stock_movements");
    await a.$executeRawUnsafe("DROP FUNCTION IF EXISTS fail_warehouse_movement()");
    await cleanup(a, suffix);
  });

  it("rejects invalid quantities", async () => {
    await assert.rejects(() => applyReceipt({} as never, { productId: "x", quantity: Number.NaN }), WarehouseStockError);
    await assert.rejects(() => applyIssue({} as never, { productId: "x", quantity: -1 }), WarehouseStockError);
    await assert.rejects(() => applyStocktake({} as never, { productId: "x", expectedQuantity: 1, countedQuantity: -1 }), WarehouseStockError);
  });
});
