import { Link } from "react-router";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  to?: string;
}

function BrandMark({ className, size = "md", to = ROUTES.home }: BrandMarkProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link
      to={to}
      className={cn(
        "font-display font-extrabold tracking-[0.18em] text-foreground",
        sizes[size],
        className,
      )}
    >
      DECIDE
    </Link>
  );
}

export { BrandMark };
