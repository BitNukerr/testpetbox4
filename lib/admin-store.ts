"use client";

import { adminCustomers, adminJournalPosts, adminOrders, adminStats, adminSubscriptions, type AdminCustomer, type AdminJournalPost, type AdminOrder, type AdminSubscription } from "@/data/admin";
import { plans, products, journalPosts, type Plan, type Product } from "@/data/products";

export type EditablePost = AdminJournalPost & {
  excerpt: string;
  body: string;
};

const KEYS = {
  products: "petbox-admin-products",
  plans: "petbox-admin-plans",
  posts: "petbox-admin-posts",
  orders: "petbox-admin-orders",
  customers: "petbox-admin-customers",
  subscriptions: "petbox-admin-subscriptions"
};

const defaultPosts: EditablePost[] = adminJournalPosts.map((post) => {
  const publicPost = journalPosts.find((item) => item.slug === post.slug);
  return {
    ...post,
    excerpt: publicPost?.excerpt || "Resumo do artigo.",
    body: publicPost?.body || "Conteúdo do artigo."
  };
});

function read<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("petbox-admin-changed"));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const defaults = {
  products,
  plans,
  posts: defaultPosts,
  orders: adminOrders,
  customers: adminCustomers,
  subscriptions: adminSubscriptions,
  stats: adminStats
};

export const adminStore = {
  products: {
    get: () => read<Product>(KEYS.products, defaults.products),
    set: (items: Product[]) => write(KEYS.products, items),
    reset: () => write(KEYS.products, defaults.products)
  },
  plans: {
    get: () => read<Plan>(KEYS.plans, defaults.plans),
    set: (items: Plan[]) => write(KEYS.plans, items),
    reset: () => write(KEYS.plans, defaults.plans)
  },
  posts: {
    get: () => read<EditablePost>(KEYS.posts, defaults.posts),
    set: (items: EditablePost[]) => write(KEYS.posts, items),
    reset: () => write(KEYS.posts, defaults.posts)
  },
  orders: {
    get: () => read<AdminOrder>(KEYS.orders, defaults.orders),
    set: (items: AdminOrder[]) => write(KEYS.orders, items),
    reset: () => write(KEYS.orders, defaults.orders)
  },
  customers: {
    get: () => read<AdminCustomer>(KEYS.customers, defaults.customers),
    set: (items: AdminCustomer[]) => write(KEYS.customers, items),
    reset: () => write(KEYS.customers, defaults.customers)
  },
  subscriptions: {
    get: () => read<AdminSubscription>(KEYS.subscriptions, defaults.subscriptions),
    set: (items: AdminSubscription[]) => write(KEYS.subscriptions, items),
    reset: () => write(KEYS.subscriptions, defaults.subscriptions)
  },
  resetAll() {
    adminStore.products.reset();
    adminStore.plans.reset();
    adminStore.posts.reset();
    adminStore.orders.reset();
    adminStore.customers.reset();
    adminStore.subscriptions.reset();
  }
};
