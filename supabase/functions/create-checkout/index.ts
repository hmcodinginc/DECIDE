import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import postgres from "npm:postgres@3.4.7";
import { withSupabase } from "npm:@supabase/server@1.4.1";
import https from "node:https";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** UPI Autopay / QR rejects mandate windows longer than ~12 monthly cycles. */
const UPI_AUTOPAY_MAX_MONTHLY_TOTAL_COUNT = 12;
const CONTINUABLE_STATUSES = new Set(["created", "authenticated", "pending"]);
const BLOCKING_RAZORPAY_STATUSES = new Set(["active", "halted"]);
const TERMINAL_RAZORPAY_STATUSES = new Set(["cancelled", "completed", "expired"]);

type PaidPlan = "pro" | "premium";

type RazorpaySubscription = {
  id: string;
  status?: string;
  plan_id?: string;
  total_count?: number;
};

type SubscriptionRow = {
  plan?: string | null;
  status?: string | null;
  razorpay_subscription_id?: string | null;
  razorpay_customer_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
};

/**
 * User auth uses @supabase/server. Admin DB uses the same service-role client
 * as razorpay-webhook, bound to the pre-SDK fetch so the caller JWT cannot be
 * attached to PostgREST (that produced "permission denied for table subscriptions").
 */
const authenticatedCheckout = withSupabase(
  {
    auth: "user",
    cors: { headers: cors },
  },
  async (req, ctx) => {
    const userId = ctx.userClaims?.id ?? ctx.jwtClaims?.sub;
    if (!userId) {
      return json(
        {
          error: "Authentication failed",
          authCode: "missing_user_id",
          authStatus: 401,
          authMessage: "Authenticated context has no user id",
        },
        401,
      );
    }

    let stage = "parse_body";
    try {
      const body = (await req.json()) as { plan?: string };
      if (body.plan !== "pro" && body.plan !== "premium") {
        return json({ error: "Unknown plan" }, 400);
      }
      const paidPlan: PaidPlan = body.plan;

      stage = "config";
      const razorpayKeyId = (Deno.env.get("RAZORPAY_KEY_ID") ?? "").trim();
      const razorpaySecret = (Deno.env.get("RAZORPAY_KEY_SECRET") ?? "").trim();
      const planPro = (Deno.env.get("RAZORPAY_PLAN_PRO") ?? "").trim();
      const planPremium = (Deno.env.get("RAZORPAY_PLAN_PREMIUM") ?? "").trim();
      const providerPlanId = paidPlan === "pro" ? planPro : planPremium;
      if (!razorpayKeyId || !razorpaySecret || !providerPlanId) {
        return json({ error: "Billing is not configured." }, 503);
      }

      stage = "subscription_lookup";
      const lookedUp = await lookupSubscription(userId);
      if (lookedUp.error) {
        return json(
          {
            error: `subscription lookup: ${sanitizePublicMessage(lookedUp.error)}`,
            stage,
            tried: lookedUp.tried.map(sanitizePublicMessage),
          },
          500,
        );
      }
      const currentRow = lookedUp.row;

      if (isLivePaidSubscription(currentRow)) {
        return json({ error: "You already have an active DECIDE subscription." }, 409);
      }

      stage = "razorpay";
      const totalCount = getSubscriptionTotalCount();
      let subscription: RazorpaySubscription;
      try {
        subscription = await resolveCheckoutSubscription({
          keyId: razorpayKeyId,
          secret: razorpaySecret,
          existingId: asNonEmptyString(currentRow?.razorpay_subscription_id),
          providerPlanId,
          totalCount,
          userId,
          plan: paidPlan,
        });
      } catch (error) {
        const razorpayKeyMode = razorpayKeyId.startsWith("rzp_live_")
          ? "live"
          : razorpayKeyId.startsWith("rzp_test_")
          ? "test"
          : "unknown";
        return json(
          {
            error: sanitizePublicMessage((error as Error).message || "Razorpay request failed."),
            stage: "razorpay",
            razorpayKeyMode,
            razorpayKeyIdLength: razorpayKeyId.length,
            razorpaySecretLength: razorpaySecret.length,
            razorpayKeyIdLooksSwapped: razorpayKeyId.length > 0 && !razorpayKeyId.startsWith("rzp_"),
            razorpaySecretLooksSwapped: razorpaySecret.startsWith("rzp_"),
            planIdLooksValid: providerPlanId.startsWith("plan_"),
            lookupTried: lookedUp.tried.map(sanitizePublicMessage),
          },
          500,
        );
      }

      stage = "subscription_upsert";
      const upserted = await upsertSubscription({
        userId,
        plan: paidPlan,
        razorpaySubscriptionId: subscription.id,
      });
      if (upserted.error) {
        return json(
          {
            error: `subscription upsert: ${sanitizePublicMessage(upserted.error)}`,
            stage,
            tried: upserted.tried.map(sanitizePublicMessage),
          },
          500,
        );
      }

      return json({
        keyId: razorpayKeyId,
        subscriptionId: subscription.id,
        name: "DECIDE",
        description:
          paidPlan === "pro" ? "DECIDE Pro — 25 decisions/month" : "DECIDE Premium — unlimited",
        prefillEmail: ctx.userClaims?.email,
      });
    } catch (error) {
      const message = (error as Error).message || "Checkout failed.";
      return json({ error: sanitizePublicMessage(message), stage }, 500);
    }
  },
);

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  const response = await authenticatedCheckout(req);
  if (response.status === 401) {
    let body: { code?: string; error?: string; message?: string } = {};
    try {
      body = (await response.clone().json()) as typeof body;
    } catch {
      body = {};
    }
    return authFailed({
      status: 401,
      code: body.code ?? body.error ?? "unauthenticated",
      message: body.message ?? body.error ?? "Authentication failed",
    });
  }
  return response;
}

