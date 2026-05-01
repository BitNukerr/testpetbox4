"use client";

import { adminCustomers, adminJournalPosts, adminOrders, adminStats, adminSubscriptions, type AdminCustomer, type AdminJournalPost, type AdminOrder, type AdminSubscription } from "@/data/admin";
import { plans, products, journalPosts, type Plan, type Product } from "@/data/products";
import { defaultLegalSettings, mergeLegalSettings, type LegalSettings } from "@/lib/legal-content";

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
  showcaseLeadTitle: string;
  showcaseLeadText: string;
  showcaseLeadHref: string;
  showcaseLeadImages: string;
  showcasePromoLabel: string;
  showcasePromoTitle: string;
  showcasePromoText: string;
  showcasePromoCta: string;
  showcasePromoHref: string;
  showcasePromoImage: string;
  showcaseTileOneLabel: string;
  showcaseTileOneTitle: string;
  showcaseTileOneText: string;
  showcaseTileOneCta: string;
  showcaseTileOneHref: string;
  showcaseTileOneImage: string;
  showcaseTileTwoLabel: string;
  showcaseTileTwoTitle: string;
  showcaseTileTwoText: string;
  showcaseTileTwoCta: string;
  showcaseTileTwoHref: string;
  showcaseTileTwoImage: string;
  showcaseTileThreeLabel: string;
  showcaseTileThreeTitle: string;
  showcaseTileThreeText: string;
  showcaseTileThreeCta: string;
  showcaseTileThreeHref: string;
  showcaseTileThreeImage: string;
  showcaseTileFourLabel: string;
  showcaseTileFourTitle: string;
  showcaseTileFourText: string;
  showcaseTileFourCta: string;
  showcaseTileFourHref: string;
  showcaseTileFourImage: string;
  infoLabel: string;
  infoTitle: string;
  infoText: string;
  infoStepOneTitle: string;
  infoStepOneText: string;
  infoStepTwoTitle: string;
  infoStepTwoText: string;
  infoStepThreeTitle: string;
  infoStepThreeText: string;
};

export type ConfigOption = {
  id: string;
  label: string;
  description: string;
  price: number;
  image?: string;
};

export type ConfiguratorSettings = {
  animalTitle: string;
  animalText: string;
  sizeTitle: string;
  sizeText: string;
  ageTitle: string;
  ageText: string;
  planTitle: string;
  planText: string;
  personalityTitle: string;
  personalityText: string;
  extrasTitle: string;
  extrasText: string;
  animals: ConfigOption[];
  sizes: ConfigOption[];
  ages: ConfigOption[];
  personalities: ConfigOption[];
  extras: ConfigOption[];
};

export type StoreSettings = {
  storeName: string;
  email: string;
  note: string;
  shippingPrice: number;
};

const KEYS = {
  products: "petbox-admin-products",
  plans: "petbox-admin-plans",
  posts: "petbox-admin-posts",
  orders: "petbox-admin-orders",
  customers: "petbox-admin-customers",
  subscriptions: "petbox-admin-subscriptions",
  home: "petbox-admin-home",
  configurator: "petbox-admin-configurator",
  settings: "petbox-admin-settings",
  legal: "petbox-admin-legal"
};

