"use server";

import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

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

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating uploads dir:", e);
  }
}

export async function getMediaAssets(): Promise<MediaItem[]> {
  try {
    if (process.env.DATABASE_URL) {
      const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
      if (assets && assets.length > 0) {
        return assets.map((a: any) => ({
          id: a.id,
          filename: a.filename,
          url: a.url,
          mimeType: a.mimeType,
          size: a.size,
          altText: a.altText,
          folder: a.folder,
          createdAt: a.createdAt.toISOString(),
        }));
      }
    }
  } catch (error) {
    console.warn("DB media fetch fallback to filesystem:", error);
  }

  // Fallback to scanning public/uploads and public/images
  try {
    await ensureUploadsDir();
    const files = await fs.readdir(UPLOADS_DIR);
    const list: MediaItem[] = [];
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        list.push({
          id: file,
          filename: file,
          url: `/uploads/${file}`,
          mimeType: file.endsWith(".png") ? "image/png" : "image/jpeg",
          size: stat.size,
          altText: file,
          folder: "general",
          createdAt: stat.birthtime.toISOString(),
        });
      }
    }

    // Also include placeholder images from public root
    list.push(
      { id: "ph-tool", filename: "placeholder-tool.svg", url: "/placeholder-tool.svg", mimeType: "image/svg+xml", size: 1200, altText: "Tool", folder: "products", createdAt: new Date().toISOString() },
      { id: "ph-faucet", filename: "placeholder-faucet.svg", url: "/placeholder-faucet.svg", mimeType: "image/svg+xml", size: 1200, altText: "Faucet", folder: "products", createdAt: new Date().toISOString() },
      { id: "logo", filename: "aqua-still-logo.png", url: "/images/aqua-still-logo.png", mimeType: "image/png", size: 3400, altText: "Logo", folder: "logo", createdAt: new Date().toISOString() }
    );

    return list;
  } catch (e) {
    return [];
  }
}

export async function uploadMediaAction(formData: FormData) {
  const files = formData.getAll("files") as File[];
  const folder = (formData.get("folder") as string) || "general";

  if (!files || files.length === 0) {
    throw new Error("Niste izabrali nijednu datoteku za otpremanje.");
  }

  await ensureUploadsDir();
  const uploaded: MediaItem[] = [];

  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(`Nedozvoljen format fajla: ${file.name}. Dozvoljeni su JPG, PNG i WebP.`);
    }

    if (file.size > MAX_SIZE) {
      throw new Error(`Fajl ${file.name} je prevelik. Maksimalna veličina je 5MB.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${path.basename(file.name, ext)}-${uniqueSuffix}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    const altText = file.name.replace(/\.[^/.]+$/, "");

    let newAsset: any = null;
    try {
      if (process.env.DATABASE_URL) {
        newAsset = await db.mediaAsset.create({
          data: {
            filename,
            url,
            mimeType: file.type,
            size: file.size,
            altText,
            folder,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Could not save media asset to DB (table may not be migrated yet):", dbErr);
    }

    uploaded.push({
      id: newAsset?.id || uniqueSuffix,
      filename,
      url,
      mimeType: file.type,
      size: file.size,
      altText,
      folder,
      createdAt: newAsset?.createdAt ? newAsset.createdAt.toISOString() : new Date().toISOString(),
    });
  }

  return { success: true, uploaded };
}

export async function updateMediaAssetAction(id: string, data: { altText?: string; filename?: string }) {
  try {
    if (process.env.DATABASE_URL) {
      await db.mediaAsset.update({
        where: { id },
        data: {
          altText: data.altText,
          filename: data.filename,
        },
      });
      return { success: true };
    }
  } catch (e) {
    console.warn("DB update media error:", e);
  }
  return { success: true };
}

export async function deleteMediaAssetAction(id: string, url: string) {
  try {
    // Check if used in products (placeholder check)
    if (process.env.DATABASE_URL) {
      const productsUsingImage = await db.product.findFirst({
        where: {
          images: {
            has: url,
          },
        },
      });

      if (productsUsingImage) {
        throw new Error(`Brisanje nije dozvoljeno. Ova fotografija se koristi na proizvodu: "${productsUsingImage.name}".`);
      }

      await db.mediaAsset.delete({
        where: { id },
      }).catch(() => {});
    }

    // Delete file from uploads if it's in /uploads/
    if (url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", url);
      await fs.unlink(filePath).catch(() => {});
    }

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Neuspešno brisanje fotografije.");
  }
}
