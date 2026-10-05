"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, Cart } from "@/types";
import { validateAndGetProduct } from "@/actions/cart-actions";

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 5000;
const DEFAULT_SHIPPING_COST = 500;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("aquastill_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Greška pri učitavanju korpe:", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("aquastill_cart", JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : DEFAULT_SHIPPING_COST;
  const taxAmount = items.reduce((sum, item) => {
    const lineTotal = (item.product.salePrice ?? item.product.price) * item.quantity;
    const vatRate = typeof item.product.vatRate === "number" && item.product.vatRate >= 0 ? item.product.vatRate : 0.2;
    return sum + lineTotal * (vatRate / (1 + vatRate));
  }, 0);

  const cart: Cart = {
    items,
    subtotal,
    taxAmount,
    shippingCost,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    total: subtotal + shippingCost,
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (quantity <= 0) return;

    try {
      // Server-side validation of product, stock, and authoritative price
      const validated = await validateAndGetProduct(product.id, quantity);
      const verifiedProduct = validated.product;

      setItems((prev) => {
        const existingItem = prev.find((item) => item.product.id === verifiedProduct.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const targetQty = currentQty + quantity;

        if (targetQty > verifiedProduct.stockQuantity) {
          alert(`Maksimalna raspoloživa količina na stanju za "${verifiedProduct.name}" je ${verifiedProduct.stockQuantity} ${verifiedProduct.unit}.`);
          return prev;
        }

        if (existingItem) {
          return prev.map((item) =>
            item.product.id === verifiedProduct.id
              ? { ...item, product: verifiedProduct, quantity: targetQty }
              : item
          );
        }
        return [...prev, { product: verifiedProduct, quantity }];
      });
      setIsCartOpen(true);
    } catch (error: any) {
      console.error("Greška pri dodavanju u korpu (server validation):", error);
      alert(error.message || "Došlo je do greške pri proveri artikla na serveru.");
    }
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const validated = await validateAndGetProduct(productId, quantity);
      const verifiedProduct = validated.product;

      if (quantity > verifiedProduct.stockQuantity) {
        alert(`Maksimalna raspoloživa količina na stanju je ${verifiedProduct.stockQuantity} ${verifiedProduct.unit}.`);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, product: verifiedProduct, quantity } : item
        )
      );
    } catch (error: any) {
      console.error("Greška pri ažuriranju količine (server validation):", error);
      alert(error.message || "Došlo je do greške pri proveri zaliha.");
    }
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart mora se koristiti unutar CartProvider-a");
  }
  return context;
}
