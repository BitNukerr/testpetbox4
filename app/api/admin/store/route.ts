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
