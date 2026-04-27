import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: CartItem[] = body.items ?? [];
    const customer: CheckoutCustomer = body.customer ?? {};
    const requestedShipping = Math.max(0, Number(body.shippingPrice) || 0);

    if (!items.length) {
      return NextResponse.json({ error: "Não foram enviados artigos para pagamento." }, { status: 400 });
    }

    const accountId = process.env.EASYPAY_ACCOUNT_ID;
    const apiKey = process.env.EASYPAY_API_KEY;

    if (!accountId || !apiKey) {
      return NextResponse.json(
        { error: "Faltam as variáveis EASYPAY_ACCOUNT_ID e EASYPAY_API_KEY no Vercel." },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => ({
      description: item.description || item.title,
      quantity: item.quantity ?? 1,
      key: item.slug || item.id || item.title.slice(0, 50),
      value: toMoney(item.price)
    }));
    const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
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
          ? [...orderItems, { description: "Envio", quantity: 1, key: "shipping", value: toMoney(shipping) }]
          : orderItems,
        key: orderKey,
        value: total
      },
      customer: {
        name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || undefined,
        email: customer.email || undefined,
        phone: customer.phone || undefined
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

    return NextResponse.json({
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
