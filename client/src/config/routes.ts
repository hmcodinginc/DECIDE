export const ROUTES = {
  home: "/",
  app: "/app",
  newDecision: "/app/new",
  decision: (id: string) => `/app/decision/${id}`,
  history: "/app/history",
  pricing: "/pricing",
  login: "/login",
  signup: "/signup",
  resetPassword: "/reset-password",
  authCallback: "/auth/callback",
  settings: "/settings",
  billing: "/billing",
} as const;
