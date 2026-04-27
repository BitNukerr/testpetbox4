"use client";

import type { Plan, Product } from "@/data/products";
import type { AdminOrder } from "@/data/admin";
import type { ConfiguratorSettings, EditablePost, HomeSettings } from "@/lib/admin-store";
import { supabase } from "@/lib/supabase-client";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
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

function orderFromRow(row: any): AdminOrder {
  const profile = row.profile || {};
  const items = Array.isArray(row.items) ? row.items : [];
  const firstItem = items[0] || {};
  const title = firstItem.title || row.title || "";
  const pet = /gato|cat/i.test(title) ? "Gato" : "Cão";
  const plan = /trimestral|quarter/i.test(firstItem.plan_id || title)
    ? "Trimestral"
    : /mensal|month/i.test(firstItem.plan_id || title)
    ? "Mensal"
    : "Compra única";

  return {
    id: row.id,
    customer: profile.full_name || row.customer || "Cliente",
    email: profile.email || row.email || "",
    pet,
    plan,
    status: row.status || "Pendente",
    total: Number(row.total || 0),
    date: row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  };
}

export async function loadAdminProducts() {
  const { data, error } = await requireSupabase().from("products").select("slug,title,category,species,price,description,image,tag,rating").order("title", { ascending: true });
  if (error) throw error;
  return (data || []).map(productFromRow);
}

async function adminFetch(path: string, init?: RequestInit) {
  const response = await fetch(path, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Nao foi possivel actualizar o Supabase.");
  return data;
}

export async function loadAdminProductsForAdmin() {
  const result = await adminFetch("/api/admin/store?resource=products");
  return (result.data || []).map(productFromRow);
}

export async function saveAdminProduct(product: Product) {
  const result = await adminFetch("/api/admin/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resource: "products",
      item: {
      slug: product.slug,
      title: product.title,
      category: product.category,
      species: product.species,
      price: product.price,
      description: product.description,
      image: product.image,
      tag: product.tag,
      rating: product.rating
      }
    })
  });
  return productFromRow(result.data);
}

export async function deleteAdminProduct(slug: string) {
  await adminFetch(`/api/admin/store?resource=products&id=${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export async function loadAdminPlans() {
  const { data, error } = await requireSupabase().from("plans").select("id,name,cadence,price,description,perks").order("price", { ascending: true });
  if (error) throw error;
  return (data || []).map(planFromRow);
}

export async function loadAdminPlansForAdmin() {
  const result = await adminFetch("/api/admin/store?resource=plans");
  return (result.data || []).map(planFromRow);
}

export async function saveAdminPlan(plan: Plan) {
  const result = await adminFetch("/api/admin/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resource: "plans",
      item: {
      id: plan.id,
      name: plan.name,
      cadence: plan.cadence,
      price: plan.price,
      description: plan.description,
      perks: plan.perks
      }
    })
  });
  return planFromRow(result.data);
}

export async function deleteAdminPlan(id: string) {
  await adminFetch(`/api/admin/store?resource=plans&id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function loadAdminPosts() {
  const { data, error } = await requireSupabase().from("journal_posts").select("slug,title,excerpt,body,status,author,published_at,created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(postFromRow);
}

export async function loadAdminPostsForAdmin() {
  const result = await adminFetch("/api/admin/store?resource=posts");
  return (result.data || []).map(postFromRow);
}

export async function saveAdminPost(post: EditablePost) {
  const result = await adminFetch("/api/admin/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resource: "posts",
      item: {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      status: post.status,
      author: post.author,
      published_at: post.date || null
      }
    })
  });
  return postFromRow(result.data);
}

export async function deleteAdminPost(slug: string) {
  await adminFetch(`/api/admin/store?resource=posts&id=${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export async function loadAdminOrdersForAdmin() {
  const result = await adminFetch("/api/admin/store?resource=orders");
  return (result.data || []).map(orderFromRow);
}

export async function saveAdminOrderStatus(order: AdminOrder) {
  const result = await adminFetch("/api/admin/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resource: "orders",
      item: {
        id: order.id,
        status: order.status
      }
    })
  });
  return orderFromRow(result.data);
}

export async function loadRemoteHomeSettings(fallback: HomeSettings) {
  const { data, error } = await requireSupabase().from("home_settings").select("settings").eq("id", true).maybeSingle();
  if (error) throw error;
  return { ...fallback, ...(data?.settings || {}) } as HomeSettings;
}

export async function saveRemoteHomeSettings(settings: HomeSettings) {
  await adminFetch("/api/admin/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "home_settings", settings })
  });
}

export async function loadRemoteConfiguratorSettings(fallback: ConfiguratorSettings) {
  const { data, error } = await requireSupabase().from("configurator_settings").select("settings").eq("id", true).maybeSingle();
  if (error) throw error;
  return { ...fallback, ...(data?.settings || {}) } as ConfiguratorSettings;
}

export async function saveRemoteConfiguratorSettings(settings: ConfiguratorSettings) {
  await adminFetch("/api/admin/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource: "configurator_settings", settings })
  });
}
