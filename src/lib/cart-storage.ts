import type { CartItem } from "@/types";

export const CART_STORAGE_KEY = "aquastill_cart";

export type CartStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as { product?: { id?: unknown }; quantity?: unknown };
  return typeof item.product?.id === "string" && typeof item.quantity === "number" && Number.isFinite(item.quantity) && item.quantity > 0;
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function getBrowserStorage(): CartStorage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readStoredCart(storage: CartStorage | null = getBrowserStorage()): CartItem[] {
  if (!storage) return [];
  return parseStoredCart(storage.getItem(CART_STORAGE_KEY));
}

function notifyCartListeners() {
  listeners.forEach((listener) => listener());
}

export function handleStorageEvent(event: { key: string | null }) {
  if (event.key === CART_STORAGE_KEY || event.key === null) notifyCartListeners();
}

export function writeStoredCart(items: CartItem[], storage: CartStorage | null = getBrowserStorage()) {
  if (!storage) return;
  storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartListeners();
}

export function updateStoredCart(updater: (items: CartItem[]) => CartItem[], storage: CartStorage | null = getBrowserStorage()) {
  const next = updater(readStoredCart(storage));
  writeStoredCart(next, storage);
  return next;
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  if (typeof window === "undefined") return () => listeners.delete(listener);
  const onStorage = (event: StorageEvent) => handleStorageEvent(event);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function cartSnapshot(storage: CartStorage | null = getBrowserStorage()) {
  return storage?.getItem(CART_STORAGE_KEY) ?? "[]";
}
