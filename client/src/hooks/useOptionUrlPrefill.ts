import { useEffect, useRef, useState } from "react";
import { isLookupReadyUrl, readOptionUrl } from "@/services/decision/option-url";
import type { DecisionOption } from "@/types/decision";

export type OptionUrlStatus = "idle" | "reading" | "filled" | "kept" | "unreadable";

const LOOKUP_DELAY_MS = 800;

export function useOptionUrlPrefill(
  option: DecisionOption,
  onPatch: (patch: Partial<DecisionOption>) => void,
) {
  const [status, setStatus] = useState<OptionUrlStatus>("idle");
  const optionRef = useRef(option);
  const lastLookedUp = useRef("");
  const filledName = useRef<string | null>(null);
  const filledPrice = useRef<number | null>(null);
  const onPatchRef = useRef(onPatch);
  optionRef.current = option;
  onPatchRef.current = onPatch;

  useEffect(() => {
    const url = option.url.trim();
    if (!isLookupReadyUrl(url)) {
      setStatus("idle");
      lastLookedUp.current = "";
      filledName.current = null;
      filledPrice.current = null;
      return;
    }
    if (url === lastLookedUp.current) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("reading");
      void readOptionUrl(url, controller.signal)
        .then((details) => {
          if (controller.signal.aborted) return;
          lastLookedUp.current = url;
          if (!details.readable) {
            setStatus("unreadable");
            return;
          }

          const current = optionRef.current;
          const patch: Partial<DecisionOption> = {};
          const currentName = current.name.trim();
          const canFillName =
            Boolean(details.title) &&
            (!currentName || currentName === filledName.current);
          if (canFillName && details.title) {
            patch.name = details.title;
            filledName.current = details.title;
          }

          const currentPrice = current.attributes.price;
          const canFillPrice =
            details.price != null &&
            (typeof currentPrice !== "number" || currentPrice === filledPrice.current);
          if (canFillPrice && details.price != null) {
            patch.attributes = { ...current.attributes, price: details.price };
            filledPrice.current = details.price;
          }

          if (Object.keys(patch).length > 0) {
            onPatchRef.current(patch);
            setStatus("filled");
            return;
          }
          setStatus("kept");
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          lastLookedUp.current = url;
          setStatus("unreadable");
        });
    }, LOOKUP_DELAY_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [option.url]);

  return status;
}
