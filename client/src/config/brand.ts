export const BRAND = {
  name: "DECIDE",
  domain: "decide.hmcoding.com",
  url: "https://decide.hmcoding.com",
  tagline: "Stop comparing. Get a decision.",
  promise: "Too many choices. One clear answer.",
} as const;

export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") || "https://decide.hmcoding.com";
