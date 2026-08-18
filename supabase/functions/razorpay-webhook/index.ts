import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    payload?: Record<string, { entity?: Record<string, unknown> }>;
  };

  const eventId =
    (payload.payload?.subscription?.entity?.id as string | undefined) ??
    (payload.payload?.payment?.entity?.id as string | undefined) ??
    `${payload.event}:${Date.now()}`;
  const uniqueId = `${payload.event}:${eventId}`;

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

  // Fail closed: only DECIDE plan IDs (env) or an already-stored DECIDE subscription.
  const isDecideEvent = allowedPlanIds.length > 0 && (
    Boolean(razorpayPlanId && allowedPlanIds.includes(razorpayPlanId)) ||
    Boolean(existing)
  );

  if (!isDecideEvent) {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (razorpaySubId) {
    const status = mapStatus(payload.event);
    if (status) {
      const plan = planFromRazorpayId(razorpayPlanId) ??
        (notes.plan === "premium" ? "premium" : notes.plan === "pro" ? "pro" : undefined);
      const periodStart = subscription?.current_start
        ? new Date(Number(subscription.current_start) * 1000).toISOString()
        : new Date().toISOString();
      const periodEnd = subscription?.current_end
        ? new Date(Number(subscription.current_end) * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const userId = existing?.user_id ?? notes.user_id;
      if (userId) {
        await admin.from("subscriptions").upsert({
          user_id: userId,
          plan: plan ?? existing?.plan ?? "pro",
          status,
          razorpay_subscription_id: razorpaySubId,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
    }
  }

  if (payment) {
    await admin.from("payments").upsert({
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id ?? null,
      razorpay_subscription_id: payment.subscription_id ?? razorpaySubId ?? null,
      amount: payment.amount ?? null,
      currency: payment.currency ?? "INR",
      status: String(payment.status ?? payload.event),
      raw: payment,
    }, { onConflict: "razorpay_payment_id" });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function decideRazorpayPlanIds(): string[] {
  return [
    Deno.env.get("RAZORPAY_PLAN_PRO") ?? "",
    Deno.env.get("RAZORPAY_PLAN_PREMIUM") ?? "",
  ].filter((id) => id.length > 0);
}

function planFromRazorpayId(planId: string | undefined): "pro" | "premium" | undefined {
  const pro = Deno.env.get("RAZORPAY_PLAN_PRO") ?? "";
  const premium = Deno.env.get("RAZORPAY_PLAN_PREMIUM") ?? "";
  if (planId && pro && planId === pro) return "pro";
  if (planId && premium && planId === premium) return "premium";
  return undefined;
}

function mapStatus(event: string): "active" | "cancelled" | "expired" | "past_due" | null {
  switch (event) {
    case "subscription.authenticated":
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      return "active";
    case "subscription.cancelled":
    case "subscription.halted":
      return "cancelled";
    case "subscription.completed":
      return "expired";
    case "subscription.paused":
    case "payment.failed":
      return "past_due";
    default:
      return null;
  }
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
