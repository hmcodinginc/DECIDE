export class AuthRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export function isAuthenticationFailure(error: unknown): boolean {
  if (error instanceof AuthRequiredError) return true;
  const message = errorText(error);
  const code = errorCode(error);
  const lower = `${message} ${code}`.toLowerCase();
  return (
    lower.includes("authentication required") ||
    lower.includes("authentication failed") ||
    lower.includes("not authenticated") ||
    lower.includes("unauthorized") ||
    lower.includes("jwt expired") ||
    lower.includes("invalid jwt") ||
    code === "401" ||
    code === "PGRST301"
  );
}

export function toUserMessage(error: unknown, fallback: string): string {
  const message = errorText(error);
  const code = errorCode(error);
  const lower = `${message} ${code}`.toLowerCase();

  if (lower.includes("invalid login")) return "Email or password is incorrect.";
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered") ||
    lower.includes("email exists") ||
    code === "email_exists" ||
    code === "user_already_exists"
  ) {
    return "That email already has an account. Log in instead.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email, then log in.";
  }
  if (
    lower.includes("signups not allowed") ||
    lower.includes("signup is disabled") ||
    code === "signup_disabled"
  ) {
    return "New accounts aren't being accepted right now.";
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("over_email_send_rate_limit") ||
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    code === "429"
  ) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (
    lower.includes("password") &&
    (lower.includes("weak") ||
      lower.includes("pwned") ||
      lower.includes("too short") ||
      lower.includes("should contain") ||
      code === "weak_password")
  ) {
    return "That password doesn't meet DECIDE's requirements. Use 8+ characters with upper, lower, a number, and a symbol.";
  }
  if (
    lower.includes("database error") ||
    lower.includes("saving new user") ||
    lower.includes("error saving user")
  ) {
    return "Account creation hit a database error. If this continues, check the Supabase Auth logs.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Google sign-in isn't configured yet. Please use email and password.";
  }
  if (lower.includes("not connected") || lower.includes("auth redirect origin")) {
    return "Authentication isn't connected yet. Add your Supabase URL and anon key locally.";
  }
  if (lower.includes("unable to validate email") || code === "email_address_invalid") {
    return "That email isn't valid.";
  }
  if (
    lower.includes("invalid api key") ||
    lower.includes("invalid_api_key") ||
    lower.includes("no api key")
  ) {
    return "DECIDE can't reach Auth. Check the Supabase project URL and anon key.";
  }
  if (lower.includes("error sending") && (lower.includes("confirmation") || lower.includes("email"))) {
    return "The confirmation email couldn't be sent. Check Supabase Auth email settings.";
  }
  if (
    isAuthenticationFailure(error) ||
    (lower.includes("session") && lower.includes("expired"))
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

  if (isSafePublicMessage(message)) return message;
  return fallback;
}

function isSafePublicMessage(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3 || trimmed.length > 180) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("service_role") ||
    lower.includes("bearer ") ||
    lower.includes("apikey") ||
    lower.includes("jwt") ||
    lower.includes("refresh_token") ||
    lower.includes("access_token")
  ) {
    return false;
  }
  return true;
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
    for (const key of ["code", "error_code", "status"] as const) {
      if (key in error) {
        const code = (error as Record<string, unknown>)[key];
        if (typeof code === "string" || typeof code === "number") return String(code);
      }
    }
  }
  return "";
}
