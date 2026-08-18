const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
const publicKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

export const supabaseUrl = url;
export const supabaseAnonKey = publicKey;
export const isSupabaseConfigured = Boolean(url && publicKey);
