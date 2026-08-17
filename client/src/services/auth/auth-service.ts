import { SITE_URL } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/auth";
import type { Session, User } from "@supabase/supabase-js";

export function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata as { full_name?: string; name?: string };
  return {
    id: user.id,
    email: user.email ?? null,
    displayName: metadata.full_name ?? metadata.name ?? null,
  };
}

export const authService = {
  configured: isSupabaseConfigured,

  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  },

  async signInWithPassword(email: string, password: string) {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signUp(email: string, password: string) {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${SITE_URL}${ROUTES.authCallback}` },
    });
    if (error) throw error;
  },

  async signInWithGoogle() {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${SITE_URL}${ROUTES.authCallback}` },
    });
    if (error) throw error;
  },

  async resetPassword(email: string) {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}${ROUTES.resetPassword}`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
