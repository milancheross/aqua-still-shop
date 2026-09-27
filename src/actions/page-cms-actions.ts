"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface PageInput {
  id?: string;
  title: string;
  slug: string;
  contentJson: any[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished?: boolean;
}

export async function getPages() {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) return [];
    const pages = await db.page.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return pages.map((p: any) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error("Error fetching pages:", e);
    return [];
  }
}

/**
 * Publicly readable page lookup. Drafts must never be returned by this action.
 */
export async function getPageBySlug(slug: string) {
  try {
    if (!process.env.DATABASE_URL) return null;
    const p = await db.page.findFirst({
      where: { slug, isPublished: true },
    });
    if (!p) return null;
    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  } catch (e) {
    console.error("Error fetching page by slug:", e);
    return null;
  }
}

/**
 * Returns only public slugs for Next.js static generation.
 * This is intentionally separate from getPages(), which is admin-only.
 */
export async function getPublishedPageSlugs() {
  try {
    if (!process.env.DATABASE_URL) return [];
    return await db.page.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
  } catch (e) {
    console.error("Error fetching published page slugs:", e);
    return [];
  }
}

export async function savePage(input: PageInput) {
  await requireAdmin();
  if (!input.title || !input.slug) {
    throw new Error("Naslov i slug stranice su obavezni.");
  }

  // Check unique slug if new or changing
  const existing = await db.page.findUnique({ where: { slug: input.slug } });
  if (existing && existing.id !== input.id) {
    throw new Error(`Stranica sa slug-om "${input.slug}" već postoji.`);
  }

  let page;
  if (input.id) {
    page = await db.page.update({
      where: { id: input.id },
      data: {
        title: input.title,
        slug: input.slug,
        contentJson: input.contentJson || [],
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        isPublished: input.isPublished ?? false,
      },
    });
  } else {
    page = await db.page.create({
      data: {
        title: input.title,
        slug: input.slug,
        contentJson: input.contentJson || [],
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        isPublished: input.isPublished ?? false,
      },
    });
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/${page.slug}`);
  return { success: true, pageId: page.id };
}

export async function deletePage(id: string) {
  await requireAdmin();
  try {
    await db.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (e) {
    throw new Error("Brisanje stranice nije uspelo.");
  }
}
