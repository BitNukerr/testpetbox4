import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, adminCodeMatches, adminSessionCanBeCreated, createAdminSessionToken, requestHasAdminSession } from "@/lib/admin-auth";
import { rateLimit, requestIsSameOrigin } from "@/lib/request-security";

export const dynamic = "force-dynamic";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge
  };
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: requestHasAdminSession(request) });
}

export async function POST(request: NextRequest) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Pedido invalido." }, { status: 403 });
  }

  const limited = rateLimit(request, "admin-session", { limit: 8, windowMs: 15 * 60 * 1000 });
  if (limited.limited) {
    return NextResponse.json({ error: "Demasiadas tentativas. Tente novamente mais tarde." }, { status: 429, headers: { "Retry-After": String(limited.retryAfter) } });
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.slice(0, 240) : "";

  if (!adminCodeMatches(code)) {
    return NextResponse.json({ error: "Codigo de acesso invalido." }, { status: 401 });
  }

  if (!adminSessionCanBeCreated()) {
    return NextResponse.json({ error: "Configure ADMIN_SESSION_SECRET no Vercel." }, { status: 500 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), cookieOptions(ADMIN_SESSION_MAX_AGE));
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!requestIsSameOrigin(request)) {
    return NextResponse.json({ error: "Pedido invalido." }, { status: 403 });
  }

  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", cookieOptions(0));
  return response;
}
