import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-white/10 bg-white/4 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:border-gold/40 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
