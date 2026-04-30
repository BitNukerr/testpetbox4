import { NextRequest, NextResponse } from "next/server";
import { easypayOrderKey, easypayPaymentValue, fetchEasypayCheckout, isEasypayCheckoutPaid } from "@/lib/easypay";
import { createSubscriptionForPaidOrder } from "@/lib/order-subscriptions";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function clean(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function timingSafeTextEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

function basicAuthIsValid(request: NextRequest) {
  const expectedUser = process.env.EASYPAY_WEBHOOK_USER;
  const expectedPassword = process.env.EASYPAY_WEBHOOK_PASSWORD;
  if (!expectedUser || !expectedPassword) return true;

  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("basic ")) return false;

  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    const user = separator >= 0 ? decoded.slice(0, separator) : "";
    const password = separator >= 0 ? decoded.slice(separator + 1) : "";
    return timingSafeTextEqual(user, expectedUser) && timingSafeTextEqual(password, expectedPassword);
  } catch {
    return false;
  }
}

function findCheckoutId(payload: any) {
  const candidates = [
    payload?.checkout?.id,
    payload?.payment?.checkout?.id,
    payload?.payment?.checkout_id,
    payload?.checkout_id,
    payload?.resource?.checkout?.id,
    payload?.resource?.checkout_id,
    payload?.id
  ];
  return clean(candidates.find(Boolean), 160);
}

export async function POST(request: NextRequest) {
  try {
    if (!basicAuthIsValid(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Configure SUPABASE_SECRET_KEY no Vercel." }, { status: 500 });
    }

    const payload = await request.json().catch(() => ({}));
    const checkoutId = findCheckoutId(payload);
    if (!checkoutId) {
      return NextResponse.json({ error: "Checkout em falta." }, { status: 400 });
    }

    const paymentDetails = await fetchEasypayCheckout(checkoutId);
    if (!isEasypayCheckoutPaid(paymentDetails)) {
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    const paymentId = clean(paymentDetails.payment?.id || payload?.payment?.id, 160);
    const paymentMethod = clean(paymentDetails.payment?.method || payload?.payment?.method, 40);
    const orderKey = clean(easypayOrderKey(paymentDetails) || payload?.order?.key || payload?.payment?.key, 80);
    const paidValue = easypayPaymentValue(paymentDetails);

    const update = {
      status: "Confirmada",
      easypay_payment_id: paymentId || null,
      payment_method: paymentMethod || null
    };

    const { data: byCheckout, error: checkoutError } = await admin
      .from("orders")
      .update(update)
      .eq("easypay_checkout_id", checkoutId)
      .eq("total", paidValue)
      .select("id,user_id");

    if (checkoutError) throw checkoutError;
    if (byCheckout?.length) {
      await Promise.all(byCheckout.map((order) => createSubscriptionForPaidOrder(order.id, order.user_id || null)));
      return NextResponse.json({ ok: true });
    }
    if (!orderKey) return NextResponse.json({ ok: true });

    const { data: byKey, error: keyError } = await admin
      .from("orders")
      .update(update)
      .eq("id", orderKey)
      .eq("total", paidValue)
      .select("id,user_id");

    if (keyError) throw keyError;
    await Promise.all((byKey || []).map((order) => createSubscriptionForPaidOrder(order.id, order.user_id || null)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook Easypay:", error);
    return NextResponse.json({ error: "Nao foi possivel processar o webhook." }, { status: 500 });
  }
}
