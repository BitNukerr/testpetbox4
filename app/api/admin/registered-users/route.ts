import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminAccessAllowed(request: NextRequest) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || "petbox-admin";
  return request.headers.get("x-admin-access-code") === expected;
}

function displayName(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return "";
  const fullName = metadata.full_name || metadata.name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();

  const parts = [metadata.first_name, metadata.last_name].filter((part) => typeof part === "string" && part.trim());
  return parts.join(" ").trim();
}

export async function GET(request: NextRequest) {
  if (!adminAccessAllowed(request)) {
    return NextResponse.json({ error: "Acesso nao autorizado." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      configured: false,
      users: [],
      error: "Adicione SUPABASE_SERVICE_ROLE_KEY nas variaveis de ambiente da Vercel para listar utilizadores registados."
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    return NextResponse.json({ configured: true, users: [], error: error.message }, { status: 500 });
  }

  const users = data.users.map((user) => ({
    id: user.id,
    name: displayName(user.user_metadata) || "Sem nome",
    email: user.email || "Sem email",
    phone: user.phone || "",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    emailConfirmedAt: user.email_confirmed_at,
    metadata: user.user_metadata || {}
  }));

  return NextResponse.json({ configured: true, users });
}
