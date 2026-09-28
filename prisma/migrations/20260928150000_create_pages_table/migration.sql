-- Create the CMS pages table used by the public [slug] route and admin page editor.
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_json" JSONB NOT NULL DEFAULT '[]',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");
