import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type CartItem = {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  type?: "plan" | "custom-box" | "product";
  interval?: "month" | "year";
  intervalCount?: number;
};

type CheckoutCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

type BuiltOrderItem = {
  description: string;
  quantity: number;
  key: string;
  value: number;
  productSlug?: string | null;
  planId?: string | null;
};

const EASYPAY_METHODS = new Set(["cc", "mbw", "mb", "dd", "vi", "ap", "gp", "sw"]);

function getEasypayApiUrl() {
  if (process.env.EASYPAY_CHECKOUT_API_URL) return process.env.EASYPAY_CHECKOUT_API_URL;
  return process.env.EASYPAY_ENVIRONMENT === "production"
    ? "https://api.prod.easypay.pt/2.0/checkout"
    : "https://api.test.easypay.pt/2.0/checkout";
}

function getPaymentMethods() {
  const configured = process.env.EASYPAY_PAYMENT_METHODS || "mbw";
  const methods = configured
    .split(",")
    .map((method) => method.trim().toLowerCase())
    .filter((method) => EASYPAY_METHODS.has(method));

  return methods.length ? methods : ["mbw"];
}

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 160) : fallback;
}

function safeMoney(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(number, 500)) : 0;
}

function safeQuantity(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(1, Math.min(Math.floor(number), 20)) : 1;
}

function shippingPriceFromRequest(value: unknown) {
  const serverValue = process.env.SHIPPING_PRICE_EUR;
  if (serverValue !== undefined && serverValue !== "") return safeMoney(serverValue);
  return safeMoney(value);
}

async function userIdFromAccessToken(accessToken: unknown) {
  const admin = getSupabaseAdmin();
  if (!admin || typeof accessToken !== "string" || !accessToken.trim()) return null;
  const { data, error } = await admin.auth.getUser(accessToken.trim());
  if (error) return null;
  return data.user?.id || null;
}

async function buildOrderItems(items: CartItem[]): Promise<BuiltOrderItem[]> {
  const admin = getSupabaseAdmin();
  const productSlugs = items.filter((item) => item.type !== "plan").map((item) => cleanString(item.slug)).filter(Boolean);
  const planIds = items.filter((item) => item.type === "plan").map((item) => cleanString(item.slug || item.id)).filter(Boolean);

  if (!admin || (!productSlugs.length && !planIds.length)) {
    return items.map((item) => ({
      description: cleanString(item.description || item.title, "Produto PetBox"),
      quantity: safeQuantity(item.quantity),
      key: cleanString(item.slug || item.id || item.title, "item").slice(0, 50),
      value: toMoney(safeMoney(item.price)),
      productSlug: item.type === "product" ? cleanString(item.slug) : null,
      planId: item.type === "plan" ? cleanString(item.slug || item.id) : null
    }));
  }

  const [productsResult, plansResult] = await Promise.all([
    productSlugs.length ? admin.from("products").select("slug,title,price").in("slug", productSlugs).eq("is_active", true) : Promise.resolve({ data: [], error: null }),
    planIds.length ? admin.from("plans").select("id,name,price").in("id", planIds).eq("is_active", true) : Promise.resolve({ data: [], error: null })
  ]);

  if (productsResult.error || plansResult.error) {
    throw new Error("Nao foi possivel validar os precos dos artigos.");
  }

  const products = new Map((productsResult.data || []).map((product: any) => [product.slug, product]));
  const plans = new Map((plansResult.data || []).map((plan: any) => [plan.id, plan]));

  return items.map((item) => {
    const quantity = safeQuantity(item.quantity);
    if (item.type === "plan") {
      const plan = plans.get(cleanString(item.slug || item.id));
      if (plan) {
        return { description: plan.name, quantity, key: plan.id, value: toMoney(Number(plan.price)), productSlug: null, planId: plan.id };
      }
    }

    const product = products.get(cleanString(item.slug));
    if (product) {
      return { description: product.title, quantity, key: product.slug, value: toMoney(Number(product.price)), productSlug: product.slug, planId: null };
    }

    return {
      description: cleanString(item.description || item.title, "Produto PetBox"),
      quantity,
      key: cleanString(item.slug || item.id || item.title, "item").slice(0, 50),
      value: toMoney(safeMoney(item.price)),
      productSlug: item.type === "product" ? cleanString(item.slug) : null,
      planId: item.type === "plan" ? cleanString(item.slug || item.id) : null
    };
  });
}

