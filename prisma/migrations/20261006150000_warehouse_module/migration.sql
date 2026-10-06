-- Aqua Still warehouse module
CREATE TABLE "warehouse_locations" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "row_number" INTEGER NOT NULL,
  "column_number" INTEGER NOT NULL,
  "level_number" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "warehouse_locations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "warehouse_locations_code_key" ON "warehouse_locations"("code");
CREATE INDEX "warehouse_locations_row_number_column_number_level_number_idx"
  ON "warehouse_locations"("row_number", "column_number", "level_number");

ALTER TABLE "products" ADD COLUMN "warehouse_location_id" TEXT;

ALTER TABLE "warehouse_locations"
  ADD CONSTRAINT "warehouse_locations_code_format_check"
  CHECK ("code" ~ '^R[1-5]-K[0-9]{2}-S[1-3]$');

ALTER TABLE "products"
  ADD CONSTRAINT "products_warehouse_location_id_fkey"
  FOREIGN KEY ("warehouse_location_id") REFERENCES "warehouse_locations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "products_warehouse_location_id_idx" ON "products"("warehouse_location_id");

CREATE TABLE "stock_movements" (
  "id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "location_id" TEXT,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "stock_movements_quantity_check" CHECK ("quantity" > 0),
  CONSTRAINT "stock_movements_type_check" CHECK ("type" IN ('receipt', 'issue', 'transfer', 'stocktake'))
);

CREATE INDEX "stock_movements_product_id_created_at_idx"
  ON "stock_movements"("product_id", "created_at");
CREATE INDEX "stock_movements_location_id_created_at_idx"
  ON "stock_movements"("location_id", "created_at");

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_location_id_fkey"
  FOREIGN KEY ("location_id") REFERENCES "warehouse_locations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "warehouse_locations" ("id", "code", "row_number", "column_number", "level_number", "label")
SELECT
  'wh_' || r || '_' || c || '_' || s,
  'R' || r || '-K' || LPAD(c::text, 2, '0') || '-S' || s,
  r, c, s,
  'Red ' || r || ' · Polje ' || LPAD(c::text, 2, '0') || ' · Sprat ' || s
FROM generate_series(1, 5) AS r
CROSS JOIN generate_series(1, 10) AS c
CROSS JOIN generate_series(1, 3) AS s;
