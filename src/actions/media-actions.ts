"use server";

import { del, put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  altText?: string | null;
  folder: string;
  createdAt: string;
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 4 * 1024 * 1024; // Keep below Vercel's server action request limit.

function getSafeFolder(value: FormDataEntryValue | null): string {
  const folder = typeof value === "string" ? value.trim().toLowerCase() : "general";
  return /^[a-z0-9_-]{1,40}$/.test(folder) ? folder : "general";
}

function getSafeFilename(value: string): string {
  const basename = value.split(/[\\/]/).pop() ?? "image";
  const cleaned = basename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return cleaned || "image";
}

export async function getMediaAssets(): Promise<MediaItem[]> {
  await requireAdmin();

  // Vercel's filesystem is ephemeral. The database is the source of truth;
  // uploaded files themselves live in Vercel Blob.
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return assets.map((asset) => ({
    id: asset.id,
    filename: asset.filename,
    url: asset.url,
    mimeType: asset.mimeType,
    size: asset.size,
    altText: asset.altText,
    folder: asset.folder,
    createdAt: asset.createdAt.toISOString(),
  }));
}

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Nije podešen Vercel Blob token (BLOB_READ_WRITE_TOKEN).");
  }

  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  const folder = getSafeFolder(formData.get("folder"));

  if (files.length === 0) {
    throw new Error("Niste izabrali nijednu datoteku za otpremanje.");
  }

  const uploaded: MediaItem[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`Nedozvoljen format fajla: ${file.name}. Dozvoljeni su JPG, PNG i WebP.`);
    }
    if (file.size === 0 || file.size > MAX_SIZE) {
      throw new Error(`Fajl ${file.name} je prazan ili prevelik. Maksimalna veličina je 4MB.`);
    }

    const filename = getSafeFilename(file.name);
    const blob = await put(`${folder}/${filename}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    try {
      const asset = await db.mediaAsset.create({
        data: {
          filename,
          url: blob.url,
          mimeType: file.type,
          size: file.size,
          altText: filename.replace(/\.[^/.]+$/, ""),
          folder,
        },
      });

      uploaded.push({
        id: asset.id,
        filename: asset.filename,
        url: asset.url,
        mimeType: asset.mimeType,
        size: asset.size,
        altText: asset.altText,
        folder: asset.folder,
        createdAt: asset.createdAt.toISOString(),
      });
    } catch (error) {
      // Avoid leaving an orphaned Blob if the database write fails.
      await del(blob.url).catch((deleteError: unknown) => {
        console.error("Failed to clean up uploaded Blob:", deleteError);
      });
      throw new Error("Slika je otpremljena, ali nije sačuvana u bazi. Proverite bazu i pokušajte ponovo.");
    }
  }

  return { success: true, uploaded };
}

export async function updateMediaAssetAction(id: string, data: { altText?: string; filename?: string; folder?: string }) {
  await requireAdmin();
  await db.mediaAsset.update({
    where: { id },
    data: {
      ...(data.altText !== undefined ? { altText: data.altText } : {}),
      ...(data.filename !== undefined ? { filename: getSafeFilename(data.filename) } : {}),
      ...(data.folder !== undefined ? { folder: /^[a-z0-9_-]{1,40}$/.test(data.folder) ? data.folder : "general" } : {}),
    },
  });
  return { success: true };
}

export async function deleteMediaAssetAction(id: string, url: string) {
  await requireAdmin();

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset || asset.url !== url) {
    throw new Error("Fotografija nije pronađena.");
  }

  const productsUsingImage = await db.product.findFirst({
    where: { images: { has: asset.url } },
    select: { name: true },
  });

  if (productsUsingImage) {
    throw new Error(`Brisanje nije dozvoljeno. Ova fotografija se koristi na proizvodu: "${productsUsingImage.name}".`);
  }

  await del(asset.url);
  await db.mediaAsset.delete({ where: { id: asset.id } });
  return { success: true };
}
