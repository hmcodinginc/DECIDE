import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type SubscriptionRow = {
  user_id: string;
  plan: string;
  status: string;
  razorpay_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!secret || !(await verifySignature(raw, signature, secret))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(raw) as {
    event: string;
    created_at?: number;
    payload?: Record<string, { entity?: Record<string, unknown> }>;
  };

  const uniqueId = webhookEventId(payload);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { error: insertError } = await admin.from("webhook_events").insert({
    event_id: uniqueId,
    event_type: payload.event,
    payload,
  });
  if (insertError) {
    if (insertError.code === "23505") {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(insertError.message, { status: 500 });
  }

  const subscription = payload.payload?.subscription?.entity;
  const payment = payload.payload?.payment?.entity;
  const notes = (subscription?.notes ?? payment?.notes ?? {}) as {
    user_id?: string;
    plan?: string;
  };
  const razorpaySubId = asNonEmptyString(subscription?.id) ??
    asNonEmptyString(payment?.subscription_id);
  const razorpayPlanId = asNonEmptyString(subscription?.plan_id);
  const allowedPlanIds = decideRazorpayPlanIds();

  const { data: existing } = razorpaySubId
    ? await admin
      .from("subscriptions")
      .select("*")
      .eq("razorpay_subscription_id", razorpaySubId)
      .maybeSingle()
    : { data: null };

  const existingRow = (existing ?? null) as SubscriptionRow | null;

  const isDecideEvent = allowedPlanIds.length > 0 && (
    Boolean(razorpayPlanId && allowedPlanIds.includes(razorpayPlanId)) ||
    Boolean(existingRow)
  );

  if (!isDecideEvent) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = existingRow?.user_id;

  if (payment) {
    await admin.from("payments").upsert({
      user_id: userId ?? null,
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id ?? null,
      razorpay_subscription_id: payment.subscription_id ?? razorpaySubId ?? null,
      amount: payment.amount ?? null,
      currency: payment.currency ?? "INR",
      status: String(payment.status ?? payload.event),
      raw: payment,
    }, { onConflict: "razorpay_payment_id" });
  }

  if (razorpaySubId && userId) {
    const next = nextSubscriptionState(payload.event, existingRow, {
      razorpaySubId,
      razorpayPlanId,
      notesPlan: notes.plan,
      periodStart: unixToIso(subscription?.current_start),
      periodEnd: unixToIso(subscription?.current_end),
    });
    if (next) {
      await admin.from("subscriptions").upsert({
        user_id: userId,
        plan: next.plan,
        status: next.status,
        razorpay_subscription_id: razorpaySubId,
        current_period_start: next.current_period_start,
        current_period_end: next.current_period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

function webhookEventId(payload: {
  event: string;
  created_at?: number;
  payload?: Record<string, { entity?: Record<string, unknown> }>;
}): string {
  const event = payload.event || "unknown";
  const paymentId = asNonEmptyString(payload.payload?.payment?.entity?.id);
  if (paymentId) return `${event}:pay:${paymentId}`;
  const subId = asNonEmptyString(payload.payload?.subscription?.entity?.id);
  const createdAt = payload.created_at != null ? String(payload.created_at) : "";
  if (subId && createdAt) return `${event}:sub:${subId}:${createdAt}`;
  if (subId) return `${event}:sub:${subId}`;
  if (createdAt) return `${event}:at:${createdAt}`;
  return `${event}:body:${hash32(JSON.stringify(payload))}`;
}

function nextSubscriptionState(
  event: string,
  existing: SubscriptionRow | null,
  input: {
    razorpaySubId: string;
    razorpayPlanId: string | undefined;
    notesPlan: string | undefined;
    periodStart: string | undefined;
    periodEnd: string | undefined;
  },
): {
  plan: string;
  status: "active" | "cancelled" | "expired" | "past_due" | "none";
  current_period_start: string | null;
  current_period_end: string | null;
} | null {
  if (
    existing?.razorpay_subscription_id &&
    existing.razorpay_subscription_id !== input.razorpaySubId
  ) {
    return null;
  }

  const plan = planFromRazorpayId(input.razorpayPlanId) ??
    (input.notesPlan === "premium" ? "premium" : input.notesPlan === "pro" ? "pro" : undefined) ??
    existing?.plan ??
    "pro";

  const periodStart = input.periodStart ?? existing?.current_period_start ?? null;
  const periodEnd = input.periodEnd ?? existing?.current_period_end ?? null;

  if (event === "payment.failed") {
    if (existing?.status === "active") return null;
    return null;
  }

  const mapped = mapEventStatus(event);
  if (!mapped) return null;

  if (
    mapped === "active" &&
    (existing?.status === "cancelled" || existing?.status === "expired") &&
    existing.razorpay_subscription_id === input.razorpaySubId
  ) {
    return null;
  }

  return {
    plan,
    status: mapped,
    current_period_start: periodStart,
    current_period_end: periodEnd,
  };
}

function mapEventStatus(
  event: string,
): "active" | "cancelled" | "expired" | "past_due" | null {
  switch (event) {
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      return "active";
    case "subscription.authenticated":
      return null;
    case "subscription.cancelled":
      return "cancelled";
    case "subscription.halted":
    case "subscription.paused":
      return "past_due";
    case "subscription.completed":
      return "expired";
    default:
      return null;
  }
}

function planFromRazorpayId(planId: string | undefined): "pro" | "premium" | undefined {
  const pro = Deno.env.get("RAZORPAY_PLAN_PRO") ?? "";
  const premium = Deno.env.get("RAZORPAY_PLAN_PREMIUM") ?? "";
  if (planId && pro && planId === pro) return "pro";
  if (planId && premium && planId === premium) return "premium";
  return undefined;
}

function decideRazorpayPlanIds(): string[] {
  return [
    Deno.env.get("RAZORPAY_PLAN_PRO") ?? "",
    Deno.env.get("RAZORPAY_PLAN_PREMIUM") ?? "",
  ].filter((id) => id.length > 0);
}

function unixToIso(value: unknown): string | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return undefined;
  return new Date(value * 1000).toISOString();
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function hash32(text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(16);
}

async function verifySignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const digest = [...new Uint8Array(signed)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return digest === signature;
}