const defaultHomeSettings: HomeSettings = {
  eyebrow: "PetBox",
  title: "Caixas misterio para caes e gatos",
  subtitle: "Receba brinquedos, snacks e cuidados surpresa escolhidos para o perfil do seu animal.",
  primaryCta: "Criar caixa",
  primaryHref: "/criar-caixa",
  secondaryCta: "Loja",
  secondaryHref: "/loja",
  heroImage: "/images/hero-pets.svg",
  statOneTitle: "2 planos",
  statOneText: "Mensal + trimestral",
  statTwoTitle: "Caes + gatos",
  statTwoText: "Produtos por perfil",
  statThreeTitle: "MB WAY",
  statThreeText: "Pagamento por Easypay",
  plansEyebrow: "Planos",
  plansTitle: "Caixas misterio mensais e trimestrais",
  productsEyebrow: "Extras",
  productsTitle: "Produtos para juntar a caixa",
  showcaseLeadTitle: "Caixas misterio PetBox",
  showcaseLeadText: "Uma experiencia surpresa com produtos escolhidos para caes e gatos felizes.",
  showcaseLeadHref: "/criar-caixa",
  showcaseLeadImages: "/images/dog-treats.svg\n/images/cat-toy.svg\n/images/paw-balm.svg\n/images/rope-toy.svg\n/images/cat-treats.svg",
  showcasePromoLabel: "Novo",
  showcasePromoTitle: "Caixa misterio para o seu melhor amigo",
  showcasePromoText: "Snacks, brinquedos e cuidados numa caixa preparada com carinho.",
  showcasePromoCta: "Criar caixa",
  showcasePromoHref: "/criar-caixa",
  showcasePromoImage: "/images/hero-pets.svg",
  showcaseTileOneLabel: "Subscricao",
  showcaseTileOneTitle: "Misterio todos os meses",
  showcaseTileOneText: "Receba uma caixa nova com produtos escolhidos por perfil.",
  showcaseTileOneCta: "Criar caixa",
  showcaseTileOneHref: "/criar-caixa",
  showcaseTileOneImage: "/images/dog-box.svg",
  showcaseTileTwoLabel: "Loja",
  showcaseTileTwoTitle: "Brinquedos, snacks e cuidado",
  showcaseTileTwoText: "Escolha produtos avulsos ou junte extras a sua caixa.",
  showcaseTileTwoCta: "Ver loja",
  showcaseTileTwoHref: "/loja",
  showcaseTileTwoImage: "/images/cat-box.svg",
  showcaseTileThreeLabel: "PetBox",
  showcaseTileThreeTitle: "Feito para animais felizes",
  showcaseTileThreeText: "Uma experiencia simples, segura e com entregas em Portugal.",
  showcaseTileThreeCta: "Saber mais",
  showcaseTileThreeHref: "/sobre",
  showcaseTileThreeImage: "/dog-paw.png",
  showcaseTileFourLabel: "Blog",
  showcaseTileFourTitle: "Guias e novidades para cuidar melhor",
  showcaseTileFourText: "Leia ideias sobre snacks, brinquedos, rotinas e caixas misterio.",
  showcaseTileFourCta: "Ler blog",
  showcaseTileFourHref: "/blog",
  showcaseTileFourImage: "/images/about-pets.svg",
  infoLabel: "Como funciona",
  infoTitle: "Uma caixa pensada para o seu animal, sem complicar.",
  infoText: "A PetBox ajuda donos de caes e gatos a receber produtos uteis, divertidos e escolhidos com criterio, sem ter de procurar tudo separadamente.",
  infoStepOneTitle: "1. Crie o perfil",
  infoStepOneText: "Escolha animal, tamanho, idade, personalidade e detalhes importantes como alergias ou preferencias.",
  infoStepTwoTitle: "2. Montamos a caixa",
  infoStepTwoText: "Combinamos snacks, brinquedos e cuidados de acordo com o perfil e com o plano escolhido.",
  infoStepThreeTitle: "3. Receba em casa",
  infoStepThreeText: "A encomenda segue para a morada indicada, com extras opcionais e pagamento simples por Easypay."
};

