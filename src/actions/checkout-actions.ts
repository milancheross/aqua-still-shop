"use server";

import { db } from "@/lib/db";
import { validateAndGetProduct } from "@/actions/cart-actions";

export interface CheckoutInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  notes?: string;
  paymentMethod?: string;
  shippingMethod?: string; // "courier" | "store_pickup"
  items: { productId: string; quantity: number }[];
}

export async function createOrderAction(input: CheckoutInput) {
  // 1. Basic validation
  if (!input.firstName || !input.lastName || !input.email || !input.phone || !input.postalCode) {
    throw new Error("Molimo popunite sva obavezna polja za kontakt.");
  }

  if (input.shippingMethod !== "store_pickup" && (!input.street || !input.city)) {
    throw new Error("Molimo unesite ulicu i grad za dostavu na adresu.");
  }

  if (!input.items || input.items.length === 0) {
    throw new Error("Vaša korpa je prazna.");
  }

  // 2. Server-side validation of items, prices, and stock
  let subtotal = 0;
  let taxAmount = 0;
  const verifiedOrderItems: {
    productId: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
  }[] = [];

  const rawItemsSummary: any[] = [];

  for (const cartItem of input.items) {
    if (cartItem.quantity <= 0) {
      throw new Error("Količina proizvoda mora biti veća od nule.");
    }

    const validated = await validateAndGetProduct(cartItem.productId, cartItem.quantity);
    const product = validated.product;
    const unitPrice = validated.unitPrice;
    const lineTotal = unitPrice * cartItem.quantity;

    subtotal += lineTotal;
    taxAmount += lineTotal * (validated.vatRate / (1 + validated.vatRate));

    verifiedOrderItems.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      price: unitPrice,
      quantity: cartItem.quantity,
      total: lineTotal,
    });

    rawItemsSummary.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: unitPrice,
      quantity: cartItem.quantity,
      total: lineTotal,
    });
  }

  const FREE_SHIPPING_THRESHOLD = 5000;
  const DEFAULT_SHIPPING_COST = 500;
  
  // Shipping calculation: if store_pickup, shipping is 0. If courier, standard rules apply.
  const isStorePickup = input.shippingMethod === "store_pickup";
  const shippingCost = isStorePickup ? 0 : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST);
  const total = subtotal + shippingCost;

  const orderNumber = `AS-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const customerInfo = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    street: isStorePickup ? "Lično preuzimanje u radnji" : input.street,
    city: isStorePickup ? "Zlatibor" : input.city,
    postalCode: isStorePickup ? "31315" : input.postalCode,
    notes: input.notes ?? "",
    shippingMethod: isStorePickup ? "store_pickup" : "courier",
    paymentMethod: input.paymentMethod ?? "cash_on_delivery",
    pickupNotice: isStorePickup ? "Spremno za preuzimanje narednog dana u Aqua Still Zlatibor izložbenom salonu." : undefined,
  };

  // 3. Prisma Transaction for atomic order creation and stock decrement
  try {
    const order = await db.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          status: "pending",
          customerInfo,
          items: rawItemsSummary,
          subtotal,
          taxAmount,
          shippingCost,
          total,
          orderItems: {
            create: verifiedOrderItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Decrement stock for each product
      for (const item of verifiedOrderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: Number(order.total),
    };
  } catch (error: any) {
    console.error("Greška prilikom kreiranja porudžbine u bazi:", error);
    throw new Error(error.message || "Neuspešno kreiranje porudžbine. Molimo pokušajte ponovo.");
  }
}
