import { NextRequest, NextResponse } from "next/server";
import { requestHasAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function clientOrResponse(request: NextRequest) {
  if (!requestHasAdminSession(request)) {
    return { response: NextResponse.json({ error: "Acesso nao autorizado." }, { status: 401 }) };
  }
  const client = getSupabaseAdmin();
  if (!client) {
    return { response: NextResponse.json({ error: "Configure SUPABASE_SECRET_KEY no Vercel." }, { status: 500 }) };
  }
  return { client };
}

async function ordersWithProfiles(client: NonNullable<ReturnType<typeof getSupabaseAdmin>>) {
  const { data: orders, error: ordersError } = await client
    .from("orders")
    .select("id,user_id,title,status,total,payment_method,easypay_checkout_id,easypay_payment_id,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (ordersError) throw ordersError;

  const orderIds = (orders || []).map((order: any) => order.id);
  const userIds = [...new Set((orders || []).map((order: any) => order.user_id).filter(Boolean))];

  const [{ data: items, error: itemsError }, { data: profiles, error: profilesError }, deliveryResult] = await Promise.all([
    orderIds.length
      ? client.from("order_items").select("order_id,title,quantity,unit_price,product_slug,plan_id").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length
      ? client.from("profiles").select("user_id,email,full_name,phone").in("user_id", userIds)
      : Promise.resolve({ data: [], error: null }),
    orderIds.length
      ? client.from("order_delivery_details").select("order_id,full_name,email,phone,address,city,zip,nif,notes").in("order_id", orderIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (itemsError) throw itemsError;
  if (profilesError) throw profilesError;
  const deliveryRows = deliveryResult.error ? [] : deliveryResult.data || [];

  const itemsByOrder = new Map<string, any[]>();
  for (const item of items || []) {
    const list = itemsByOrder.get(item.order_id) || [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  const profilesByUser = new Map((profiles || []).map((profile: any) => [profile.user_id, profile]));
  const deliveryByOrder = new Map(deliveryRows.map((delivery: any) => [delivery.order_id, delivery]));

  return (orders || []).map((order: any) => ({
    ...order,
    profile: profilesByUser.get(order.user_id) || null,
    items: itemsByOrder.get(order.id) || [],
    delivery: deliveryByOrder.get(order.id) || null
  }));
}

export async function GET(request: NextRequest) {
  const setup = clientOrResponse(request);
  if (setup.response) return setup.response;
  const client = setup.client!;
  const resource = request.nextUrl.searchParams.get("resource");

  if (resource === "products") {
    const { data, error } = await client.from("products").select("slug,title,category,species,price,description,image,tag,rating").order("title", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (resource === "plans") {
    const { data, error } = await client.from("plans").select("id,name,cadence,price,description,perks").order("price", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (resource === "posts") {
    const { data, error } = await client.from("journal_posts").select("slug,title,excerpt,body,status,author,published_at,created_at").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (resource === "orders") {
    try {
      const data = await ordersWithProfiles(client);
      return NextResponse.json({ data });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Recurso invalido." }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const setup = clientOrResponse(request);
  if (setup.response) return setup.response;
  const client = setup.client!;
  const body = await request.json().catch(() => ({}));

  if (body.resource === "products") {
    const item = body.item || {};
    const { data, error } = await client.from("products").upsert({ ...item, is_active: true }, { onConflict: "slug" }).select("slug,title,category,species,price,description,image,tag,rating").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.resource === "plans") {
    const item = body.item || {};
    const { data, error } = await client.from("plans").upsert({ ...item, is_active: true }, { onConflict: "id" }).select("id,name,cadence,price,description,perks").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.resource === "posts") {
    const item = body.item || {};
    const { data, error } = await client.from("journal_posts").upsert(item, { onConflict: "slug" }).select("slug,title,excerpt,body,status,author,published_at,created_at").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (body.resource === "home_settings") {
    const { error } = await client.from("home_settings").upsert({ id: true, settings: body.settings || {} }, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.resource === "configurator_settings") {
    const { error } = await client.from("configurator_settings").upsert({ id: true, settings: body.settings || {} }, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.resource === "orders") {
    const item = body.item || {};
    if (!item.id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

    const status = typeof item.status === "string" ? item.status.trim().slice(0, 40) : "";
    if (!status) return NextResponse.json({ error: "Estado em falta." }, { status: 400 });

    const { error } = await client.from("orders").update({ status }).eq("id", item.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    try {
      const data = await ordersWithProfiles(client);
      return NextResponse.json({ data: data.find((order: any) => order.id === item.id) || null });
    } catch (readError: any) {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Recurso invalido." }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const setup = clientOrResponse(request);
  if (setup.response) return setup.response;
  const client = setup.client!;
  const resource = request.nextUrl.searchParams.get("resource");
  const id = request.nextUrl.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

  if (resource === "products") {
    const { error } = await client.from("products").delete().eq("slug", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (resource === "plans") {
    const { error } = await client.from("plans").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (resource === "posts") {
    const { error } = await client.from("journal_posts").delete().eq("slug", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Recurso invalido." }, { status: 400 });
}
