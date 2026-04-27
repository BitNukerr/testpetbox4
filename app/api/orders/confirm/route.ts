import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function clean(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function userIdFromAccessToken(accessToken: unknown) {
  const admin = getSupabaseAdmin();
  if (!admin || typeof accessToken !== "string" || !accessToken.trim()) return null;
  const { data, error } = await admin.auth.getUser(accessToken.trim());
  if (error) return null;
  return data.user?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Configure SUPABASE_SECRET_KEY no Vercel." }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const orderId = clean(body.orderId, 80);
    const checkoutId = clean(body.checkoutId, 160);
    const paymentId = clean(body.paymentId, 160);
    const paymentMethod = clean(body.paymentMethod, 40);
    const userId = await userIdFromAccessToken(body.accessToken);

    if (!orderId || !checkoutId || !paymentId) {
      return NextResponse.json({ error: "Dados de encomenda em falta." }, { status: 400 });
    }

    const { data: order, error: readError } = await admin
      .from("orders")
      .select("id,user_id,easypay_checkout_id")
      .eq("id", orderId)
      .maybeSingle();

    if (readError) throw readError;
    if (!order || order.easypay_checkout_id !== checkoutId) {
      return NextResponse.json({ error: "Encomenda nao encontrada." }, { status: 404 });
    }
    if (order.user_id && userId && order.user_id !== userId) {
      return NextResponse.json({ error: "Encomenda nao pertence a este utilizador." }, { status: 403 });
    }

    const { error: updateError } = await admin
      .from("orders")
      .update({
        status: "Confirmada",
        easypay_payment_id: paymentId,
        payment_method: paymentMethod || null
      })
      .eq("id", orderId)
      .eq("easypay_checkout_id", checkoutId);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao confirmar encomenda:", error);
    return NextResponse.json({ error: "Nao foi possivel confirmar a encomenda." }, { status: 500 });
  }
}
