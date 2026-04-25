"use client";

export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  type: "product" | "plan" | "custom-box";
  cadence?: "monthly" | "quarterly";
  species?: "dog" | "cat" | "both";
  metadata?: Record<string, string>;
};

export type SavedOrder = {
  id: string;
  title: string;
  total: number;
  date: string;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeSessionId?: string;
};

const CART_KEY = "petbox-cart";
const ORDERS_KEY = "petbox-orders";
const CUSTOMER_KEY = "petbox-customer";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("petbox-cart-changed"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  cart.push(item);
  setCart(cart);
}

export function getOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrder(order: SavedOrder) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("petbox-orders-changed"));
}

export function getCustomerId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CUSTOMER_KEY) || "";
}

export function setCustomerId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOMER_KEY, id);
  window.dispatchEvent(new Event("petbox-customer-changed"));
}
