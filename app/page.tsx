import HomeShowcaseClient from "@/components/HomeShowcaseClient";
import type { Plan, Product } from "@/data/products";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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

async function loadHomepageData() {
  const client = getSupabaseAdmin();
  if (!client) return {};

  const [homeResult, productsResult, plansResult] = await Promise.all([
    client.from("home_settings").select("settings").eq("id", true).maybeSingle(),
    client.from("products").select("slug,title,category,species,price,description,image,tag,rating").eq("is_active", true).order("title", { ascending: true }),
    client.from("plans").select("id,name,cadence,price,description,perks").eq("is_active", true).order("price", { ascending: true })
  ]);

  return {
    initialHomeSettings: homeResult.error ? null : homeResult.data?.settings || null,
    initialProducts: productsResult.error ? [] : (productsResult.data || []).map(productFromRow),
    initialPlans: plansResult.error ? [] : (plansResult.data || []).map(planFromRow)
  };
}

export default async function HomePage() {
  const homepageData = await loadHomepageData();
  return <HomeShowcaseClient {...homepageData} />;
}
