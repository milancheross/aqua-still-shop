"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- CATEGORIES ACTIONS ---
export async function getAdminCategories() {
  try {
    if (!process.env.DATABASE_URL) return [];
    return await db.category.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error("Error fetching admin categories:", e);
    return [];
  }
}

export async function createAdminCategory(data: { name: string; slug: string; description?: string; iconName?: string }) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Baza podataka nije povezana (nedostaje DATABASE_URL).");
  }

  if (!data.name || !data.slug) {
    throw new Error("Naziv i slug kategorije su obavezni.");
  }

  await db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      iconName: data.iconName || "wrench",
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/katalog");
  return { success: true };
}

export async function deleteAdminCategory(id: string) {
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/katalog");
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Brisanje kategorije nije uspelo.");
  }
}

// --- BRANDS ACTIONS ---
export async function getAdminBrands() {
  try {
    if (!process.env.DATABASE_URL) return [];
    return await db.brand.findMany({
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error("Error fetching admin brands:", e);
    return [];
  }
}

export async function createAdminBrand(data: { name: string; slug: string }) {
  if (!process.env.DATABASE_URL) {
    throw new Error("Baza podataka nije povezana (nedostaje DATABASE_URL).");
  }

  if (!data.name || !data.slug) {
    throw new Error("Naziv i slug brenda su obavezni.");
  }

  await db.brand.create({
    data: {
      name: data.name,
      slug: data.slug,
    },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/katalog");
  return { success: true };
}

export async function deleteAdminBrand(id: string) {
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    revalidatePath("/katalog");
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Brisanje brenda nije uspelo.");
  }
}

// --- ORDERS ACTIONS ---
export async function getAdminOrders() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const orders = await db.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((o: any) => ({
      ...o,
      subtotal: Number(o.subtotal),
      taxAmount: Number(o.taxAmount),
      shippingCost: Number(o.shippingCost),
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error("Error fetching admin orders:", e);
    return [];
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    throw new Error(e.message || "Ažuriranje statusa porudžbine nije uspelo.");
  }
}
