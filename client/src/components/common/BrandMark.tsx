import { Link, useLocation } from "react-router";
import { ROUTES } from "@/config/routes";
import { scrollWindowTop } from "@/components/layout/ScrollToTop";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  to?: string;
}

function BrandMark({ className, size = "md", to = ROUTES.home }: BrandMarkProps) {
  const location = useLocation();
  const sizes = {
    sm: "text-lg",
    md: "text-lg sm:text-xl",
    lg: "text-3xl",
  };

  return (
    <Link
      to={to === ROUTES.home ? { pathname: ROUTES.home, search: "", hash: "" } : to}
      className={cn(
        "font-display font-extrabold tracking-[0.12em] text-foreground transition-colors duration-200 hover:text-gold sm:tracking-[0.16em] lg:tracking-[0.18em]",
        sizes[size],
        className,
      )}
      onClick={(event) => {
        if (to !== ROUTES.home) return;
        const onHome = location.pathname === ROUTES.home;
        if (onHome && !location.hash && !location.search) {
          event.preventDefault();
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          return;
        }
        scrollWindowTop();
      }}
    >
      DECIDE
    </Link>
  );
}

export { BrandMark };
