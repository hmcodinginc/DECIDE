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
    lower.includes("validation_failed") ||
    lower.includes("validation failed")
  ) {
    return "Google sign-in isn't configured yet. Please use email and password.";
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

function unwrapJsonMessage(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return text;
  try {
    const parsed = JSON.parse(trimmed) as {
      msg?: unknown;
      message?: unknown;
      error_description?: unknown;
      error?: unknown;
    };
    for (const value of [parsed.msg, parsed.message, parsed.error_description, parsed.error]) {
      if (typeof value === "string" && value.trim()) return value;
    }
  } catch {
    return text;
  }
  return text;
}

function errorText(error: unknown): string {
  if (typeof error === "string") return unwrapJsonMessage(error);
  if (error instanceof Error) return unwrapJsonMessage(error.message);
  if (typeof error === "object" && error) {
    for (const key of ["msg", "message", "error_description", "error"] as const) {
      if (key in error) {
        const value = (error as Record<string, unknown>)[key];
        if (typeof value === "string") return unwrapJsonMessage(value);
      }
    }
  }
  return "";
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error) {
    for (const key of ["code", "error_code"] as const) {
      if (key in error) {
        const code = (error as Record<string, unknown>)[key];
        if (typeof code === "string" || typeof code === "number") return String(code);
      }
    }
  }
  return "";
}
