import { NextRequest, NextResponse } from "next/server";
import { requestHasAdminSession } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type SupabaseAdminClient = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

function cleanString(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeMoney(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(number, 1000)) : 0;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function statusToDb(value: unknown) {
  if (value === "Ativa" || value === "active") return "active";
  if (value === "Pausada" || value === "paused") return "paused";
  return "cancelled";
}

function statusFromDb(value: unknown) {
  if (value === "active") return "Ativa";
  if (value === "paused") return "Pausada";
  return "Cancelamento agendado";
}

function cadenceToPlanLabel(value: unknown) {
  return value === "quarterly" ? "Trimestral" : "Mensal";
}

function petLabelFromSpecies(value: unknown) {
  return value === "cat" ? "Gato" : "Cão";
}

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

async function ordersWithProfiles(client: SupabaseAdminClient) {
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

async function subscriptionOptions(client: SupabaseAdminClient) {
  const [{ data: profiles, error: profilesError }, { data: pets, error: petsError }, { data: plans, error: plansError }] = await Promise.all([
    client.from("profiles").select("user_id,email,full_name").order("full_name", { ascending: true }),
    client.from("pets").select("id,user_id,name,species,size").order("created_at", { ascending: true }),
    client.from("plans").select("id,name,cadence,price").eq("is_active", true).order("price", { ascending: true })
  ]);

  if (profilesError) throw profilesError;
  if (petsError) throw petsError;
  if (plansError) throw plansError;

  return {
    profiles: profiles || [],
    pets: pets || [],
    plans: plans || []
  };
}

function subscriptionFromRow(row: any, options: Awaited<ReturnType<typeof subscriptionOptions>>) {
  const profile = options.profiles.find((item: any) => item.user_id === row.user_id);
  const pet = options.pets.find((item: any) => item.id === row.pet_id);
  const plan = options.plans.find((item: any) => item.id === row.plan_id);
  const cadence = row.cadence || plan?.cadence || "monthly";

  return {
    id: row.id,
    userId: row.user_id,
    userEmail: profile?.email || "",
    customer: profile?.full_name || profile?.email || row.user_id,
    petId: row.pet_id || "",
    pet: petLabelFromSpecies(pet?.species),
    planId: row.plan_id || "",
    cadence,
    plan: cadenceToPlanLabel(cadence),
    nextBoxDate: row.next_box_date || "",
    renewal: row.renewal_date || "",
    status: statusFromDb(row.status),
    value: Number(row.price || plan?.price || 0),
    extras: row.extras || ""
  };
}

async function subscriptionsWithDetails(client: SupabaseAdminClient) {
  const options = await subscriptionOptions(client);
  const { data, error } = await client
    .from("customer_subscriptions")
    .select("id,user_id,pet_id,plan_id,cadence,status,next_box_date,renewal_date,price,extras,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return {
    data: (data || []).map((row: any) => subscriptionFromRow(row, options)),
    users: options.profiles.map((profile: any) => ({
      id: profile.user_id,
      name: profile.full_name || profile.email || "Cliente sem nome",
      email: profile.email || ""
    })),
    pets: options.pets.map((pet: any) => ({
      id: pet.id,
      userId: pet.user_id,
      name: pet.name || "Animal sem nome",
      species: pet.species,
      size: pet.size
    })),
    plans: options.plans.map((plan: any) => ({
      id: plan.id,
      name: plan.name,
      cadence: plan.cadence,
      price: Number(plan.price || 0)
    }))
  };
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

  if (resource === "subscriptions") {
    try {
      return NextResponse.json(await subscriptionsWithDetails(client));
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

  if (body.resource === "subscriptions") {
    const item = body.item || {};
    const id = cleanString(item.id, 80);
    const userId = cleanString(item.userId || item.user_id, 80);
    const planId = cleanString(item.planId || item.plan_id, 120);
    const petId = cleanString(item.petId || item.pet_id, 80);

    if (!userId) return NextResponse.json({ error: "Escolha um cliente registado." }, { status: 400 });
    if (!planId) return NextResponse.json({ error: "Escolha um plano." }, { status: 400 });

    const { data: plan, error: planError } = await client.from("plans").select("id,cadence,price").eq("id", planId).maybeSingle();
    if (planError) return NextResponse.json({ error: planError.message }, { status: 500 });
    if (!plan) return NextResponse.json({ error: "Plano invalido." }, { status: 400 });

    if (petId) {
      const { data: pet, error: petError } = await client.from("pets").select("id,user_id").eq("id", petId).maybeSingle();
      if (petError) return NextResponse.json({ error: petError.message }, { status: 500 });
      if (!pet || pet.user_id !== userId) return NextResponse.json({ error: "O animal escolhido nao pertence a este cliente." }, { status: 400 });
    }

    const payload = {
      user_id: userId,
      pet_id: petId || null,
      plan_id: planId,
      cadence: plan.cadence,
      status: statusToDb(item.status),
      next_box_date: cleanString(item.nextBoxDate || item.next_box_date, 20) || null,
      renewal_date: cleanString(item.renewal || item.renewal_date, 20) || null,
      price: safeMoney(item.value ?? item.price ?? plan.price),
      extras: cleanString(item.extras, 500) || null
    };

    const query = id && isUuid(id)
      ? client.from("customer_subscriptions").update(payload).eq("id", id).select("id").single()
      : client.from("customer_subscriptions").insert(payload).select("id").single();

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    try {
      const subscriptions = await subscriptionsWithDetails(client);
      return NextResponse.json({ data: subscriptions.data.find((subscription: any) => subscription.id === data.id) || null });
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

  if (resource === "subscriptions") {
    const { error } = await client.from("customer_subscriptions").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Recurso invalido." }, { status: 400 });
}
