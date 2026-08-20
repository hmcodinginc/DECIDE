import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export { isSupabaseConfigured, supabaseUrl, supabaseAnonKey };

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "decide-auth",
      },
    })
  : null;
