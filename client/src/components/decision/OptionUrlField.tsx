import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOptionUrlPrefill, type OptionUrlStatus } from "@/hooks/useOptionUrlPrefill";
import type { DecisionOption } from "@/types/decision";

interface OptionUrlFieldProps {
  option: DecisionOption;
  onPatch: (patch: Partial<DecisionOption>) => void;
}

function statusCopy(status: OptionUrlStatus): string | null {
  switch (status) {
    case "reading":
      return "Reading public page details…";
    case "filled":
      return "Filled empty name or price from the page. Edit anything that looks off.";
    case "kept":
      return "This page was readable. Your name and price were left as you typed them.";
    case "unreadable":
      return "Couldn't read this page. Add a name, price, or notes — the link is still saved.";
    default:
      return null;
  }
}

function OptionUrlField({ option, onPatch }: OptionUrlFieldProps) {
  const status = useOptionUrlPrefill(option, onPatch);
  const message = statusCopy(status);

  const onUrlChange = useCallback(
    (value: string) => {
      onPatch({ url: value });
    },
    [onPatch],
  );

  return (
    <div className="min-w-0">
      <Label htmlFor={`url-${option.id}`}>URL (optional)</Label>
      <Input
        id={`url-${option.id}`}
        className="mt-2 min-w-0 overflow-x-auto"
        value={option.url}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder="https://"
        inputMode="url"
        autoComplete="url"
        maxLength={2048}
        aria-busy={status === "reading"}
        aria-describedby={`url-status-${option.id}`}
      />
      <p
        id={`url-status-${option.id}`}
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-5 text-xs transition-opacity duration-200 ${
          status === "filled" ? "text-gold/80" : "text-muted-foreground"
        }`}
      >
        {message}
      </p>
    </div>
  );
}

export { OptionUrlField };
