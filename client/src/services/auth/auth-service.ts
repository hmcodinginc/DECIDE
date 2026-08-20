import { authRedirectUrl } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/auth";
import type { Session, User } from "@supabase/supabase-js";

function jwtExpiry(token: string): number | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const padded = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(
      atob(padded + "=".repeat((4 - (padded.length % 4)) % 4)),
    ) as { exp?: number };
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

export function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata as {
    full_name?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
  };
  const combined =
    metadata.first_name && metadata.last_name
      ? `${metadata.first_name} ${metadata.last_name}`.replace(/\s+/g, " ").trim()
      : null;
  return {
    id: user.id,
    email: user.email ?? null,
    displayName: metadata.full_name ?? metadata.name ?? combined ?? null,
  };
}

export const authService = {
  configured: isSupabaseConfigured,

  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Wait for persisted-session recovery, then validate/refresh the JWT.
   * `getSession()` alone can return an expired local session.
   */
  async loadInitialAuth(): Promise<AuthUser | null> {
    if (!supabase) return null;
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData.session?.user ?? null;
    if (!sessionUser) return null;

    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) return toAuthUser(data.user);

    const message = (error?.message ?? "").toLowerCase();
    const isAuthError =
      error?.status === 401 ||
      message.includes("jwt") ||
      message.includes("expired") ||
      message.includes("invalid") ||
      message.includes("session");
    if (isAuthError) {
      await supabase.auth.signOut().catch(() => undefined);
      return null;
    }
    return toAuthUser(sessionUser);
  },

  /** Refresh if needed and return a JWT that Edge Functions will accept. */
  async getValidAccessToken(): Promise<string | null> {
    const prepared = await this.prepareCheckoutAuth();
    return prepared?.accessToken ?? null;
  },

  async prepareCheckoutAuth(): Promise<{
    accessToken: string;
    userId: string;
  } | null> {
    if (!supabase) return null;

    const { data: sessionData } = await supabase.auth.getSession();
    let session = sessionData.session;
    if (!session?.access_token || !session.user) return null;

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return null;
    if (userData.user.id !== session.user.id) return null;

    let token = session.access_token;
    const exp = jwtExpiry(token);
    const now = Math.floor(Date.now() / 1000);
    if (exp != null && exp <= now + 30) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshed.session?.access_token) return null;
      const { data: again, error: againError } = await supabase.auth.getUser();
      if (againError || !again.user || again.user.id !== refreshed.session.user.id) {
        return null;
      }
      session = refreshed.session;
      token = refreshed.session.access_token;
    }

    if (token.startsWith("sb_") || !token.includes(".")) return null;

    return {
      accessToken: token,
      userId: userData.user.id,
    };
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

  async signUp(
    email: string,
    password: string,
    names: { firstName: string; lastName: string },
  ) {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const fullName = `${names.firstName} ${names.lastName}`.replace(/\s+/g, " ").trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authRedirectUrl(ROUTES.authCallback),
        data: {
          first_name: names.firstName,
          last_name: names.lastName,
          full_name: fullName,
          name: fullName,
        },
      },
    });
    if (error) throw error;
    return { session: data.session };
  },

  async resetPassword(email: string) {
    if (!supabase) throw new Error("Authentication is not connected yet.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl(ROUTES.resetPassword),
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
