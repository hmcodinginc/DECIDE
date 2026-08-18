export const BRAND = {
  name: "DECIDE",
  domain: "decide.hmcoding.com",
  url: "https://decide.hmcoding.com",
  tagline: "Stop comparing. Get a decision.",
  promise: "Too many choices. One clear answer.",
} as const;

const configuredSite = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");

export const SITE_URL =
  configuredSite ||
  (import.meta.env.DEV ? "http://localhost:5173" : "https://decide.hmcoding.com");

/**
 * Auth emails/OAuth must return to the origin the user is actually on.
 * Do not fall back to VITE_SITE_URL here — that would send local signups
 * to production if window were unavailable.
 */
export function authRedirectOrigin(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    if (origin.startsWith("http://") || origin.startsWith("https://")) return origin;
  }
  throw new Error("Auth redirect origin is not available.");
}

export function authRedirectUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${authRedirectOrigin()}${normalized}`;
}
