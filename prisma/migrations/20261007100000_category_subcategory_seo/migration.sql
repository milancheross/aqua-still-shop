ALTER TABLE "categories"
  ADD COLUMN IF NOT EXISTS "seo_title" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_description" TEXT;

ALTER TABLE "subcategories"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_title" TEXT,
  ADD COLUMN IF NOT EXISTS "seo_description" TEXT;
