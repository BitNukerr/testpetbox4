import { NextRequest, NextResponse } from "next/server";
import { getEasypayCheckoutApiUrl, getEasypayCredentials } from "@/lib/easypay";
import { rateLimit, requestIsSameOrigin } from "@/lib/request-security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type CartItem = {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  type?: "plan" | "custom-box" | "product";
  species?: string;
  interval?: "month" | "year";
  intervalCount?: number;
  config?: Record<string, string>;
};

type CheckoutCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  nif?: string;
  notes?: string;
};

type BuiltOrderItem = {
  description: string;
  quantity: number;
  key: string;
  value: number;
  productSlug?: string | null;
  planId?: string | null;
};

type ConfigOption = {
  id: string;
  label: string;
  price?: number;
};

const EASYPAY_METHODS = new Set(["cc", "mbw", "mb", "dd", "vi", "ap", "gp", "sw"]);
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^\+?\d[\d\s]{8,}$/;
const DEFAULT_AGES: ConfigOption[] = [
  { id: "young", label: "Jovem", price: 0 },
  { id: "adult", label: "Adulto", price: 0 },
  { id: "senior", label: "Senior", price: 0 }
];

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

function cleanString(value: unknown, fallback = "", maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

function cleanNotes(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 240) : "";
}

function buildDeliveryDetails(customer: CheckoutCustomer) {
  const firstName = cleanString(customer.firstName, "", 80);
  const lastName = cleanString(customer.lastName, "", 80);
  return {
    full_name: [firstName, lastName].filter(Boolean).join(" "),
    email: cleanString(customer.email, "", 160),
    phone: cleanString(customer.phone, "", 40),
    address: cleanString(customer.address, "", 220),
    city: cleanString(customer.city, "", 120),
    zip: cleanString(customer.zip, "", 40),
    nif: cleanString(customer.nif, "", 40),
    notes: cleanNotes(customer.notes)
  };
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
  if (process.env.NODE_ENV === "production") return 0;
  return safeMoney(value);
}

