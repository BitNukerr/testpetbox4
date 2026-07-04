import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/request-security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "site-home", { limit: 300, windowMs: 10 * 60 * 1000 });
  if (limited.limited) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const client = getSupabaseAdmin();
  if (!client) {
    return NextResponse.json({ error: "Homepage remota indisponivel." }, { status: 503 });
  }

  const { data, error } = await client.from("home_settings").select("settings").eq("id", true).maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { settings: data?.settings || {} },
    { headers: { "Cache-Control": "no-store" } }
  );
}
