import { readOptionUrl } from "@/services/decision/option-url";

export interface AiProvider {
  id: string;
  analyze?: never;
}

export interface ExtractionResult {
  title: string | null;
  text: string | null;
  attributes: Record<string, string>;
  warning?: string;
}

/**
 * Provider-agnostic AI surface.
 * URL reading uses a free Edge Function that only parses public page markup.
 */
export const aiProvider: AiProvider = {
  id: "local-none",
};

export async function extractFromUrl(url: string): Promise<ExtractionResult> {
  const details = await readOptionUrl(url);
  return {
    title: details.title,
    text: null,
    attributes: details.price != null ? { price: String(details.price) } : {},
    warning: details.readable ? undefined : "unreadable",
  };
}
