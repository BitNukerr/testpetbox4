import { unstable_cache } from "next/cache";
import type { Plan, Product } from "@/data/products";
import type { ConfiguratorSettings, EditablePost, HomeSettings, StoreSettings } from "@/lib/admin-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const CONTENT_REVALIDATE_SECONDS = 86400;

export type HomepageData = {
  initialHomeSettings: Partial<HomeSettings> | null;
  initialProducts: Product[];
  initialPlans: Plan[];
  initialProductsLoaded: boolean;
  initialPlansLoaded: boolean;
};

export type ConfiguratorData = {
  initialConfiguratorSettings: Partial<ConfiguratorSettings> | null;
  initialPlans: Plan[];
  initialPlansLoaded: boolean;
};

export type StoreSettingsData = Partial<StoreSettings> | null;

export type ContentListState<T> = {
  data: T[];
  loaded: boolean;
};

function emptyHomepageData(): HomepageData {
  return {
    initialHomeSettings: null,
    initialProducts: [],
    initialPlans: [],
    initialProductsLoaded: false,
    initialPlansLoaded: false
  };
}

function productFromRow(row: any): Product {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    species: row.species,
    price: Number(row.price || 0),
    description: row.description,
    image: row.image,
    tag: row.tag || "",
    rating: Number(row.rating || 0)
  };
}

function planFromRow(row: any): Plan {
  return {
    id: row.id,
    name: row.name,
    cadence: row.cadence,
    price: Number(row.price || 0),
    description: row.description,
    perks: Array.isArray(row.perks) ? row.perks : []
  };
}

function postFromRow(row: any): EditablePost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    status: row.status,
    author: row.author,
    date: row.published_at || row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  };
}

function storeSettingsFromRow(row: any): StoreSettingsData {
  if (!row) return null;

  return {
    storeName: row.store_name || row.storeName || "PetBox",
    email: row.support_email || row.email || "",
    note: row.internal_note || row.note || "",
    shippingPrice: Number(row.shipping_price ?? row.shippingPrice ?? 0)
  };
}

async function readProductsState(): Promise<ContentListState<Product>> {
  const client = getSupabaseAdmin();
  if (!client) return { data: [], loaded: false };

  const { data, error } = await client
    .from("products")
    .select("slug,title,category,species,price,description,image,tag,rating")
    .eq("is_active", true)
    .order("title", { ascending: true });

  return error ? { data: [], loaded: false } : { data: (data || []).map(productFromRow), loaded: true };
}

async function readProducts() {
  return (await readProductsState()).data;
}

async function readPlansState(): Promise<ContentListState<Plan>> {
  const client = getSupabaseAdmin();
  if (!client) return { data: [], loaded: false };

  const { data, error } = await client
    .from("plans")
    .select("id,name,cadence,price,description,perks")
    .eq("is_active", true)
    .order("price", { ascending: true });

  return error ? { data: [], loaded: false } : { data: (data || []).map(planFromRow), loaded: true };
}

async function readPlans() {
  return (await readPlansState()).data;
}

async function readPostsState(): Promise<ContentListState<EditablePost>> {
  const client = getSupabaseAdmin();
  if (!client) return { data: [], loaded: false };

  const { data, error } = await client
    .from("journal_posts")
    .select("slug,title,excerpt,body,status,author,published_at,created_at")
    .eq("status", "Publicado")
    .order("created_at", { ascending: false });

  return error ? { data: [], loaded: false } : { data: (data || []).map(postFromRow), loaded: true };
}

async function readPosts() {
  return (await readPostsState()).data;
}

async function readHomepageData(): Promise<HomepageData> {
  const client = getSupabaseAdmin();
  if (!client) return emptyHomepageData();

  const [homeResult, products, plans] = await Promise.all([
    client.from("home_settings").select("settings").eq("id", true).maybeSingle(),
    readProductsState(),
    readPlansState()
  ]);

  return {
    initialHomeSettings: homeResult.error ? null : homeResult.data?.settings || null,
    initialProducts: products.data,
    initialPlans: plans.data,
    initialProductsLoaded: products.loaded,
    initialPlansLoaded: plans.loaded
  };
}

async function readConfiguratorData(): Promise<ConfiguratorData> {
  const client = getSupabaseAdmin();
  if (!client) return { initialConfiguratorSettings: null, initialPlans: [], initialPlansLoaded: false };

  const [configuratorResult, plans] = await Promise.all([
    client.from("configurator_settings").select("settings").eq("id", true).maybeSingle(),
    readPlansState()
  ]);

  return {
    initialConfiguratorSettings: configuratorResult.error ? null : configuratorResult.data?.settings || null,
    initialPlans: plans.data,
    initialPlansLoaded: plans.loaded
  };
}

async function readStoreSettings(): Promise<StoreSettingsData> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  let result = await client
    .from("store_settings")
    .select("store_name,support_email,shipping_price,internal_note")
    .eq("id", true)
    .maybeSingle();

  if (result.error && String(result.error.message || "").toLowerCase().includes("internal_note")) {
    result = await client
      .from("store_settings")
      .select("store_name,support_email,shipping_price")
      .eq("id", true)
      .maybeSingle();
  }

  return result.error ? null : storeSettingsFromRow(result.data);
}

export const getCachedProducts = unstable_cache(readProducts, ["petbox-products"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-products"]
});

export const getCachedProductsState = unstable_cache(readProductsState, ["petbox-products-state"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-products"]
});

export const getCachedPosts = unstable_cache(readPosts, ["petbox-posts"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-posts"]
});

export const getCachedPostsState = unstable_cache(readPostsState, ["petbox-posts-state"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-posts"]
});

export const getCachedPlansState = unstable_cache(readPlansState, ["petbox-plans-state"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-plans"]
});

export const getCachedHomepageData = unstable_cache(readHomepageData, ["petbox-homepage-data"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-homepage", "petbox-products", "petbox-plans"]
});

export const getCachedConfiguratorData = unstable_cache(readConfiguratorData, ["petbox-configurator-data"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-configurator", "petbox-plans"]
});

export const getCachedStoreSettings = unstable_cache(readStoreSettings, ["petbox-store-settings"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-store-settings"]
});
