"use client";

export type AdminActivity = {
  id: string;
  createdAt: string;
  action: string;
  target: string;
  detail: string;
  source?: "local" | "supabase";
};

const ACTIVITY_KEY = "petbox-admin-activity";

function readLocal(): AdminActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: AdminActivity[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items.slice(0, 100)));
  window.dispatchEvent(new Event("petbox-admin-activity-changed"));
}

function labelFromResource(resource: string) {
  const labels: Record<string, string> = {
    products: "Produtos",
    plans: "Planos",
    posts: "Blog",
    home_settings: "Pagina inicial",
    configurator_settings: "Criar caixa",
    legal_settings: "Legal",
    store_settings: "Definicoes",
    orders: "Encomendas",
    subscriptions: "Subscricoes"
  };
  return labels[resource] || resource;
}

function detailFromBody(body: any) {
  const item = body?.item || {};
  if (body?.resource === "home_settings") return "Textos e imagens da homepage";
  if (body?.resource === "configurator_settings") return "Passos e opcoes do configurador";
  if (body?.resource === "legal_settings") return "Paginas legais";
  return item.title || item.name || item.id || item.slug || body?.resource || "Alteracao";
}

export function getLocalAdminActivity() {
  return readLocal();
}

export function clearLocalAdminActivity() {
  writeLocal([]);
}

export function rememberAdminActivity(action: string, target: string, detail = "") {
  const item: AdminActivity = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    action,
    target,
    detail,
    source: "local"
  };
  writeLocal([item, ...readLocal()]);
}

export async function loadRemoteAdminActivity() {
  const response = await fetch("/api/admin/store?resource=activity", { cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Nao foi possivel carregar a atividade.");
  return {
    setupRequired: Boolean(result.setupRequired),
    data: (result.data || []).map((item: any) => ({
      id: item.id,
      createdAt: item.created_at || item.createdAt,
      action: item.action,
      target: item.target,
      detail: item.detail || "",
      source: "supabase" as const
    })) as AdminActivity[]
  };
}

export function trackAdminMutation(path: string, init?: RequestInit) {
  if (!init?.method || init.method === "GET") return;
  if (!path.includes("/api/admin/store")) return;

  let body: any = {};
  if (typeof init.body === "string") {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  if (body.resource === "activity") return;

  const method = init.method.toUpperCase();
  const resource = body.resource || new URL(path, window.location.origin).searchParams.get("resource") || "admin";
  const target = labelFromResource(resource);
  const action = method === "DELETE" ? "Removeu" : "Guardou";
  const detail = detailFromBody(body);
  rememberAdminActivity(action, target, detail);
}
