"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function getConfigError() {
  if (!supabaseUrl || !supabaseKey) {
    return "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
  }

  try {
    const url = new URL(supabaseUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "NEXT_PUBLIC_SUPABASE_URL deve começar por https://.";
    }
    if (url.hostname === "your-project.supabase.co") {
      return "Substitua o valor temporário de NEXT_PUBLIC_SUPABASE_URL pelo URL do seu projecto Supabase.";
    }
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL não é um URL válido.";
  }

  if (["your_supabase_publishable_key", "your_supabase_anon_key"].includes(supabaseKey)) {
    return "Substitua a chave temporária da Supabase pela chave publicável.";
  }

  return "";
}

export const supabaseConfigError = getConfigError();

export const supabase: SupabaseClient | null = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseKey);

export function isSupabaseConfigured() {
  return !supabaseConfigError;
}
