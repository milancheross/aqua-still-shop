-- POS integration foundation: keep external identifiers without replacing Aqua Still's own SKU.
ALTER TABLE "products"
  ADD COLUMN "pos_source" TEXT,
  ADD COLUMN "pos_external_id" TEXT;

CREATE INDEX "products_pos_source_external_id_idx"
  ON "products" ("pos_source", "pos_external_id");
