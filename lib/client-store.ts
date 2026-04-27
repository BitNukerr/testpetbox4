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

export function getPets() {
  return readArray<AccountPet>(PETS_KEY);
}

export function setPets(pets: AccountPet[]) {
  writeValue(PETS_KEY, pets);
}

export function getAddress(): AccountAddress {
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
      ...(JSON.parse(localStorage.getItem(ADDRESS_KEY) || "{}") || {})
    };
  } catch {
    return { name: "", phone: "", mbwayPhone: "", address: "", city: "", zip: "", nif: "" };
  }
}

export function setAddress(address: AccountAddress) {
  writeValue(ADDRESS_KEY, address);
}

export function getSubscription(): AccountSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSubscription(subscription: AccountSubscription | null) {
  writeValue(SUBSCRIPTION_KEY, subscription);
}