export default { fetch: handler };
if (typeof Deno !== "undefined" && typeof Deno.serve === "function") {
  Deno.serve(handler);
}

function createAdminDbClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch },
  });
}

function serviceRoleHeaders(): Record<string, string> | null {
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!serviceRole) return null;
  return {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
  };
}

function isRestUnusable(message: string | undefined): boolean {
  const lower = (message ?? "").toLowerCase();
  return (
    lower.includes("permission denied") ||
    lower.includes("authentication failed") ||
    lower.includes("invalid jwt") ||
    lower.includes("invalid api key")
  );
}

function createSql() {
  const dbUrl = Deno.env.get("SUPABASE_DB_URL") ?? "";
  if (!dbUrl) return null;
  return postgres(dbUrl, {
    ssl: "require",
    max: 1,
    idle_timeout: 5,
    connect_timeout: 8,
    prepare: false,
  });
}

async function restJson(
  pathAndQuery: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; data: unknown; error: string | null }> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const headers = serviceRoleHeaders();
  if (!url || !headers) {
    return { ok: false, status: 0, data: null, error: "Billing is not configured." };
  }
  try {
    const response = await fetch(`${url}${pathAndQuery}`, {
      ...init,
      headers: {
        ...headers,
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok) {
      const record = data && typeof data === "object" ? data as Record<string, unknown> : {};
      const message = String(record.message ?? record.error ?? `HTTP ${response.status}`);
      return { ok: false, status: response.status, data, error: message };
    }
    return { ok: true, status: response.status, data, error: null };
  } catch (error) {
    return { ok: false, status: 0, data: null, error: (error as Error).message || "rest request failed" };
  }
}

async function lookupSubscription(
  userId: string,
): Promise<{ row: SubscriptionRow | null; error: string | null; tried: string[] }> {
  const tried: string[] = [];
  try {
    return await lookupSubscriptionInner(userId, tried);
  } catch (error) {
    const message = (error as Error).message || "subscription lookup failed";
    tried.push(`unhandled:${message}`);
    return { row: null, error: message, tried };
  }
}

async function lookupSubscriptionInner(
  userId: string,
  tried: string[],
): Promise<{ row: SubscriptionRow | null; error: string | null; tried: string[] }> {

  const rest = await restJson(
    `/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=plan,status,razorpay_subscription_id,razorpay_customer_id,current_period_start,current_period_end`,
    { method: "GET" },
  );
  tried.push(`serviceRoleRest:${rest.error ?? "ok"}`);
  if (rest.ok) {
    const rows = rest.data;
    const row = Array.isArray(rows) ? (rows[0] ?? null) : rows;
    return { row: (row ?? null) as SubscriptionRow | null, error: null, tried };
  }

  const admin = createAdminDbClient();
  if (admin) {
    try {
      const { data, error } = await admin
        .from("subscriptions")
        .select(
          "plan, status, razorpay_subscription_id, razorpay_customer_id, current_period_start, current_period_end",
        )
        .eq("user_id", userId)
        .maybeSingle();
      tried.push(`serviceRoleClient:${error?.message ?? "ok"}`);
      if (!error) return { row: (data ?? null) as SubscriptionRow | null, error: null, tried };
      if (!isRestUnusable(error.message)) {
        return { row: null, error: error.message, tried };
      }
    } catch (error) {
      tried.push(`serviceRoleClient:${(error as Error).message || "threw"}`);
    }
  } else {
    tried.push("serviceRoleClient:missing_env");
  }

  let sql;
  try {
    sql = createSql();
  } catch (error) {
    const message = (error as Error).message || "postgres connect failed";
    tried.push(`postgres_connect:${message}`);
    return { row: null, error: rest.error ?? message, tried };
  }
  if (!sql) {
    return { row: null, error: rest.error ?? "Billing is not configured.", tried };
  }
  try {
    const rows = await sql<SubscriptionRow[]>`
      select plan, status, razorpay_subscription_id, razorpay_customer_id, current_period_start, current_period_end
      from public.subscriptions
      where user_id = ${userId}::uuid
      limit 1
    `;
    tried.push("postgres:ok");
    return { row: rows[0] ?? null, error: null, tried };
  } catch (error) {
    const message = (error as Error).message || "subscription lookup failed";
    tried.push(`postgres:${message}`);
    return { row: null, error: message, tried };
  } finally {
    await sql.end({ timeout: 2 });
  }
}

async function upsertSubscription(input: {
  userId: string;
  plan: PaidPlan;
  razorpaySubscriptionId: string;
}): Promise<{ error: string | null; tried: string[] }> {
  const tried: string[] = [];
  const rest = await restJson("/rest/v1/subscriptions?on_conflict=user_id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: input.userId,
      plan: input.plan,
      status: "none",
      razorpay_subscription_id: input.razorpaySubscriptionId,
      updated_at: new Date().toISOString(),
    }),
  });
  tried.push(`serviceRoleRest:${rest.error ?? "ok"}`);
  if (rest.ok) return { error: null, tried };

  const admin = createAdminDbClient();
  if (admin) {
    try {
      const { error } = await admin.from("subscriptions").upsert(
        {
          user_id: input.userId,
          plan: input.plan,
          status: "none",
          razorpay_subscription_id: input.razorpaySubscriptionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      tried.push(`serviceRoleClient:${error?.message ?? "ok"}`);
      if (!error) return { error: null, tried };
      if (!isRestUnusable(error.message)) return { error: error.message, tried };
    } catch (error) {
      tried.push(`serviceRoleClient:${(error as Error).message || "threw"}`);
    }
  } else {
    tried.push("serviceRoleClient:missing_env");
  }

  let sql;
  try {
    sql = createSql();
  } catch (error) {
    const message = (error as Error).message || "postgres connect failed";
    tried.push(`postgres_connect:${message}`);
    return { error: rest.error ?? message, tried };
  }
  if (!sql) return { error: rest.error ?? "Billing is not configured.", tried };
  try {
    await sql`
      insert into public.subscriptions (user_id, plan, status, razorpay_subscription_id, updated_at)
      values (${input.userId}::uuid, ${input.plan}, 'none', ${input.razorpaySubscriptionId}, now())
      on conflict (user_id) do update set
        plan = excluded.plan,
        status = excluded.status,
        razorpay_subscription_id = excluded.razorpay_subscription_id,
        updated_at = excluded.updated_at
    `;
    tried.push("postgres:ok");
    return { error: null, tried };
  } catch (error) {
    const message = (error as Error).message || "subscription upsert failed";
    tried.push(`postgres:${message}`);
    return { error: message, tried };
  } finally {
    await sql.end({ timeout: 2 });
  }
}

function authFailed(error: { status?: number; code?: string; message?: string } | null) {
  return json(
    {
      error: "Authentication failed",
      authCode: error?.code ?? "unauthenticated",
      authStatus: error?.status ?? 401,
      authMessage: sanitizePublicMessage(error?.message ?? "Authentication failed"),
    },
    typeof error?.status === "number" && error.status >= 400 ? error.status : 401,
  );
}

function sanitizePublicMessage(message: string): string {
  return message
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/sb_(?:publishable|secret)_[A-Za-z0-9_]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

function getSubscriptionTotalCount(): number {
  const configured = Deno.env.get("RAZORPAY_SUBSCRIPTION_TOTAL_COUNT");
  let count = UPI_AUTOPAY_MAX_MONTHLY_TOTAL_COUNT;
  if (configured) {
    const parsed = Number.parseInt(configured, 10);
    if (!Number.isNaN(parsed) && parsed > 0) count = parsed;
  }
  return Math.min(count, UPI_AUTOPAY_MAX_MONTHLY_TOTAL_COUNT);
}

async function resolveCheckoutSubscription(input: {
  keyId: string;
  secret: string;
  existingId: string | undefined;
  providerPlanId: string;
  totalCount: number;
  userId: string;
  plan: PaidPlan;
}): Promise<RazorpaySubscription> {
  const requestPayload = {
    plan_id: input.providerPlanId,
    total_count: input.totalCount,
    customer_notify: 1,
    notes: { user_id: input.userId, plan: input.plan },
  };

  if (!input.existingId) {
    return createSubscription(input.keyId, input.secret, requestPayload);
  }

  const existing = await fetchSubscription(input.keyId, input.secret, input.existingId);
  if (!existing) {
    return createSubscription(input.keyId, input.secret, requestPayload);
  }

  const status = (existing.status ?? "created").toLowerCase();

  if (BLOCKING_RAZORPAY_STATUSES.has(status)) {
    throw new Error("You already have an active DECIDE subscription.");
  }

  if (CONTINUABLE_STATUSES.has(status)) {
    const existingTotal = existing.total_count ?? 0;
    const canReuse =
      existing.plan_id === input.providerPlanId &&
      existingTotal > 0 &&
      existingTotal <= input.totalCount;
    if (canReuse) return existing;

    await cancelSubscriptionNow(input.keyId, input.secret, input.existingId);
    const verified = await fetchSubscription(input.keyId, input.secret, input.existingId);
    if (verified && !TERMINAL_RAZORPAY_STATUSES.has((verified.status ?? "").toLowerCase())) {
      throw new Error("Unable to replace unfinished checkout. Try again shortly.");
    }
    return createSubscription(input.keyId, input.secret, requestPayload);
  }

  if (TERMINAL_RAZORPAY_STATUSES.has(status)) {
    return createSubscription(input.keyId, input.secret, requestPayload);
  }

  throw new Error(`Unable to start checkout for subscription status: ${status}`);
}

function isLivePaidSubscription(
  row: {
    status?: string | null;
    current_period_end?: string | null;
  } | null,
): boolean {
  if (!row) return false;
  if (row.status !== "active") return false;
  if (!row.current_period_end) return true;
  const end = Date.parse(row.current_period_end);
  return !Number.isFinite(end) || end >= Date.now();
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function createSubscription(
  key: string,
  secret: string,
  body: Record<string, unknown>,
) {
  return razorpayFetch("/subscriptions", key, secret, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function fetchSubscription(key: string, secret: string, id: string) {
  try {
    return await razorpayFetch(`/subscriptions/${id}`, key, secret, { method: "GET" });
  } catch (error) {
    const message = (error as Error).message.toLowerCase();
    if (message.includes("does not exist") || message.includes("not found")) return null;
    throw error;
  }
}

async function cancelSubscriptionNow(key: string, secret: string, id: string) {
  return razorpayFetch(`/subscriptions/${id}/cancel`, key, secret, {
    method: "POST",
    body: JSON.stringify({ cancel_at_cycle_end: false }),
  });
}

async function razorpayFetch(
  path: string,
  key: string,
  secret: string,
  init: RequestInit,
): Promise<RazorpaySubscription> {
  const body = typeof init.body === "string" ? init.body : init.body ? String(init.body) : "";
  const payload = await razorpayHttps({
    path: `/v1${path}`,
    method: (init.method ?? "GET").toUpperCase(),
    auth: btoa(`${key}:${secret}`),
    body,
  });
  if (!payload.ok) {
    throw new Error(
      `Razorpay HTTP ${payload.status}: ${payload.data.error?.description ?? "request failed."}`,
    );
  }
  return payload.data as RazorpaySubscription;
}

function razorpayHttps(input: {
  path: string;
  method: string;
  auth: string;
  body: string;
}): Promise<{ ok: boolean; status: number; data: { error?: { description?: string } } }> {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "api.razorpay.com",
        path: input.path,
        method: input.method,
        headers: {
          Authorization: `Basic ${input.auth}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(input.body ? { "Content-Length": String(new TextEncoder().encode(input.body).length) } : {}),
        },
      },
      (response) => {
        const chunks: string[] = [];
        response.on("data", (chunk) => {
          chunks.push(typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk));
        });
        response.on("end", () => {
          const raw = chunks.join("");
          let data: { error?: { description?: string } } = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            data = { error: { description: raw.slice(0, 180) || "invalid json" } };
          }
          const status = response.statusCode ?? 0;
          resolve({ ok: status >= 200 && status < 300, status, data });
        });
      },
    );
    request.on("error", reject);
    if (input.body) request.write(input.body);
    request.end();
  });
}
