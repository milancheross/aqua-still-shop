-- Store a content hash so the media library can reject duplicate uploads.
ALTER TABLE "media_assets" ADD COLUMN "checksum" TEXT;

CREATE UNIQUE INDEX "media_assets_checksum_key" ON "media_assets"("checksum");
