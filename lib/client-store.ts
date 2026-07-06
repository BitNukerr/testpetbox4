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
  species?: string;
  metadata?: Record<string, string>;
  config?: Record<string, string>;
};

export type SavedOrder = {
  id: string;
  title: string;
  total: number;
  date: string;
  status: string;
  easypayCheckoutId?: string;
  easypayPaymentId?: string;
  paymentMethod?: string;
};

export type AccountPet = {
  id: string;
  name: string;
  species: "dog" | "cat";
  size: "small" | "medium" | "large";
  birthday: string;
  allergies: string;
  preferences: string;
};

export type AccountAddress = {
  name: string;
  phone: string;
  mbwayPhone: string;
  address: string;
  city: string;
  zip: string;
  nif: string;
};

export type AccountSubscription = {
  id: string;
  status: "active" | "paused" | "cancelled";
  plan: string;
  cadence: "monthly" | "quarterly";
  petId: string;
  nextBoxDate: string;
  renewalDate: string;
  price: number;
  extras: string;
};

const CART_KEY = "petbox-cart";
const ORDERS_KEY = "petbox-orders";
const PETS_KEY = "petbox-account-pets";
const ADDRESS_KEY = "petbox-account-address";
const SUBSCRIPTION_KEY = "petbox-account-subscription";
const SELECTED_PET_BOX_KEY = "petbox-selected-pet-box";

function scopedKey(key: string, scope?: string) {
  return scope ? `${key}:${scope}` : key;
}

function cartMergeKey(item: CartItem) {
  if (item.type === "custom-box") return `custom-box:${item.id}`;
  return `${item.type}:${item.slug}:${item.cadence || ""}`;
}

function normalizeCart(items: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of items) {
    const quantity = Math.max(0, Number(item.quantity || 0));
    if (!quantity) continue;

    const key = cartMergeKey(item);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, { ...existing, quantity: existing.quantity + quantity });
    } else {
      merged.set(key, { ...item, quantity });
    }
  }

  return Array.from(merged.values());
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? normalizeCart(parsed) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(items)));
  window.dispatchEvent(new Event("petbox-cart-changed"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existingIndex = cart.findIndex((cartItem) => {
    if (item.type === "custom-box" || cartItem.type === "custom-box") return false;
    return cartItem.type === item.type && cartItem.slug === item.slug && cartItem.cadence === item.cadence;
  });

  if (existingIndex >= 0) {
    const nextCart = cart.map((cartItem, index) => index === existingIndex ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem);
    setCart(nextCart);
    return;
  }

  setCart([...cart, item]);
}

export function getOrders(scope?: string): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(scopedKey(ORDERS_KEY, scope)) || "[]");
  } catch {
    return [];
  }
}

export function saveOrder(order: SavedOrder, scope?: string) {
  const orders = getOrders(scope);
  const next = [order, ...orders.filter((item) => item.id !== order.id)];
  localStorage.setItem(scopedKey(ORDERS_KEY, scope), JSON.stringify(next));
  window.dispatchEvent(new Event("petbox-orders-changed"));
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("petbox-account-changed"));
}

export function getPets(scope?: string) {
  return readArray<AccountPet>(scopedKey(PETS_KEY, scope));
}

export function setPets(pets: AccountPet[], scope?: string) {
  writeValue(scopedKey(PETS_KEY, scope), pets);
}

export function getSelectedPetForBox(): AccountPet | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SELECTED_PET_BOX_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSelectedPetForBox(pet: AccountPet) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SELECTED_PET_BOX_KEY, JSON.stringify(pet));
  window.dispatchEvent(new Event("petbox-selected-pet-changed"));
}

export function clearSelectedPetForBox() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SELECTED_PET_BOX_KEY);
  window.dispatchEvent(new Event("petbox-selected-pet-changed"));
}

export function getAddress(scope?: string): AccountAddress {
  if (typeof window === "undefined") {
    return { name: "", phone: "", mbwayPhone: "", address: "", city: "", zip: "", nif: "" };
  }
  try {
    return {
      name: "",
      phone: "",
      mbwayPhone: "",
      address: "",
      city: "",
      zip: "",
      nif: "",
      ...(JSON.parse(localStorage.getItem(scopedKey(ADDRESS_KEY, scope)) || "{}") || {})
    };
  } catch {
    return { name: "", phone: "", mbwayPhone: "", address: "", city: "", zip: "", nif: "" };
  }
}

export function setAddress(address: AccountAddress, scope?: string) {
  writeValue(scopedKey(ADDRESS_KEY, scope), address);
}

export function getSubscription(scope?: string): AccountSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(scopedKey(SUBSCRIPTION_KEY, scope)) || "null");
  } catch {
    return null;
  }
}

export function setSubscription(subscription: AccountSubscription | null, scope?: string) {
  writeValue(scopedKey(SUBSCRIPTION_KEY, scope), subscription);
}
