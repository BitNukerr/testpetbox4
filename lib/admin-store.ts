"use client";

import { adminCustomers, adminJournalPosts, adminOrders, adminStats, adminSubscriptions, type AdminCustomer, type AdminJournalPost, type AdminOrder, type AdminSubscription } from "@/data/admin";
import { plans, products, journalPosts, type Plan, type Product } from "@/data/products";

export type EditablePost = AdminJournalPost & {
  excerpt: string;
  body: string;
};

export type HomeSettings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  heroImage: string;
  statOneTitle: string;
  statOneText: string;
  statTwoTitle: string;
  statTwoText: string;
  statThreeTitle: string;
  statThreeText: string;
  plansEyebrow: string;
  plansTitle: string;
  productsEyebrow: string;
  productsTitle: string;
};

const KEYS = {
  products: "petbox-admin-products",
  plans: "petbox-admin-plans",
  posts: "petbox-admin-posts",
  orders: "petbox-admin-orders",
  customers: "petbox-admin-customers",
  subscriptions: "petbox-admin-subscriptions",
  home: "petbox-admin-home"
};

const defaultHomeSettings: HomeSettings = {
  eyebrow: "PetBox",
  title: "Caixas de subscricao para caes e gatos",
  subtitle: "Receba brinquedos, snacks e cuidados escolhidos para o perfil do seu animal.",
  primaryCta: "Criar caixa",
  primaryHref: "/configure",
  secondaryCta: "Loja",
  secondaryHref: "/shop",
  heroImage: "/images/hero-pets.svg",
  statOneTitle: "2 planos",
  statOneText: "Mensal + trimestral",
  statTwoTitle: "Caes + gatos",
  statTwoText: "Produtos por perfil",
  statThreeTitle: "MB WAY",
  statThreeText: "Pagamento por Easypay",
  plansEyebrow: "Planos",
  plansTitle: "Caixas mensais e trimestrais",
  productsEyebrow: "Extras",
  productsTitle: "Produtos para juntar a caixa"
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

function readObject<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return { ...fallback, ...(JSON.parse(localStorage.getItem(key) || "") || {}) };
  } catch {
    return fallback;
  }
}

function writeObject<T>(key: string, value: T) {
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
  stats: adminStats,
  home: defaultHomeSettings
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
  home: {
    get: () => readObject<HomeSettings>(KEYS.home, defaults.home),
    set: (settings: HomeSettings) => writeObject(KEYS.home, settings),
    reset: () => writeObject(KEYS.home, defaults.home)
  },
  resetAll() {
    adminStore.products.reset();
    adminStore.plans.reset();
    adminStore.posts.reset();
    adminStore.orders.reset();
    adminStore.customers.reset();
    adminStore.subscriptions.reset();
    adminStore.home.reset();
  }
};
