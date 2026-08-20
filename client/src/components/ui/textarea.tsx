import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-[border-color,background-color,box-shadow] duration-200 hover:border-white/18 hover:bg-white/6 focus-visible:border-gold/40 focus-visible:ring-2 focus-visible:ring-gold/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
