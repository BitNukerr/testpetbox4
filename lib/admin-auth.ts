import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "petbox-admin-session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function adminCode() {
  const code = process.env.ADMIN_ACCESS_CODE;
  if (code) return code;
  return process.env.NODE_ENV === "production" ? "" : "petbox-admin";
}

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EASYPAY_API_KEY || adminCode();
}

function sign(value: string) {
  return createHmac("sha256", adminSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function adminCodeMatches(value: string) {
  const code = adminCode();
  return Boolean(code) && safeEqual(value.trim(), code);
}

export function createAdminSessionToken() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidAdminSessionToken(token?: string) {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  if (!safeEqual(signature, sign(issuedAt))) return false;
  const age = Date.now() - Number(issuedAt);
  return Number.isFinite(age) && age >= 0 && age <= ADMIN_SESSION_MAX_AGE * 1000;
}

export function requestHasAdminSession(request: NextRequest) {
  return isValidAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
