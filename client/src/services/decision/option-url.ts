import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export type OptionUrlDetails = {
  readable: boolean;
  title: string | null;
  price: number | null;
};

const REQUEST_TIMEOUT_MS = 15_000;

const quietMiss = (): OptionUrlDetails => ({
  readable: false,
  title: null,
  price: null,
});

export function isLookupReadyUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed.length < 8 || trimmed.length > 2048) return false;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.username || parsed.password) return false;
    return parsed.hostname.includes(".") && !parsed.hostname.includes(":");
  } catch {
    return false;
  }
}

export async function readOptionUrl(
  url: string,
  signal?: AbortSignal,
): Promise<OptionUrlDetails> {
  if (!supabaseUrl || !supabaseAnonKey) return quietMiss();

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/read-option-url`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ url: url.trim() }),
    });
    if (!response.ok) return quietMiss();
    const data = (await response.json()) as Partial<OptionUrlDetails>;
    const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : null;
    const price =
      typeof data.price === "number" && Number.isFinite(data.price) && data.price > 0
        ? Math.round(data.price)
        : null;
    return {
      readable: Boolean(data.readable && (title || price != null)),
      title,
      price,
    };
  } catch {
    return quietMiss();
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}
