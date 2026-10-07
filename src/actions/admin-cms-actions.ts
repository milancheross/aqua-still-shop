"use server";


import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { releaseExpiredStockReservations } from "@/lib/order-stock";
import { notifyOrderStatus } from "@/lib/order-notify";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

// --- CATEGORIES ACTIONS ---
export async function getAdminCategories() {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) return [];
    return await db.category.findMany({
      include: { subcategories: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch (e) {
    console.error("Error fetching admin categories:", e);
    return [];
  }
}

export async function createAdminCategory(data: { name: string; slug: string; description?: string; seoTitle?: string; seoDescription?: string; iconName?: string; imageUrl?: string | null; featured?: boolean; sortOrder?: number }) {
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
      description: data.description?.trim() || null,
      seoTitle: data.seoTitle?.trim() || null,
      seoDescription: data.seoDescription?.trim() || null,
      iconName: data.iconName || "wrench",
      imageUrl: data.imageUrl || null,
      featured: data.featured ?? false,
      sortOrder: Number.isFinite(data.sortOrder) ? Math.max(0, Math.trunc(data.sortOrder!)) : 0,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/katalog");
  revalidatePath("/");
  return { success: true };
}

export async function updateAdminCategory(id: string, data: { name: string; slug: string; description?: string; seoTitle?: string; seoDescription?: string; imageUrl?: string | null; featured?: boolean; sortOrder?: number }) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("Baza podataka nije povezana.");
  if (!data.name.trim() || !data.slug.trim()) throw new Error("Naziv i slug kategorije su obavezni.");
  await db.category.update({
    where: { id },
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || null,
      seoTitle: data.seoTitle?.trim() || null,
      seoDescription: data.seoDescription?.trim() || null,
      imageUrl: data.imageUrl || null,
      featured: data.featured ?? false,
      sortOrder: Number.isFinite(data.sortOrder) ? Math.max(0, Math.trunc(data.sortOrder!)) : 0,
    },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/katalog");
  revalidatePath(`/katalog/${data.slug}`);
  return { success: true };
}

export async function updateAdminSubcategory(
  id: string,
  data: { name: string; slug: string; description?: string; seoTitle?: string; seoDescription?: string; imageUrl?: string | null }
) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("Baza podataka nije povezana.");

  const name = data.name.trim();
  const slug = data.slug.trim();

  if (!name || !slug) {
    throw new Error("Naziv i slug podkategorije su obavezni.");
  }

  try {
    const updated = await db.subcategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: data.description?.trim() || null,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        imageUrl: data.imageUrl || null,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/katalog");
    revalidatePath("/katalog/" + slug);

    return { success: true, subcategory: updated };
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : "Izmena podkategorije nije uspela.");
  }
}

export async function updateAdminSubcategoryImage(id: string, imageUrl: string | null) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("Baza podataka nije povezana.");
  await db.subcategory.update({
    where: { id },
    data: { imageUrl: imageUrl || null },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/katalog");
  return { success: true };
}

export async function deleteAdminCategory(id: string) {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/");
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

export async function createAdminBrand(data: { name: string; slug: string; logoUrl?: string | null }) {
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
      logoUrl: data.logoUrl || null,
    },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/katalog");
  revalidatePath("/brendovi");
  revalidatePath("/");
  return { success: true };
}

export async function updateAdminBrand(id: string, data: { name: string; slug: string; logoUrl?: string | null }) {
  await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("Baza podataka nije povezana.");
  if (!data.name.trim() || !data.slug.trim()) throw new Error("Naziv i slug brenda su obavezni.");
  await db.brand.update({
    where: { id },
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      logoUrl: data.logoUrl || null,
    },
  });
  revalidatePath("/admin/brands");
  revalidatePath("/brendovi");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAdminBrand(id: string) {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
    await db.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    revalidatePath("/katalog");
    revalidatePath("/brendovi");
    revalidatePath("/");
    return { success: true };
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : "Brisanje brenda nije uspelo.");
  }
}

// --- ORDERS ACTIONS ---
function customerInfoWithoutToken(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const info = { ...(value as Record<string, unknown>) };
  delete info.confirmationToken;
  return info;
}

function serializeOrder(order: Prisma.OrderGetPayload<{ include: { orderItems: true } }>) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerInfo: customerInfoWithoutToken(order.customerInfo),
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    stockReservedUntil: order.stockReservedUntil?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      productName: item.productName,
      sku: item.sku,
      price: Number(item.price),
      quantity: item.quantity,
      total: Number(item.total),
    })),
  };
}

async function loadOrders() {
  try {
    await releaseExpiredStockReservations();
  } catch (releaseError) {
    console.error("Failed to release expired reservations:", releaseError);
  }
  const orders = await db.order.findMany({
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serializeOrder);
}

export async function getAdminOrders() {
  await requireAdmin();
  try {
    if (!process.env.DATABASE_URL) return [];
    return await loadOrders();
  } catch (e) {
    console.error("Error fetching admin orders:", e);
    return [];
  }
}

export async function getAdminOrderById(id: string) {
  await requireAdmin();
  if (!process.env.DATABASE_URL || !id) return null;
  try {
    await releaseExpiredStockReservations().catch((releaseError: unknown) => {
      console.error("Failed to release expired reservations:", releaseError);
    });
    const order = await db.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    return order ? serializeOrder(order) : null;
  } catch (e) {
    console.error("Error fetching admin order:", e);
    return null;
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
    const notice = await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { orderItems: true } });
      if (!order) throw new Error("Porudžbina nije pronađena.");
      const info = order.customerInfo as { shippingMethod?: string; email?: string; firstName?: string } | null;
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
      if (order.status === status) return null;
      await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          stockReservedUntil: status === "pending" ? order.stockReservedUntil : null,
        },
      });
      return {
        email: info?.email ?? "",
        firstName: info?.firstName ?? "",
        orderNumber: order.orderNumber,
        status,
      };
    });
    if (notice) await notifyOrderStatus(notice);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : "Ažuriranje statusa porudžbine nije uspelo.");
  }
}

function customerRecord(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return { ...(value as Record<string, unknown>) };
}

async function saveCustomerInfo(orderId: string, info: Record<string, unknown>) {
  await db.order.update({
    where: { id: orderId },
    data: { customerInfo: info as Prisma.InputJsonValue },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function setOrderPaidAction(orderId: string, paid: boolean) {
  await requireAdmin();
  if (!orderId || !process.env.DATABASE_URL) throw new Error("Porudžbina nije pronađena.");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Porudžbina nije pronađena.");
  const info = customerRecord(order.customerInfo);
  info.paid = paid;
  info.paidAt = paid ? new Date().toISOString() : null;
  await saveCustomerInfo(orderId, info);
  return { success: true };
}

export async function addOrderNoteAction(orderId: string, message: string) {
  await requireAdmin();
  const text = message.trim();
  if (!orderId || text.length < 2 || text.length > 1000) {
    throw new Error("Beleška mora imati između 2 i 1000 karaktera.");
  }
  if (!process.env.DATABASE_URL) throw new Error("Baza nije povezana.");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Porudžbina nije pronađena.");
  const info = customerRecord(order.customerInfo);
  const existing = Array.isArray(info.privateNotes) ? info.privateNotes : [];
  info.privateNotes = [
    ...existing,
    { id: crypto.randomUUID(), message: text, createdAt: new Date().toISOString() },
  ];
  await saveCustomerInfo(orderId, info);
  return { success: true };
}
