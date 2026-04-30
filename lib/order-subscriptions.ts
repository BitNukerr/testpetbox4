import { getSupabaseAdmin } from "@/lib/supabase-admin";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function createSubscriptionForPaidOrder(orderId: string, userId: string | null) {
  const admin = getSupabaseAdmin();
  if (!admin || !userId) return;

  const { data: existing, error: existingError } = await admin
    .from("customer_subscriptions")
    .select("id")
    .eq("source_order_id", orderId)
    .maybeSingle();

  if (existingError) {
    console.error("Erro ao verificar subscricao da encomenda:", existingError);
    return;
  }
  if (existing) return;

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("plan_id,title,unit_price,quantity")
    .eq("order_id", orderId)
    .not("plan_id", "is", null)
    .limit(1);

  if (itemsError) {
    console.error("Erro ao ler artigos da encomenda para subscricao:", itemsError);
    return;
  }

  const item = items?.[0];
  if (!item?.plan_id) return;

  const { data: plan, error: planError } = await admin
    .from("plans")
    .select("id,cadence,price")
    .eq("id", item.plan_id)
    .maybeSingle();

  if (planError || !plan) {
    console.error("Erro ao validar plano da subscricao:", planError);
    return;
  }

  const price = Number(item.unit_price || plan.price || 0) * Number(item.quantity || 1);
  const renewalDays = plan.cadence === "quarterly" ? 90 : 30;
  const { error: insertError } = await admin.from("customer_subscriptions").insert({
    user_id: userId,
    plan_id: plan.id,
    cadence: plan.cadence,
    status: "active",
    next_box_date: addDays(14),
    renewal_date: addDays(renewalDays),
    price,
    extras: item.title || null,
    source_order_id: orderId
  });

  if (insertError) {
    console.error("Erro ao criar subscricao da encomenda:", insertError);
  }
}
