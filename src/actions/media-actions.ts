"use server";

import { createHash } from "node:crypto";
import { del, put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
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

export interface UploadMediaResult {
  success: true;
  uploaded: MediaItem[];
  skipped: Array<{ filename: string; reason: "duplicate" }>;
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_COMPRESSED_SIZE = 3 * 1024 * 1024; // Leave headroom below Vercel's server-action request limit.

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

function getWebpFilename(value: string): string {
  const base = getSafeFilename(value).replace(/\.[^/.]+$/, "");
  return `${base || "image"}.webp`;
}

async function getChecksum(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return createHash("sha256").update(buffer).digest("hex");
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

export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
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
  const skipped: UploadMediaResult["skipped"] = [];

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(`Nedozvoljen format fajla: ${file.name}. Dozvoljeni su JPG, PNG i WebP.`);
    }

    if (file.size === 0 || file.size > MAX_COMPRESSED_SIZE) {
      throw new Error(
        `Fajl ${file.name} je prazan ili prevelik nakon kompresije. Maksimalna veličina je 3MB.`,
      );
    }

    const checksum = await getChecksum(file);
    const existing = await db.mediaAsset.findUnique({
      where: { checksum },
    });

    if (existing) {
      skipped.push({ filename: file.name, reason: "duplicate" });
      continue;
    }

    const filename = file.type === "image/webp" ? getWebpFilename(file.name) : getSafeFilename(file.name);
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
          checksum,
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
      // A concurrent identical upload can win the unique checksum constraint.
      // Never leave the Blob orphaned in that case.
      await del(blob.url).catch((deleteError: unknown) => {
        console.error("Failed to clean up uploaded Blob:", deleteError);
      });

      const duplicate = await db.mediaAsset.findUnique({ where: { checksum } });
      if (duplicate) {
        skipped.push({ filename: file.name, reason: "duplicate" });
        continue;
      }

      throw new Error(
        "Slika je otpremljena, ali nije sačuvana u bazi. Proverite bazu i pokušajte ponovo.",
      );
    }
  }

  return { success: true, uploaded, skipped };
}

export async function updateMediaAssetAction(
  id: string,
  data: { altText?: string; filename?: string; folder?: string },
) {
  await requireAdmin();

  const requestedFolder =
    data.folder !== undefined && /^[a-z0-9_-]{1,40}$/.test(data.folder)
      ? data.folder
      : data.folder !== undefined
        ? "general"
        : undefined;

  const activeSlotFolders = new Set(["logo", "hero", "hero-mobile"]);

  await db.$transaction(async (tx) => {
    // "Postavi kao ..." is a single active slot, not a normal library folder.
    // Demote the previous asset first so an older asset cannot remain active.
    if (requestedFolder && activeSlotFolders.has(requestedFolder)) {
      await tx.mediaAsset.updateMany({
        where: {
          folder: requestedFolder,
          id: { not: id },
        },
        data: { folder: "general" },
      });
    }

    await tx.mediaAsset.update({
      where: { id },
      data: {
        ...(data.altText !== undefined ? { altText: data.altText } : {}),
        ...(data.filename !== undefined ? { filename: getSafeFilename(data.filename) } : {}),
        ...(requestedFolder !== undefined ? { folder: requestedFolder } : {}),
      },
    });
  });

  // Media is rendered outside the admin route. Invalidate the public page
  // immediately after an active logo/hero slot changes.
  if (requestedFolder && activeSlotFolders.has(requestedFolder)) {
    revalidatePath("/");
  }

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
    throw new Error(
      `Brisanje nije dozvoljeno. Ova fotografija se koristi na proizvodu: "${productsUsingImage.name}".`,
    );
  }

  await del(asset.url);
  await db.mediaAsset.delete({ where: { id: asset.id } });
  return { success: true };
}
