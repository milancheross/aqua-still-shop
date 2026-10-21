"use server";

import { requireAdminOrEditor } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { HOME_SLUG, parseHomeContent, type HomeContent } from "@/lib/home-content";
import { normalizeBlocks, type CanvasBlock } from "@/lib/page-blocks";
import { STANDARD_CMS_PAGES } from "@/lib/cms-pages";

export interface PageInput {
  id?: string;
  title: string;
  slug: string;
  contentJson: Prisma.InputJsonValue;
  seoTitle?: string;
  seoDescription?: string;
  isPublished?: boolean;
}

export interface EditorPageOption {
  id: string;
  title: string;
  slug: string;
  isStandard?: boolean;
}

export interface AdminPageListItem {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
  isSystem: boolean;
  editUrl: string;
  viewUrl: string;
}

export interface EditorPageData {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  blocks: CanvasBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
}

/**
 * Vraća objedinjenu listu svih stranica sajta za tabelu u Upravljanju stranicama (/admin/pages).
 */
export async function getAllAdminPages(): Promise<AdminPageListItem[]> {
  await requireAdminOrEditor();
  const dbPages = await getPages();

  const list: AdminPageListItem[] = [];
  const handledSlugs = new Set<string>();

  // 1. Početna stranica
  const homeInDb = dbPages.find((p) => p.slug === HOME_SLUG);
  list.push({
    id: homeInDb ? homeInDb.id : "home",
    title: "Početna stranica",
    slug: HOME_SLUG,
    isPublished: homeInDb ? homeInDb.isPublished : true,
    updatedAt: homeInDb ? homeInDb.updatedAt : new Date().toISOString(),
    isSystem: true,
    editUrl: "/admin/editor?home=1",
    viewUrl: "/",
  });
  handledSlugs.add(HOME_SLUG);

  // 2. Standardne sistemske stranice
  for (const std of STANDARD_CMS_PAGES) {
    const existing = dbPages.find((p) => p.slug === std.slug);
    list.push({
      id: existing ? existing.id : `std-${std.slug}`,
      title: existing ? existing.title : std.title,
      slug: std.slug,
      isPublished: existing ? existing.isPublished : true,
      updatedAt: existing ? existing.updatedAt : new Date().toISOString(),
      isSystem: true,
      editUrl: `/admin/editor?slug=${std.slug}`,
      viewUrl: `/${std.slug}`,
    });
    handledSlugs.add(std.slug);
  }

  // 3. Korisničke stranice kreirane kroz CMS
  for (const p of dbPages) {
    if (!handledSlugs.has(p.slug)) {
      list.push({
        id: p.id,
        title: p.title,
        slug: p.slug,
        isPublished: p.isPublished,
        updatedAt: p.updatedAt,
        isSystem: false,
        editUrl: `/admin/editor?id=${p.id}`,
        viewUrl: `/${p.slug}`,
      });
      handledSlugs.add(p.slug);
    }
  }

  return list;
}

/**
 * Vraća objedinjenu listu svih stranica dostupnih za izbor u padajućem meniju editora.
 */
export async function getEditorPageOptions(): Promise<EditorPageOption[]> {
  await requireAdminOrEditor();
  const dbPages = await getPages();

  const options: EditorPageOption[] = [];
  const handledSlugs = new Set<string>([HOME_SLUG]);

  // Prvo dodajemo standardne stranice sajta
  for (const std of STANDARD_CMS_PAGES) {
    const existing = dbPages.find((p) => p.slug === std.slug);
    options.push({
      id: existing ? existing.id : `std-${std.slug}`,
      title: existing ? existing.title : std.title,
      slug: std.slug,
      isStandard: true,
    });
    handledSlugs.add(std.slug);
  }

  // Zatim dodajemo ostale korisničke stranice iz baze
  for (const p of dbPages) {
    if (!handledSlugs.has(p.slug)) {
      options.push({
        id: p.id,
        title: p.title,
        slug: p.slug,
        isStandard: false,
      });
      handledSlugs.add(p.slug);
    }
  }

  return options;
}

/**
 * Dinamičko preuzimanje kompletnih podataka stranice iz baze za popunjavanje polja u editoru.
 */
