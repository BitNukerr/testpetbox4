"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

function getConfigError() {
  if (!supabaseUrl || !supabaseKey) {
    return "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
  }

  try {
    const url = new URL(supabaseUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "NEXT_PUBLIC_SUPABASE_URL must start with https://.";
    }
    if (url.hostname === "your-project.supabase.co") {
      return "Replace the placeholder NEXT_PUBLIC_SUPABASE_URL with your Supabase project URL.";
    }
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL is not a valid URL.";
  }

  if (["your_supabase_publishable_key", "your_supabase_anon_key"].includes(supabaseKey)) {
    return "Replace the placeholder Supabase key with your publishable key.";
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
