import { unstable_cache } from "next/cache";
import type { Plan, Product } from "@/data/products";
import type { ConfiguratorSettings, EditablePost, HomeSettings, StoreSettings } from "@/lib/admin-store";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const CONTENT_REVALIDATE_SECONDS = 86400;

export type HomepageData = {
  initialHomeSettings: Partial<HomeSettings> | null;
  initialProducts: Product[];
  initialPlans: Plan[];
};

export type ConfiguratorData = {
  initialConfiguratorSettings: Partial<ConfiguratorSettings> | null;
  initialPlans: Plan[];
};

export type StoreSettingsData = Partial<StoreSettings> | null;

function emptyHomepageData(): HomepageData {
  return {
    initialHomeSettings: null,
    initialProducts: [],
    initialPlans: []
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

async function readProducts() {
  const client = getSupabaseAdmin();
  if (!client) return [];

  const { data, error } = await client
    .from("products")
    .select("slug,title,category,species,price,description,image,tag,rating")
    .eq("is_active", true)
    .order("title", { ascending: true });

  return error ? [] : (data || []).map(productFromRow);
}

async function readPlans() {
  const client = getSupabaseAdmin();
  if (!client) return [];

  const { data, error } = await client
    .from("plans")
    .select("id,name,cadence,price,description,perks")
    .eq("is_active", true)
    .order("price", { ascending: true });

  return error ? [] : (data || []).map(planFromRow);
}

async function readPosts() {
  const client = getSupabaseAdmin();
  if (!client) return [];

  const { data, error } = await client
    .from("journal_posts")
    .select("slug,title,excerpt,body,status,author,published_at,created_at")
    .eq("status", "Publicado")
    .order("created_at", { ascending: false });

  return error ? [] : (data || []).map(postFromRow);
}

async function readHomepageData(): Promise<HomepageData> {
  const client = getSupabaseAdmin();
  if (!client) return emptyHomepageData();

  const [homeResult, products, plans] = await Promise.all([
    client.from("home_settings").select("settings").eq("id", true).maybeSingle(),
    readProducts(),
    readPlans()
  ]);

  return {
    initialHomeSettings: homeResult.error ? null : homeResult.data?.settings || null,
    initialProducts: products,
    initialPlans: plans
  };
}

async function readConfiguratorData(): Promise<ConfiguratorData> {
  const client = getSupabaseAdmin();
  if (!client) return { initialConfiguratorSettings: null, initialPlans: [] };

  const [configuratorResult, plans] = await Promise.all([
    client.from("configurator_settings").select("settings").eq("id", true).maybeSingle(),
    readPlans()
  ]);

  return {
    initialConfiguratorSettings: configuratorResult.error ? null : configuratorResult.data?.settings || null,
    initialPlans: plans
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

export const getCachedPosts = unstable_cache(readPosts, ["petbox-posts"], {
  revalidate: CONTENT_REVALIDATE_SECONDS,
  tags: ["petbox-posts"]
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
