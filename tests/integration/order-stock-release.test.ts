import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  claimProcessingTransition,
  releaseExpiredStockReservations,
  releaseOrderStock,
} from "../../src/lib/order-stock";

const databaseUrl = process.env.STOCK_TEST_DATABASE_URL;
const hasDb = Boolean(databaseUrl);

function client() {
  return new PrismaClient({ datasourceUrl: databaseUrl });
}

async function seedFixture(db: PrismaClient, suffix: string, stock = 5) {
  const categoryId = `cat_${suffix}`;
  const productId = `prod_${suffix}`;
  const orderId = `ord_${suffix}`;
  await db.category.create({
    data: { id: categoryId, name: `Cat ${suffix}`, slug: `cat-${suffix}`, iconName: "wrench" },
  });
  await db.product.create({
    data: {
      id: productId,
      sku: `SKU-${suffix}`,
      name: `Product ${suffix}`,
      slug: `product-${suffix}`,
      brand: "Test",
      categorySlug: `cat-${suffix}`,
      categoryName: `Cat ${suffix}`,
      price: 100,
      stockQuantity: stock,
      inStock: true,
      updatedAt: new Date(),
    },
  });
  await db.order.create({
    data: {
      id: orderId,
      orderNumber: `AS-${suffix}`,
      status: "pending",
      customerInfo: { email: "a@b.c", firstName: "A" },
      items: [],
      subtotal: 100,
      taxAmount: 0,
      shippingCost: 0,
      total: 100,
      stockReservedUntil: new Date(Date.now() - 60_000),
      orderItems: {
        create: {
          productId,
          productName: `Product ${suffix}`,
          sku: `SKU-${suffix}`,
          price: 100,
          quantity: 2,
          total: 200,
        },
      },
    },
  });
  return { categoryId, productId, orderId };
}

async function cleanup(db: PrismaClient, suffix: string) {
  await db.stockMovement.deleteMany({ where: { productId: `prod_${suffix}` } });
  await db.orderItem.deleteMany({ where: { orderId: `ord_${suffix}` } });
  await db.order.deleteMany({ where: { id: `ord_${suffix}` } });
  await db.product.deleteMany({ where: { id: `prod_${suffix}` } });
  await db.category.deleteMany({ where: { id: `cat_${suffix}` } });
}

