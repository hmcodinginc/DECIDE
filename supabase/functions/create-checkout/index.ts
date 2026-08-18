import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
    const planPro = Deno.env.get("RAZORPAY_PLAN_PRO") ?? "";
    const planPremium = Deno.env.get("RAZORPAY_PLAN_PREMIUM") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as { plan?: string };
    if (body.plan !== "pro" && body.plan !== "premium") {
      return json({ error: "Unknown plan" }, 400);
    }

    const planId = body.plan === "pro" ? planPro : planPremium;
    if (!razorpayKeyId || !razorpaySecret || !planId) {
      return json({ error: "Billing is not configured." }, 503);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: current } = await admin
      .from("subscriptions")
      .select(
        "plan, status, razorpay_subscription_id, razorpay_customer_id, current_period_start, current_period_end",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const subscription = await razorpayFetch("/subscriptions", razorpayKeyId, razorpaySecret, {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        total_count: 24,
        customer_notify: 1,
        notes: { user_id: user.id, plan: body.plan },
      }),
    });

    // Live paid rows stay untouched until the webhook confirms the new subscription.
    // Free / expired / cancelled users still get a pending checkout row.
    if (!isLivePaidSubscription(current)) {
      await admin.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan: body.plan,
          status: "none",
          razorpay_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }

    return json({
      keyId: razorpayKeyId,
      subscriptionId: subscription.id,
      name: "DECIDE",
      description: body.plan === "pro" ? "DECIDE Pro — 25 decisions/month" : "DECIDE Premium — unlimited",
      prefillEmail: user.email,
    });
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});

function isLivePaidSubscription(
  row: {
    status?: string | null;
    current_period_end?: string | null;
  } | null,
): boolean {
  if (!row) return false;
  // Schema stores active (no trialing column); treat both as live entitlement.
  if (row.status !== "active" && row.status !== "trialing") return false;
  if (!row.current_period_end) return true;
  const end = Date.parse(row.current_period_end);
  return !Number.isFinite(end) || end >= Date.now();
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function razorpayFetch(
  path: string,
  key: string,
  secret: string,
  init: RequestInit,
) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${key}:${secret}`)}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description ?? "Razorpay request failed.");
  }
  return data as { id: string };
}
