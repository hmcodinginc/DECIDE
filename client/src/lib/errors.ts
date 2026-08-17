export function toUserMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("invalid login")) return "Email or password is incorrect.";
  if (lower.includes("user already registered")) {
    return "That email already has an account. Log in instead.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email, then log in.";
  }
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider") ||
    lower.includes("validation failed")
  ) {
    return "Google sign-in isn't configured yet. Use email instead.";
  }
  if (lower.includes("not connected")) {
    return "Authentication isn't connected yet. Add your Supabase URL and anon key locally.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "We couldn't reach DECIDE's servers. Check your connection and try again.";
  }
  if (lower.includes("row-level security") || lower.includes("rls")) {
    return fallback;
  }
  if (lower.includes("could not find the function") || lower.includes("schema cache")) {
    return "The database isn't ready yet. Wait for the Supabase migration on main, then retry.";
  }

  return fallback;
}
