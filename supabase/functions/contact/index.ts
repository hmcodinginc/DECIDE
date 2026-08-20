const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!req.headers.get("apikey")?.trim()) {
    return json({ error: "Missing apikey" }, 401);
  }

  let body: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    message?: unknown;
    company?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (typeof body.company === "string" && body.company.trim()) {
    return json({ ok: true });
  }

  const firstName = asText(body.firstName, 40);
  const lastName = asText(body.lastName, 40);
  const email = asText(body.email, 120)?.toLowerCase() ?? null;
  const message = asText(body.message, 2000);
  if (!firstName || !lastName || !email || !message) {
    return json({ error: "Incomplete message" }, 400);
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL") ?? "";
  if (!dbUrl) return json({ ok: true });

  try {
    const postgres = (await import("npm:postgres@3.4.7")).default;
    const sql = postgres(dbUrl, {
      ssl: "require",
      max: 1,
      idle_timeout: 5,
      connect_timeout: 8,
      prepare: false,
    });
    await sql`
      insert into public.contact_inquiries (first_name, last_name, email, message)
      values (${firstName}, ${lastName}, ${email}, ${message})
    `;
    await sql.end({ timeout: 2 });
  } catch {
    /* Table may not exist yet. Gmail compose still delivers the message. */
  }

  return json({ ok: true });
});

function asText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
