import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PasswordField({
  className,
  disabled,
  ...props
}: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        disabled={disabled}
        type={visible ? "text" : "password"}
        className="pr-12"
      />
      <button
        type="button"
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none disabled:opacity-50"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" strokeWidth={1.75} /> : <Eye className="size-4" strokeWidth={1.75} />}
      </button>
    </div>
  );
}

export { PasswordField };
