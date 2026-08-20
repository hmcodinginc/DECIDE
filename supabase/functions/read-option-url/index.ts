const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 1_500_000;
const MAX_TITLE = 80;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

type PriceSource = "json-ld" | "open-graph" | "title" | null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apikey = req.headers.get("apikey")?.trim() ?? "";
  if (!apikey) {
    return json({ error: "Missing apikey" }, 401);
  }

  let rawUrl = "";
  try {
    const body = (await req.json()) as { url?: unknown };
    rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return json({ readable: false, title: null, price: null, source: null }, 200);
  }

  if (!rawUrl) {
    return json({ readable: false, title: null, price: null, source: null }, 200);
  }

  try {
    const target = assertSafeUrl(normalizeUrl(rawUrl));
    const html = await fetchHtml(target.toString());
    if (!html) {
      return json({ readable: false, title: null, price: null, source: null }, 200);
    }

    const extracted = extractPublicDetails(html);
    const title = clipTitle(extracted.title);
    const price = sanitizePrice(extracted.price);
    const readable = Boolean(title || price != null);

    return json({
      readable,
      title,
      price,
      source: readable ? extracted.source : null,
    });
  } catch {
    return json({ readable: false, title: null, price: null, source: null }, 200);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function normalizeUrl(raw: string): string {
  if (/^https:\/\//i.test(raw)) return raw;
  if (/^http:\/\//i.test(raw)) return `https://${raw.slice("http://".length)}`;
  return `https://${raw}`;
}

function assertSafeUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS URLs are allowed");
  if (parsed.username || parsed.password) throw new Error("Credentials in URL are not allowed");
  if (!parsed.hostname.includes(".")) throw new Error("Invalid hostname");
  if (parsed.hostname.includes(":")) throw new Error("IP literals are not allowed");
  if (isBlockedHostname(parsed.hostname)) throw new Error("Blocked hostname");
  return parsed;
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(normalized)) return true;
  if (normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.endsWith(".internal")) {
    return true;
  }
  return isPrivateIpv4(normalized);
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "DECIDE/1.0 (option-url lookup)",
      },
    });
    if (!response.ok) return null;
    assertSafeUrl(response.url || url);
    const contentType = response.headers.get("content-type") ?? "";
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      return null;
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_HTML_BYTES) return null;
    return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractPublicDetails(html: string): {
  title: string | null;
  price: number | null;
  source: PriceSource;
} {
  const jsonLd = readJsonLdProduct(html);
  if (jsonLd.title || jsonLd.price != null) {
    return { ...jsonLd, source: "json-ld" };
  }

  const openGraph = {
    title: metaContent(html, "og:title"),
    price:
      parsePrice(metaContent(html, "product:price:amount")) ??
      parsePrice(metaContent(html, "og:price:amount")),
  };
  if (openGraph.title || openGraph.price != null) {
    return { ...openGraph, source: "open-graph" };
  }

  const title = readTitle(html);
  return { title, price: null, source: title ? "title" : null };
}

function readJsonLdProduct(html: string): { title: string | null; price: number | null } {
  const blocks: unknown[] = [];
  const pattern =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = pattern.exec(html);
  while (match) {
    try {
      blocks.push(JSON.parse(decodeEntities(match[1] ?? "").trim()));
    } catch {
      /* skip invalid JSON-LD */
    }
    match = pattern.exec(html);
  }

  const nodes = flattenJsonLd(blocks);
  for (const node of nodes) {
    if (!isRecord(node) || !isProductType(node["@type"])) continue;
    const title = asNonEmptyString(node.name);
    const price = priceFromOffers(node.offers);
    if (title || price != null) return { title, price };
  }
  return { title: null, price: null };
}

function flattenJsonLd(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap((item) => flattenJsonLd(item));
  if (!isRecord(value)) return [];
  const graph = value["@graph"];
  if (Array.isArray(graph)) return [value, ...graph.flatMap((item) => flattenJsonLd(item))];
  return [value];
}

function isProductType(value: unknown): boolean {
  const types = Array.isArray(value) ? value : [value];
  return types.some((item) => typeof item === "string" && /product/i.test(item));
}

function priceFromOffers(offers: unknown): number | null {
  const list = Array.isArray(offers) ? offers : [offers];
  for (const offer of list) {
    if (!isRecord(offer)) continue;
    const price = parsePrice(offer.price) ?? parsePrice(isRecord(offer.priceSpecification) ? offer.priceSpecification.price : null);
    if (price != null) return price;
  }
  return null;
}

function metaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escaped}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return null;
}

function readTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return null;
  return decodeEntities(match[1].replace(/\s+/g, " ").trim()) || null;
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1_000_000_000) return null;
  return Math.round(parsed);
}

function sanitizePrice(price: number | null): number | null {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  return Math.round(price);
}

function clipTitle(title: string | null): string | null {
  if (!title) return null;
  const cleaned = title.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.length <= MAX_TITLE ? cleaned : `${cleaned.slice(0, MAX_TITLE - 1).trim()}…`;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