async function savePendingOrder(params: {
  orderId: string;
  userId: string | null;
  total: number;
  checkoutId: string;
  orderItems: BuiltOrderItem[];
  shipping: number;
}) {
  const admin = getSupabaseAdmin();
  if (!admin) return false;

  const { error: orderError } = await admin.from("orders").upsert({
    id: params.orderId,
    user_id: params.userId,
    title: "Encomenda PetBox",
    status: "Pendente",
    total: params.total,
    easypay_checkout_id: params.checkoutId
  }, { onConflict: "id" });

  if (orderError) throw orderError;

  const rows = [
    ...params.orderItems.map((item) => ({
      order_id: params.orderId,
      product_slug: item.productSlug || null,
      plan_id: item.planId || null,
      title: item.description,
      quantity: item.quantity,
      unit_price: item.value
    })),
    ...(params.shipping > 0 ? [{
      order_id: params.orderId,
      product_slug: null,
      plan_id: null,
      title: "Envio",
      quantity: 1,
      unit_price: toMoney(params.shipping)
    }] : [])
  ];

  const { error: itemsError } = await admin.from("order_items").insert(rows);
  if (itemsError) throw itemsError;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items ?? [];
    const customer: CheckoutCustomer = body.customer ?? {};
    const requestedShipping = shippingPriceFromRequest(body.shippingPrice);
    const userId = await userIdFromAccessToken(body.accessToken);

    if (!items.length) {
      return NextResponse.json({ error: "Não foram enviados artigos para pagamento." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length > 25) {
      return NextResponse.json({ error: "Carrinho invalido." }, { status: 400 });
    }

    const accountId = process.env.EASYPAY_ACCOUNT_ID;
    const apiKey = process.env.EASYPAY_API_KEY;

    if (!accountId || !apiKey) {
      return NextResponse.json(
        { error: "Faltam as variáveis EASYPAY_ACCOUNT_ID e EASYPAY_API_KEY no Vercel." },
        { status: 500 }
      );
    }

    const orderItems = await buildOrderItems(items);
    const subtotal = orderItems.reduce((sum, item) => sum + item.value * item.quantity, 0);
    const shipping = subtotal > 0 ? requestedShipping : 0;
    const total = toMoney(subtotal + shipping);
    const orderKey = `petbox-${Date.now()}`;

    const payload = {
      type: ["single"],
      payment: {
        methods: getPaymentMethods(),
        type: "sale",
        capture: { descriptive: "PetBox" },
        currency: "EUR",
        key: orderKey
      },
      order: {
        items: shipping > 0
          ? [...orderItems.map(({ productSlug, planId, ...item }) => item), { description: "Envio", quantity: 1, key: "shipping", value: toMoney(shipping) }]
          : orderItems.map(({ productSlug, planId, ...item }) => item),
        key: orderKey,
        value: total
      },
      customer: {
        name: [cleanString(customer.firstName), cleanString(customer.lastName)].filter(Boolean).join(" ") || undefined,
        email: cleanString(customer.email) || undefined,
        phone: cleanString(customer.phone) || undefined
      }
    };

    const response = await fetch(getEasypayApiUrl(), {
      method: "POST",
      headers: {
        AccountId: accountId,
        ApiKey: apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.id || !data?.session) {
      console.error("Erro Easypay:", data);
      return NextResponse.json(
        { error: data?.message || data?.error || "Não foi possível criar o pagamento Easypay." },
        { status: response.status || 500 }
      );
    }

    let orderSaved = false;
    try {
      orderSaved = await savePendingOrder({ orderId: orderKey, userId, total, checkoutId: data.id, orderItems, shipping });
    } catch (orderError) {
      console.error("Erro ao gravar encomenda Supabase:", orderError);
    }

    return NextResponse.json({
      orderId: orderKey,
      orderSaved,
      manifest: data,
      testing: process.env.EASYPAY_ENVIRONMENT !== "production"
    });
  } catch (error) {
    console.error("Erro na sessão de pagamento Easypay:", error);
    return NextResponse.json(
      { error: "Não foi possível criar a sessão de pagamento." },
      { status: 500 }
    );
  }
}
