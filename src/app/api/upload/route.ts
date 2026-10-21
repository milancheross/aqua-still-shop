import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { getCurrentStaffUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * API ruta za globalni upload i automatsku optimizaciju slika u WebP format pre slanja na Vercel Blob.
 */
export async function POST(request: NextRequest) {
  try {
    // Provera administratorskog ili uredničkog pristupa
    const user = await getCurrentStaffUser();
    if (!user || !["admin", "editor"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Niste autorizovani za otpremanje slika." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = (formData.get("file") as File | null) || (formData.get("image") as File | null);

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "Nije izabrana nijedna datoteka za otpremanje." },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Čišćenje naziva fajla (samo bezbedni karakteri)
    const rawName = file.name.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, "") ?? "slika";
    const safeName =
      rawName
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[-.]+|[-.]+$/g, "")
        .toLowerCase() || "slika";

    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    let processedBuffer: Buffer;
    let finalContentType = "image/webp";
    let finalFilename = `${safeName}-${Date.now()}.webp`;

    if (isSvg) {
      // Vektorski SVG fajlovi se čuvaju u originalnom formatu
      processedBuffer = inputBuffer;
      finalContentType = "image/svg+xml";
      finalFilename = `${safeName}-${Date.now()}.svg`;
    } else {
      // Svaka rasterska slika se automatski optimizuje i konvertuje u WebP
      try {
        processedBuffer = await sharp(inputBuffer)
          .rotate() // Automatska korekcija rotacije na osnovu EXIF podataka
          .resize({
            width: 2560,
            height: 2560,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();
      } catch (sharpError) {
        console.error("Greška pri obradi slike pomoću sharp biblioteke:", sharpError);
        return NextResponse.json(
          { success: false, error: "Format slike nije podržan ili je datoteka oštećena." },
          { status: 400 }
        );
      }
    }

    let fileUrl = "";

    // Provera da li je podešen Vercel Blob token
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${finalFilename}`, processedBuffer, {
        access: "public",
        contentType: finalContentType,
        addRandomSuffix: true,
      });
      fileUrl = blob.url;
    } else {
      // Razvojni lokalni fallback kada Vercel Blob token nije konfigurisan u lokalnom okruženju
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, finalFilename), processedBuffer);
      fileUrl = `/uploads/${finalFilename}`;
    }

    // Opciono beleženje u tabelu medijskih resursa ukoliko je baza dostupna
    if (process.env.DATABASE_URL) {
      try {
        const checksum = createHash("sha256").update(processedBuffer).digest("hex");
        await db.mediaAsset.create({
          data: {
            filename: finalFilename,
            url: fileUrl,
            mimeType: finalContentType,
            size: processedBuffer.length,
            checksum,
            altText: safeName,
            folder: "editor",
          },
        });
      } catch {
        // Ignorišemo greške u bazi u slučaju duplikata jer je slika već uspešno sačuvana
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: finalFilename,
      size: processedBuffer.length,
    });
  } catch (error) {
    console.error("Neočekivana greška u /api/upload ruti:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Došlo je do greške prilikom otpremanja slike.",
      },
      { status: 500 }
    );
  }
}

