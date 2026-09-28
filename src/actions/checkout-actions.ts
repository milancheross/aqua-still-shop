"use server";

import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CheckoutInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  items: { productId: string; quantity: number }[];
}

const FREE_SHIPPING_THRESHOLD = 5000;
const DEFAULT_SHIPPING_COST = 500;
const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 1000;

function requiredText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

export async function createOrderAction(input: CheckoutInput) {
  if (!input || typeof input !== "object") throw new Error("Neispravni podaci porudžbine.");

  const firstName = typeof input.firstName === "string" ? input.firstName.trim() : "";
  const lastName = typeof input.lastName === "string" ? input.lastName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const shippingMethod = input.shippingMethod ?? "courier";
  const paymentMethod = input.paymentMethod ?? "cash_on_delivery";
  const isStorePickup = shippingMethod === "store_pickup";

  if (!requiredText(firstName, 100) || !requiredText(lastName, 100) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      !requiredText(phone, 40)) {
    throw new Error("Molimo unesite ispravno ime, prezime, email i telefon.");
  }
  if (shippingMethod !== "courier" && shippingMethod !== "store_pickup") {
    throw new Error("Izabran je nevažeći način isporuke.");
  }
  if (paymentMethod !== "cash_on_delivery") {
    throw new Error("Izabran je nevažeći način plaćanja.");
  }

  const street = typeof input.street === "string" ? input.street.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";
  const postalCode = typeof input.postalCode === "string" ? input.postalCode.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim().slice(0, 1000) : "";
  if (!isStorePickup && (!requiredText(street, 200) || !requiredText(city, 100) || !requiredText(postalCode, 20))) {
    throw new Error("Molimo unesite ulicu, grad i poštanski broj za dostavu.");
  }

  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > MAX_ITEMS) {
    throw new Error("Vaša korpa je prazna ili sadrži previše stavki.");
  }

  const quantities = new Map<string, number>();
  for (const item of input.items) {
    if (!item || typeof item.productId !== "string" || !item.productId.trim() ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
      throw new Error("Korpa sadrži neispravnu količinu proizvoda.");
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  for (const quantity of quantities.values()) {
    if (quantity > MAX_QUANTITY_PER_ITEM) throw new Error("Tražena količina je prevelika.");
  }

  if (!process.env.DATABASE_URL) throw new Error("Baza podataka nije povezana.");

  const orderNumber = `AS-${Date.now().toString().slice(-8)}-${randomBytes(4).toString("hex").toUpperCase()}`;
  const confirmationToken = randomBytes(32).toString("hex");

  try {
    const order = await db.$transaction(async (tx) => {
      const verifiedOrderItems: {
        productId: string; productName: string; sku: string; price: number; quantity: number; total: number;
      }[] = [];
      let subtotal = 0;
      let taxAmount = 0;

      for (const [productId, quantity] of quantities) {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product || !product.inStock || product.stockQuantity < quantity) {
          throw new Error("Jedan od proizvoda više nije dostupan u traženoj količini. Osvežite korpu.");
        }
        const price = Number(product.salePrice ?? product.price);
        const vatRate = Number(product.vatRate);
        if (!Number.isFinite(price) || price < 0 || !Number.isFinite(vatRate) || vatRate < 0) {
          throw new Error("Cena proizvoda nije ispravna.");
        }
        const lineTotal = Math.round(price * quantity * 100) / 100;
        subtotal += lineTotal;
        taxAmount += lineTotal * (vatRate / (1 + vatRate));
        verifiedOrderItems.push({
          productId, productName: product.name, sku: product.sku, price, quantity, total: lineTotal,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;
      taxAmount = Math.round(taxAmount * 100) / 100;
      const shippingCost = isStorePickup || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
      const total = Math.round((subtotal + shippingCost) * 100) / 100;

      // Conditional updates make stock reservation atomic; any failed item rolls back the whole transaction.
      for (const item of verifiedOrderItems) {
        const reserved = await tx.product.updateMany({
          where: { id: item.productId, inStock: true, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (reserved.count !== 1) {
          throw new Error(`Nema dovoljno zaliha za proizvod: ${item.productName}.`);
        }
      }

      const customerInfo = {
        firstName, lastName, email, phone,
        street: isStorePickup ? "Lično preuzimanje u radnji" : street,
        city: isStorePickup ? "Zlatibor" : city,
        postalCode: isStorePickup ? "31315" : postalCode,
        notes,
        shippingMethod,
        paymentMethod,
        pickupNotice: isStorePickup ? "Preuzimanje narednog dana u Aqua Still Zlatibor salonu, nakon potvrde da je porudžbina spremna." : undefined,
        confirmationToken,
      };
      const rawItemsSummary = verifiedOrderItems.map((item) => ({
        id: item.productId, name: item.productName, sku: item.sku,
        price: item.price, quantity: item.quantity, total: item.total,
      }));

      return tx.order.create({
        data: {
          orderNumber, status: "pending", customerInfo, items: rawItemsSummary,
          subtotal, taxAmount, shippingCost, total,
          orderItems: { create: verifiedOrderItems },
        },
      });
    });

    revalidatePath("/admin/orders");
    return {
      success: true,
      orderNumber: order.orderNumber,
      confirmationToken,
      orderId: order.id,
      total: Number(order.total),
    };
  } catch (error: unknown) {
    console.error("Greška prilikom kreiranja porudžbine:", error);
    throw new Error(error instanceof Error ? error.message : "Neuspešno kreiranje porudžbine. Molimo pokušajte ponovo.");
  }
}
