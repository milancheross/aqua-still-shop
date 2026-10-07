ALTER TABLE "categories"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");
