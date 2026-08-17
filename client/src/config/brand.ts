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
