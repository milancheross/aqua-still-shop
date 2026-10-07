"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { HOME_SLUG, parseHomeContent, type HomeContent } from "@/lib/home-content";

export interface PageInput {
  id?: string;
  title: string;
  slug: string;
  contentJson: Prisma.InputJsonValue;
  seoTitle?: string;
  seoDescription?: string;
  isPublished?: boolean;
}

export async function getPageById(id: string) {
  await requireAdmin();
  if (!id || !process.env.DATABASE_URL) return null;
  try {
    const page = await db.page.findUnique({ where: { id } });
    if (!page) return null;
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      contentJson: page.contentJson,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      isPublished: page.isPublished,
    };
  } catch (e) {
    console.error("Error fetching page by id:", e);
    return null;
  }
}

export async function getPages() {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) return [];
    const pages = await db.page.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return pages.map((p) => ({
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
      where: { isPublished: true, slug: { not: HOME_SLUG } },
      select: { slug: true },
    });
  } catch (e) {
    console.error("Error fetching published page slugs:", e);
    return [];
  }
}

export async function getHomeContent() {
  try {
    if (!process.env.DATABASE_URL) return null;
    const page = await db.page.findFirst({ where: { slug: HOME_SLUG, isPublished: true } });
    return page ? parseHomeContent(page.contentJson) : null;
  } catch (error) {
    console.error("Error fetching home content:", error);
    return null;
  }
}

export async function getHomePageForAdmin() {
  await requireAdmin();
  if (!process.env.DATABASE_URL) return null;
  try {
    const page = await db.page.findUnique({ where: { slug: HOME_SLUG } });
    if (!page) return null;
    return {
      content: parseHomeContent(page.contentJson),
      isPublished: page.isPublished,
    };
  } catch (error) {
    console.error("Error fetching homepage for editor:", error);
    return null;
  }
}

export async function saveHomePage(input: HomeContent & { isPublished: boolean }) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
  const content = parseHomeContent({ kind: "home", ...input });
  if (!content.title.trim() || !content.description.trim()) {
    throw new Error("Naslov i opis početne stranice su obavezni.");
  }
  for (const href of [content.primaryHref, content.secondaryHref]) {
    if (!href.startsWith("/") && !href.startsWith("https://")) {
      throw new Error("Link dugmeta mora početi sa / ili https://");
    }
  }
  const data = {
    title: "Početna",
    slug: HOME_SLUG,
    contentJson: { kind: "home" as const, ...content },
    seoTitle: content.seoTitle || null,
    seoDescription: content.seoDescription || null,
    isPublished: input.isPublished,
  };
  try {
    await db.page.upsert({
      where: { slug: HOME_SLUG },
      update: data,
      create: data,
    });
  } catch (error) {
    console.error("Error saving homepage:", error);
    return {
      success: false,
      error: "Početna stranica nije sačuvana. Proverite vezu sa bazom i pokušajte ponovo.",
    };
  }

  // The public homepage must be invalidated, but the editor does not need
  // a forced server refresh after a successful save.
  revalidatePath("/");
  revalidatePath("/admin/pages");
  return { success: true };
}

export async function savePage(input: PageInput) {
  await requireAdmin();
  if (!input.title || !input.slug) {
    throw new Error("Naslov i slug stranice su obavezni.");
  }
  if (input.slug === HOME_SLUG) {
    throw new Error("Početna stranica se uređuje posebno, preko izbora Početna stranica.");
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
  revalidatePath("/admin/editor");
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