function validateCustomer(customer: CheckoutCustomer) {
  const delivery = buildDeliveryDetails(customer);
  if (!delivery.full_name) return "Preencha o nome e apelido.";
  if (!EMAIL_RE.test(delivery.email)) return "Escreva um email valido.";
  if (!PHONE_RE.test(delivery.phone)) return "Escreva um numero de telemovel valido.";
  if (!delivery.address || !delivery.city || !delivery.zip) return "Preencha a morada completa.";
  return "";
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
  if (!admin && process.env.NODE_ENV === "production") {
    throw new Error("Configure SUPABASE_SECRET_KEY para validar precos no servidor.");
  }

  const productSlugs = items.filter((item) => item.type === "product").map((item) => cleanString(item.slug)).filter(Boolean);
  const planIds = items
    .map((item) => item.type === "plan" ? cleanString(item.slug || item.id) : item.type === "custom-box" ? cleanString(item.config?.planId) : "")
    .filter(Boolean);

  if (!admin) {
    return items.map((item) => ({
      description: cleanString(item.description || item.title, "Produto PetBox"),
      quantity: safeQuantity(item.quantity),
      key: cleanString(item.slug || item.id || item.title, "item").slice(0, 50),
      value: toMoney(safeMoney(item.price)),
      productSlug: item.type === "product" ? cleanString(item.slug) : null,
      planId: item.type === "plan" ? cleanString(item.slug || item.id) : null
    }));
  }

  const [productsResult, plansResult, configuratorResult] = await Promise.all([
    productSlugs.length ? admin.from("products").select("slug,title,price").in("slug", productSlugs).eq("is_active", true) : Promise.resolve({ data: [], error: null }),
    planIds.length ? admin.from("plans").select("id,name,price").in("id", planIds).eq("is_active", true) : Promise.resolve({ data: [], error: null }),
    items.some((item) => item.type === "custom-box") ? admin.from("configurator_settings").select("settings").eq("id", true).maybeSingle() : Promise.resolve({ data: null, error: null })
  ]);

  if (productsResult.error || plansResult.error || configuratorResult.error) {
    throw new Error("Nao foi possivel validar os precos dos artigos.");
  }

  const products = new Map((productsResult.data || []).map((product: any) => [product.slug, product]));
  const plans = new Map((plansResult.data || []).map((plan: any) => [plan.id, plan]));
  const configurator = (configuratorResult.data as any)?.settings || null;

  function findOption(group: string, id: string): ConfigOption | null {
    const options = Array.isArray(configurator?.[group]) ? configurator[group] : group === "ages" ? DEFAULT_AGES : [];
    return options.find((option: ConfigOption) => option.id === id) || null;
  }

  return items.map((item) => {
    const quantity = safeQuantity(item.quantity);
    if (item.type === "plan") {
      const plan = plans.get(cleanString(item.slug || item.id));
      if (plan) {
        return { description: plan.name, quantity, key: plan.id, value: toMoney(Number(plan.price)), productSlug: null, planId: plan.id };
      }
      throw new Error("Plano invalido ou indisponivel.");
    }

    if (item.type === "custom-box") {
      const planId = cleanString(item.config?.planId);
      const animalId = cleanString(item.config?.animalId || item.species);
      const sizeId = cleanString(item.config?.sizeId);
      const ageId = cleanString(item.config?.ageId, "adult") || "adult";
      const personalityId = cleanString(item.config?.personalityId);
      const notes = cleanNotes(item.config?.notes);
      const extraIds = cleanString(item.config?.extraIds)
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
      const plan = plans.get(planId);

      if (!plan || !configurator) {
        throw new Error("Caixa personalizada invalida. Volte a configurar a caixa.");
      }

      const animal = findOption("animals", animalId);
      const size = findOption("sizes", sizeId);
      const age = findOption("ages", ageId);
      const personality = findOption("personalities", personalityId);
      const extras = extraIds.map((id) => findOption("extras", id)).filter(Boolean) as ConfigOption[];

      if (!animal || !size || !age || !personality || extras.length !== extraIds.length) {
        throw new Error("A caixa personalizada tem opcoes invalidas. Volte a configurar a caixa.");
      }

      const price = toMoney(
        Number(plan.price || 0) +
        Number(animal.price || 0) +
        Number(size.price || 0) +
        Number(age.price || 0) +
        Number(personality.price || 0) +
        extras.reduce((sum, extra) => sum + Number(extra.price || 0), 0)
      );
      const label = [plan.name, animal.label, age.label].filter(Boolean).join(" ");
      const description = (notes ? `${label} - ${notes}` : label).slice(0, 160);
      return { description: description || "Caixa personalizada PetBox", quantity, key: `custom-${plan.id}-${animal.id}-${age.id}`, value: price, productSlug: null, planId: plan.id };
    }

    if (item.type === "product") {
      const product = products.get(cleanString(item.slug));
      if (product) {
        return { description: product.title, quantity, key: product.slug, value: toMoney(Number(product.price)), productSlug: product.slug, planId: null };
      }
      throw new Error("Produto invalido ou indisponivel.");
    }

    throw new Error("Artigo invalido no carrinho.");
  });
}

async function savePendingOrder(params: {
  orderId: string;
  userId: string | null;
  total: number;
  checkoutId: string;
  orderItems: BuiltOrderItem[];
  shipping: number;
  customer: CheckoutCustomer;
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

  const delivery = buildDeliveryDetails(params.customer);
  const { error: deliveryError } = await admin.from("order_delivery_details").upsert({
    order_id: params.orderId,
    user_id: params.userId,
    ...delivery
  }, { onConflict: "order_id" });

  if (deliveryError) {
    console.error("Erro ao gravar dados de entrega:", deliveryError);
  }

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
    if (!requestIsSameOrigin(req)) {
      return NextResponse.json({ error: "Pedido invalido." }, { status: 403 });
    }

    const limited = rateLimit(req, "checkout", { limit: 20, windowMs: 10 * 60 * 1000 });
    if (limited.limited) {
      return NextResponse.json({ error: "Demasiadas tentativas de pagamento. Tente novamente mais tarde." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
    }

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

    const customerError = validateCustomer(customer);
    if (customerError) {
      return NextResponse.json({ error: customerError }, { status: 400 });
    }

    const credentials = getEasypayCredentials();

    if (!credentials) {
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

    const response = await fetch(getEasypayCheckoutApiUrl(), {
      method: "POST",
      headers: {
        AccountId: credentials.accountId,
        ApiKey: credentials.apiKey,
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
      orderSaved = await savePendingOrder({ orderId: orderKey, userId, total, checkoutId: data.id, orderItems, shipping, customer });
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
