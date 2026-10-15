-- Phase 2.1: stock integrity schema only.
-- Adds release/idempotency columns and tightens stock movement checks.
-- Does not backfill stock quantities or change business logic.

ALTER TABLE "orders" ADD COLUMN "stock_released_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "idempotency_key" TEXT;
ALTER TABLE "orders" ADD COLUMN "request_hash" TEXT;

CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_quantity_check";
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_type_check";

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_type_check"
  CHECK ("type" IN (
    'receipt',
    'issue',
    'transfer',
    'stocktake',
    'admin_adjustment',
    'reservation_release'
  ));

-- Positive quantity for receipt, issue, transfer and reservation_release.
-- Signed non-zero quantity only for stocktake and admin_adjustment.
-- Zero is rejected for every type.
ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_quantity_check"
  CHECK (
    (
      "type" IN ('receipt', 'issue', 'transfer', 'reservation_release')
      AND "quantity" > 0
    )
    OR
    (
      "type" IN ('stocktake', 'admin_adjustment')
      AND "quantity" <> 0
    )
  );
