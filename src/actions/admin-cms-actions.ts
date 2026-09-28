"use server";


import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- CATEGORIES ACTIONS ---
export async function getAdminCategories() {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/katalog");
    return { success: true };
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : "Brisanje kategorije nije uspelo.");
  }
}

// --- BRANDS ACTIONS ---
export async function getAdminBrands() {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    revalidatePath("/katalog");
    return { success: true };
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : "Brisanje brenda nije uspelo.");
  }
}

// --- ORDERS ACTIONS ---
export async function getAdminOrders() {
  await requireAdmin();
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
  await requireAdmin();
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "ready_for_pickup", "picked_up", "cancelled"];
  if (typeof orderId !== "string" || !orderId || !allowedStatuses.includes(status)) {
    throw new Error("Neispravan status porudžbine.");
  }
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
      if (!order) throw new Error("Porudžbina nije pronađena.");
      const info = order.customerInfo as { shippingMethod?: string } | null;
      if (status === "shipped" && info?.shippingMethod === "store_pickup") {
        throw new Error("Porudžbina za preuzimanje u radnji ne može biti označena kao poslata.");
      }
      if ((status === "ready_for_pickup" || status === "picked_up") && info?.shippingMethod !== "store_pickup") {
        throw new Error("Ovaj status je dozvoljen samo za preuzimanje u radnji.");
      }
      if (order.status === "cancelled" && status !== "cancelled") {
        throw new Error("Otkazana porudžbina ne može ponovo da se aktivira.");
      }
      if (status === "cancelled" && ["shipped", "delivered", "picked_up"].includes(order.status)) {
        throw new Error("Porudžbina koja je već poslata ili preuzeta ne može se otkazati iz administracije.");
      }
      if (status === "cancelled" && order.status !== "cancelled") {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity }, inStock: true },
          });
        }
      }
      await tx.order.update({ where: { id: orderId }, data: { status } });
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : "Ažuriranje statusa porudžbine nije uspelo.");
  }
}
