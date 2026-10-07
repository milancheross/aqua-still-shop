import { NextResponse } from "next/server";
import { getDbCategories } from "@/services/product-service";

export async function GET() {
  try {
    const categories = await getDbCategories();
    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Catalog categories API failed:", error);
    return NextResponse.json({ error: "Kategorije nisu dostupne." }, { status: 500 });
  }
}
