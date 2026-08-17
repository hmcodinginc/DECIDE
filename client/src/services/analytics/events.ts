import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export type ProductEvent =
  | "landing_view"
  | "decision_started"
  | "decision_completed"
  | "decision_saved"
  | "free_limit_reached"
  | "pricing_viewed"
  | "checkout_started"
  | "subscription_created";

export async function track(name: ProductEvent, properties: Record<string, string | number | boolean | null> = {}) {
  if (!supabase || !isSupabaseConfigured) return;
  await supabase.from("product_events").insert({
    name,
    properties,
  });
}
