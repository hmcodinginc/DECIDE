export function toUserMessage(error: unknown, fallback: string): string {
  const message = errorText(error);
  const code = errorCode(error);
  const lower = `${message} ${code}`.toLowerCase();

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
  if (
    lower.includes("not authenticated") ||
    lower.includes("jwt expired") ||
    lower.includes("invalid jwt") ||
    (lower.includes("session") && lower.includes("expired")) ||
    code === "401" ||
    code === "PGRST301"
  ) {
    return "You're not signed in. Log in and try again.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network") || code === "ENOTFOUND") {
    return "We couldn't reach DECIDE's servers. Check your connection and try again.";
  }
  if (lower.includes("row-level security") || lower.includes("rls") || code === "42501") {
    return "We couldn't save this usage. Sign in again and retry.";
  }
  if (
    lower.includes("foreign key") ||
    lower.includes("violates foreign key") ||
    code === "23503"
  ) {
    return "We couldn't record this decision. Try again.";
  }
  if (lower.includes("decision not found") || lower.includes("couldn't save this decision")) {
    return "We couldn't save this decision. Try again.";
  }
  if (
    lower.includes("could not find the function") ||
    lower.includes("schema cache") ||
    code === "PGRST202" ||
    code === "42883"
  ) {
    return "The database isn't ready yet. Wait for the Supabase migration on main, then retry.";
  }

  return fallback;
}

function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error && "code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" || typeof code === "number") return String(code);
  }
  return "";
}
