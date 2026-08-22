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
  fallback: string = ROUTES.app,
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

export type AuthGateReason = "limit" | "account";

export function authHref(
  mode: "login" | "signup",
  next: string,
  extra?: { reason?: string | null },
): string {
  const safe = readSafeNext(next);
  const route = mode === "login" ? ROUTES.login : ROUTES.signup;
  const params = new URLSearchParams();
  params.set("next", safe);
  if (extra?.reason === "limit" || extra?.reason === "account") {
    params.set("reason", extra.reason);
  }
  return `${route}?${params.toString()}`;
}

export function hasAnalysisLimitReason(params: URLSearchParams): boolean {
  return readAuthGateReason(params) === "limit";
}

export function authReasonForDestination(
  pathname: string,
  search = "",
): AuthGateReason | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  if (params.get("reason") === "limit") return "limit";
  if (pathname === ROUTES.newDecision) return "account";
  return null;
}

export function readAuthGateReason(params: URLSearchParams): AuthGateReason | null {
  const explicit = params.get("reason");
  if (explicit === "limit") return "limit";
  if (explicit === "account") return "account";
  const next = params.get("next");
  if (!next) return null;
  const safe = readSafeNext(next, "");
  if (!safe) return null;
  const pathname = safe.split("?")[0] ?? "";
  const query = safe.includes("?") ? (safe.split("?")[1] ?? "") : "";
  if (new URLSearchParams(query).get("reason") === "limit") return "limit";
  if (pathname === ROUTES.newDecision) return "account";
  return null;
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