export async function getPageForEditor(slugOrId: string): Promise<EditorPageData | null> {
  await requireAdminOrEditor();
  if (!slugOrId) return null;

  try {
    // 1. Pokušaj pretrage po ID-u ili slug-u u bazi
    let page = null;
    if (process.env.DATABASE_URL) {
      page = await db.page.findFirst({
        where: {
          OR: [{ id: slugOrId }, { slug: slugOrId }],
        },
      });
    }

    if (page) {
      const blocks = normalizeBlocks(page.contentJson);
      // Pronalazimo prvu sliku iz blokova sadržaja ako postoji
      const firstImageBlock = blocks.find((b) => b.type === "image" && b.props?.content);
      const firstTextBlock = blocks.find((b) => b.type === "text" && b.props?.content);

      return {
        id: page.id,
        title: page.title,
        slug: page.slug,
        description: page.seoDescription || firstTextBlock?.props?.content || "",
        image: firstImageBlock?.props?.content || "",
        blocks: blocks.length > 0 ? blocks : generateDefaultBlocks(page.title, page.seoDescription || "", ""),
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        isPublished: page.isPublished,
      };
    }

    // 2. Ako stranica još uvek nije upisana u bazu, a pripada standardnim stranicama
    const standard = STANDARD_CMS_PAGES.find(
      (s) => s.slug === slugOrId || `std-${s.slug}` === slugOrId
    );

    if (standard) {
      const defaultBlocks = generateDefaultBlocks(
        standard.title,
        standard.defaultDescription,
        standard.defaultImage
      );

      return {
        id: "",
        title: standard.title,
        slug: standard.slug,
        description: standard.defaultDescription,
        image: standard.defaultImage,
        blocks: defaultBlocks,
        seoTitle: standard.title,
        seoDescription: standard.defaultDescription,
        isPublished: true,
      };
    }

    return null;
  } catch (error) {
    console.error("Greška pri dohvatanju stranice za editor:", error);
    return null;
  }
}

function generateDefaultBlocks(title: string, description: string, imageUrl: string): CanvasBlock[] {
  const blocks: CanvasBlock[] = [
    {
      id: `block-${Date.now()}-1`,
      type: "heading",
      props: { content: title, level: "h1", align: "left" },
      styles: { color: "#0f172a", padding: "py-4", margin: "my-2" },
    },
  ];

  if (description) {
    blocks.push({
      id: `block-${Date.now()}-2`,
      type: "text",
      props: { content: description, align: "left" },
      styles: { color: "#475569", padding: "py-2", margin: "my-0" },
    });
  }

  if (imageUrl) {
    blocks.push({
      id: `block-${Date.now()}-3`,
      type: "image",
      props: { content: imageUrl, alt: title },
      styles: { padding: "py-4", margin: "my-2" },
    });
  }

  return blocks;
}

export async function getPageById(id: string) {
  await requireAdminOrEditor();
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
  await requireAdminOrEditor();
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
  await requireAdminOrEditor();
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
  await requireAdminOrEditor();
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
    contentJson: { kind: "home" as const, ...content } as unknown as Prisma.InputJsonValue,
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
    const message = error instanceof Error ? error.message : "Nepoznata greška baze.";
    return {
      success: false,
      error: `Početna stranica nije sačuvana: ${message}`,
    };
  }

  // The public homepage must be invalidated, but the editor does not need
  // a forced server refresh after a successful save.
  revalidatePath("/");
  revalidatePath("/admin/pages");
  return { success: true };
}

export async function savePage(input: PageInput) {
  await requireAdminOrEditor();
  if (!input.title || !input.slug) {
    throw new Error("Naslov i slug stranice su obavezni.");
  }
  if (input.slug === HOME_SLUG) {
    throw new Error("Početna stranica se uređuje posebno, preko izbora Početna stranica.");
  }

  // Provera jedinstvenosti adrese (slug-a)
  const existing = await db.page.findUnique({ where: { slug: input.slug } });
  if (existing && input.id && existing.id !== input.id) {
    throw new Error(`Stranica sa slug-om "${input.slug}" već postoji.`);
  }

  const targetId = input.id || existing?.id;
  let page;
  if (targetId) {
    page = await db.page.update({
      where: { id: targetId },
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
  await requireAdminOrEditor();
  if (id.startsWith("std-") || id === "home") {
    throw new Error("Sistemske stranice se ne mogu brisati.");
  }
  const page = await db.page.findUnique({ where: { id } });
  if (page && (page.slug === HOME_SLUG || STANDARD_CMS_PAGES.some((s) => s.slug === page.slug))) {
    throw new Error("Sistemske stranice se ne mogu brisati.");
  }
  try {
    await db.page.delete({ where: { id } });
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (e) {
    throw new Error("Brisanje stranice nije uspelo.");
  }
}
