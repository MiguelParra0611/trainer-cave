import type { CartItem } from "@/types/domain";

const STORAGE_KEY = "trainer-cave:cart";
const CART_CHANGED_EVENT = "trainer-cave:cart-changed";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(productId: string, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  writeCart(items);
}

export function updateQuantity(productId: string, quantity: number) {
  const items = readCart();
  if (quantity <= 0) {
    writeCart(items.filter((item) => item.productId !== productId));
    return;
  }
  const existing = items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity = quantity;
    writeCart(items);
  }
}

export function removeFromCart(productId: string) {
  writeCart(readCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  writeCart([]);
}

/** Re-fires the callback on any cart change, including changes from other tabs. Returns an unsubscribe function. */
export function subscribeToCart(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener(CART_CHANGED_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
