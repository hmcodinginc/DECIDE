import { ROUTES } from "@/config/routes";

const STORAGE_KEY = "decide:post-auth-next";
const MAX_AGE_MS = 15 * 60 * 1000;

const BLOCKED_PREFIXES = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.resetPassword,
  ROUTES.authCallback,
];

export function readSafeNext(
  raw: string | null | undefined,
  fallback = ROUTES.app,
): string {
  if (!raw) return fallback;
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    // already decoded
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback;
  }
  if (path.includes("://") || path.includes("\\")) return fallback;
  const pathname = path.split("?")[0] ?? path;
  if (
    BLOCKED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return fallback;
  }
  return path;
}

export function authHref(mode: "login" | "signup", next: string): string {
  const safe = readSafeNext(next);
  const route = mode === "login" ? ROUTES.login : ROUTES.signup;
  return `${route}?next=${encodeURIComponent(safe)}`;
}

export function billingPathForPlan(plan: "pro" | "premium"): string {
  return `${ROUTES.billing}?plan=${plan}`;
}

export function rememberAuthNext(path: string) {
  const safe = readSafeNext(path);
  const payload = JSON.stringify({ path: safe, at: Date.now() });
  try {
    sessionStorage.setItem(STORAGE_KEY, payload);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // quota / private mode
  }
}

export function consumeAuthNext(): string | null {
  const now = Date.now();
  let found: string | null = null;
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      storage.removeItem(STORAGE_KEY);
      if (!raw || found) continue;
      const parsed = JSON.parse(raw) as { path?: string; at?: number };
      if (typeof parsed.at === "number" && now - parsed.at > MAX_AGE_MS) continue;
      const safe = readSafeNext(parsed.path, "");
      found = safe || null;
    } catch {
      try {
        storage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
  return found;
}
