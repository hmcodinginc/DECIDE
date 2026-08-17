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
 * MVP uses a local/no-op implementation so DECIDE stays functional at ₹0.
 */
export const aiProvider: AiProvider = {
  id: "local-none",
};

export async function extractFromUrl(url: string): Promise<ExtractionResult> {
  void url;
  return {
    title: null,
    text: null,
    attributes: {},
    warning: "We couldn't read this page. Paste the details instead.",
  };
}