describe("order stock release", { skip: hasDb ? false : "STOCK_TEST_DATABASE_URL is not set" }, () => {
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

  it("does not release a historical cancelled order with stockReleasedAt NULL", async () => {
    const suffix = `hist_${Date.now()}`;
    const fx = await seedFixture(a, suffix, 4);
    await a.order.update({
      where: { id: fx.orderId },
      data: { status: "cancelled", stockReleasedAt: null, stockReservedUntil: null },
    });
    const result = await a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "cancel"));
    const order = await a.order.findUniqueOrThrow({ where: { id: fx.orderId } });
    const product = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    const movements = await a.stockMovement.count({ where: { productId: fx.productId, type: "reservation_release" } });
    assert.equal(result.released, false);
    assert.equal(order.status, "cancelled");
    assert.equal(order.stockReleasedAt, null);
    assert.equal(product.stockQuantity, 4);
    assert.equal(movements, 0);
    await cleanup(a, suffix);
  });

  it("double cancel releases stock once", async () => {
    const suffix = `dc_${Date.now()}`;
    const fx = await seedFixture(a, suffix, 5);
    const [first, second] = await Promise.all([
      a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "cancel")),
      b.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "cancel")),
    ]);
    const wins = [first.released, second.released].filter(Boolean).length;
    const order = await a.order.findUniqueOrThrow({ where: { id: fx.orderId } });
    const product = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    const movements = await a.stockMovement.count({ where: { productId: fx.productId, type: "reservation_release" } });
    assert.equal(wins, 1);
    assert.equal(order.status, "cancelled");
    assert.ok(order.stockReleasedAt);
    assert.equal(product.stockQuantity, 7);
    assert.equal(movements, 1);
    await cleanup(a, suffix);
  });

  it("double expiry releases stock once and does not touch processing", async () => {
    const suffix = `de_${Date.now()}`;
    const fx = await seedFixture(a, suffix, 5);
    const [first, second] = await Promise.all([
      a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "expiry")),
      b.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "expiry")),
    ]);
    assert.equal([first.released, second.released].filter(Boolean).length, 1);
    const product = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    assert.equal(product.stockQuantity, 7);
    await a.order.update({ where: { id: fx.orderId }, data: { status: "processing", stockReleasedAt: null } });
    const processing = await a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "expiry"));
    const after = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    assert.equal(processing.released, false);
    assert.equal(after.stockQuantity, 7);
    await cleanup(a, suffix);
  });

  it("cancel versus expiry returns stock exactly once", async () => {
    const suffix = `ce_${Date.now()}`;
    const fx = await seedFixture(a, suffix, 3);
    const [cancel, expiry] = await Promise.all([
      a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "cancel")),
      b.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "expiry")),
    ]);
    assert.equal([cancel.released, expiry.released].filter(Boolean).length, 1);
    const order = await a.order.findUniqueOrThrow({ where: { id: fx.orderId } });
    const product = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    const movements = await a.stockMovement.count({ where: { productId: fx.productId, type: "reservation_release" } });
    assert.equal(order.status, "cancelled");
    assert.equal(product.stockQuantity, 5);
    assert.equal(movements, 1);
    await cleanup(a, suffix);
  });

  it("expiry versus pending to processing lets only one win", async () => {
    const suffix = `ep_${Date.now()}`;
    const fx = await seedFixture(a, suffix, 6);
    const [expired, processing] = await Promise.all([
      a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "expiry")),
      b.$transaction((tx) => claimProcessingTransition(tx, fx.orderId)),
    ]);
    const order = await a.order.findUniqueOrThrow({ where: { id: fx.orderId } });
    const product = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    const movements = await a.stockMovement.count({ where: { productId: fx.productId, type: "reservation_release" } });
    if (processing && !expired.released) {
      assert.equal(order.status, "processing");
      assert.equal(order.stockReleasedAt, null);
      assert.equal(product.stockQuantity, 6);
      assert.equal(movements, 0);
    } else if (expired.released && !processing) {
      assert.equal(order.status, "cancelled");
      assert.ok(order.stockReleasedAt);
      assert.equal(product.stockQuantity, 8);
      assert.equal(movements, 1);
    } else {
      assert.fail(`invalid outcome released=${expired.released} processing=${processing} status=${order.status} stock=${product.stockQuantity}`);
    }
    await cleanup(a, suffix);
  });

  it("rolls back the claim when StockMovement insert fails", async () => {
    const suffix = `rb_${Date.now()}`;
    const fx = await seedFixture(a, suffix, 9);
    await a.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION fail_reservation_release() RETURNS trigger AS $$
      BEGIN
        IF NEW.type = 'reservation_release' THEN
          RAISE EXCEPTION 'forced movement failure';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await a.$executeRawUnsafe(`
      CREATE TRIGGER fail_reservation_release_trg
      BEFORE INSERT ON stock_movements
      FOR EACH ROW EXECUTE FUNCTION fail_reservation_release();
    `);
    await assert.rejects(
      () => a.$transaction((tx) => releaseOrderStock(tx, fx.orderId, "cancel")),
      /forced movement failure|Stavka porudžbine/,
    );
    const order = await a.order.findUniqueOrThrow({ where: { id: fx.orderId } });
    const product = await a.product.findUniqueOrThrow({ where: { id: fx.productId } });
    const movements = await a.stockMovement.count({ where: { productId: fx.productId } });
    assert.equal(order.status, "pending");
    assert.equal(order.stockReleasedAt, null);
    assert.equal(product.stockQuantity, 9);
    assert.equal(movements, 0);
    await a.$executeRawUnsafe("DROP TRIGGER IF EXISTS fail_reservation_release_trg ON stock_movements");
    await a.$executeRawUnsafe("DROP FUNCTION IF EXISTS fail_reservation_release()");
    await cleanup(a, suffix);
  });

  it("releaseExpiredStockReservations ignores processing and historical cancelled", async () => {
    const suffix = `fn_${Date.now()}`;
    const pending = await seedFixture(a, `${suffix}_p`, 2);
    const processing = await seedFixture(a, `${suffix}_r`, 2);
    const historical = await seedFixture(a, `${suffix}_h`, 2);
    await a.order.update({ where: { id: processing.orderId }, data: { status: "processing" } });
    await a.order.update({
      where: { id: historical.orderId },
      data: { status: "cancelled", stockReleasedAt: null, stockReservedUntil: null },
    });
    const released = await releaseExpiredStockReservations();
    assert.ok(released >= 1);
    const pendingOrder = await a.order.findUniqueOrThrow({ where: { id: pending.orderId } });
    const processingOrder = await a.order.findUniqueOrThrow({ where: { id: processing.orderId } });
    const historicalOrder = await a.order.findUniqueOrThrow({ where: { id: historical.orderId } });
    const processingProduct = await a.product.findUniqueOrThrow({ where: { id: processing.productId } });
    const historicalProduct = await a.product.findUniqueOrThrow({ where: { id: historical.productId } });
    assert.equal(pendingOrder.status, "cancelled");
    assert.ok(pendingOrder.stockReleasedAt);
    assert.equal(processingOrder.status, "processing");
    assert.equal(processingProduct.stockQuantity, 2);
    assert.equal(historicalOrder.status, "cancelled");
    assert.equal(historicalOrder.stockReleasedAt, null);
    assert.equal(historicalProduct.stockQuantity, 2);
    await cleanup(a, `${suffix}_p`);
    await cleanup(a, `${suffix}_r`);
    await cleanup(a, `${suffix}_h`);
  });
});
