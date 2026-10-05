ALTER TABLE "orders" ADD COLUMN "stock_reserved_until" TIMESTAMP(3);

CREATE TABLE "rate_limit_events" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rate_limit_events_bucket_created_at_idx" ON "rate_limit_events"("bucket", "created_at");