const defaultConfiguratorSettings: ConfiguratorSettings = {
  animalTitle: "Escolha o animal",
  animalText: "Adaptamos os produtos ao perfil da caixa.",
  sizeTitle: "Escolha o tamanho",
  sizeText: "Use o tamanho para ajustar quantidade e resistencia dos produtos.",
  ageTitle: "Escolha a idade",
  ageText: "Ajustamos snacks, brinquedos e cuidados a fase de vida.",
  planTitle: "Escolha o plano",
  planText: "O preco base vem dos planos configurados no admin.",
  personalityTitle: "Personalidade da caixa",
  personalityText: "Defina o estilo dos brinquedos, snacks e extras.",
  extrasTitle: "Extras opcionais",
  extrasText: "Adicione produtos extra a caixa.",
  animals: [
    { id: "dog", label: "Cao", description: "Snacks, brinquedos de roer e aventura.", price: 0, image: "/images/dog-box.svg" },
    { id: "cat", label: "Gato", description: "Brinquedos interactivos, snacks e conforto.", price: 0, image: "/images/cat-box.svg" }
  ],
  sizes: [
    { id: "small", label: "Pequeno", description: "Para animais pequenos ou jovens.", price: 0 },
    { id: "medium", label: "Medio", description: "O equilibrio ideal para a maioria.", price: 0 },
    { id: "large", label: "Grande", description: "Mais volume e brinquedos resistentes.", price: 8 }
  ],
  ages: [
    { id: "young", label: "Jovem", description: "Produtos suaves e seguros para animais em crescimento.", price: 0 },
    { id: "adult", label: "Adulto", description: "A seleccao equilibrada para rotinas activas.", price: 0 },
    { id: "senior", label: "Senior", description: "Mais conforto, cuidado e snacks adequados.", price: 0 }
  ],
  personalities: [
    { id: "playful", label: "Brincalhao", description: "Mais brinquedos e snacks de recompensa.", price: 0 },
    { id: "cozy", label: "Conforto", description: "Produtos suaves, descanso e mimo.", price: 0 },
    { id: "outdoor", label: "Aventura", description: "Extras resistentes para passeios.", price: 0 },
    { id: "calm", label: "Calmo", description: "Opcoes tranquilas e enriquecimento leve.", price: 0 }
  ],
  extras: [
    { id: "treats", label: "Snacks extra", description: "Mais recompensas para treino e mimo.", price: 6 },
    { id: "toy", label: "Brinquedo premium", description: "Um brinquedo extra escolhido por perfil.", price: 6 },
    { id: "care", label: "Produto de cuidado", description: "Cuidado simples para pele, pelo ou patas.", price: 6 },
    { id: "photo", label: "Acessorio para fotos", description: "Um detalhe especial para fotografias.", price: 6 }
  ]
};

const defaultStoreSettings: StoreSettings = {
  storeName: "PetBox",
  email: "rodrigoleite.96@gmail.com",
  note: "Painel preparado para ligar a Supabase, Easypay e gestao real de encomendas.",
  shippingPrice: 8
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
  home: defaultHomeSettings,
  configurator: defaultConfiguratorSettings,
  settings: defaultStoreSettings,
  legal: defaultLegalSettings
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
  configurator: {
    get: () => readObject<ConfiguratorSettings>(KEYS.configurator, defaults.configurator),
    set: (settings: ConfiguratorSettings) => writeObject(KEYS.configurator, settings),
    reset: () => writeObject(KEYS.configurator, defaults.configurator)
  },
  settings: {
    get: () => readObject<StoreSettings>(KEYS.settings, defaults.settings),
    set: (settings: StoreSettings) => writeObject(KEYS.settings, settings),
    reset: () => writeObject(KEYS.settings, defaults.settings)
  },
  legal: {
    get: () => mergeLegalSettings(readObject<LegalSettings>(KEYS.legal, defaults.legal)),
    set: (settings: LegalSettings) => writeObject(KEYS.legal, settings),
    reset: () => writeObject(KEYS.legal, defaults.legal)
  },
  resetAll() {
    adminStore.products.reset();
    adminStore.plans.reset();
    adminStore.posts.reset();
    adminStore.orders.reset();
    adminStore.customers.reset();
    adminStore.subscriptions.reset();
    adminStore.home.reset();
    adminStore.configurator.reset();
    adminStore.settings.reset();
    adminStore.legal.reset();
  }
};
