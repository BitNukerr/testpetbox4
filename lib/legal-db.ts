import { createClient } from "@supabase/supabase-js";
import { defaultLegalSettings, mergeLegalSettings, type LegalPageKey, type LegalSettings } from "@/lib/legal-content";

function publicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function loadLegalSettings(): Promise<LegalSettings> {
  const client = publicSupabase();
  if (!client) return defaultLegalSettings;

  try {
    const { data, error } = await client.from("legal_settings").select("settings").eq("id", true).maybeSingle();
    if (error) return defaultLegalSettings;
    return mergeLegalSettings(data?.settings || null);
  } catch {
    return defaultLegalSettings;
  }
}

export async function loadLegalPage(key: LegalPageKey) {
  const settings = await loadLegalSettings();
  return settings[key];
}
