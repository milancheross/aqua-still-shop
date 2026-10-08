import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logo = await db.mediaAsset.findFirst({
      where: { folder: "logo" },
      orderBy: { createdAt: "desc" },
      select: {
        url: true,
        altText: true,
      },
    });

    return NextResponse.json(
      logo ?? {
        url: "/images/aqua-still-logo.png",
        altText: "Aqua Still Zlatibor",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Site logo fetch failed:", error);

    return NextResponse.json(
      {
        url: "/images/aqua-still-logo.png",
        altText: "Aqua Still Zlatibor",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
