import { ChevronDown, CircleUser } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { BrandMark } from "@/components/common/BrandMark";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth/auth-service";

function SiteHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const scrolled = useScrolled();
  const isLanding = location.pathname === ROUTES.home;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || !isLanding
          ? "border-b border-white/6 bg-[#07070B]/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <Container className="flex h-16 min-w-0 items-center justify-between gap-3 sm:h-20">
        <BrandMark className="min-w-0 shrink" />
        <nav className="hidden min-w-0 items-center gap-6 text-sm text-muted-foreground lg:flex xl:gap-8">
          <a href={isLanding ? "#how" : "/#how"} className="link-hover">
            How it works
          </a>
          <Link to={ROUTES.pricing} className="link-hover">
            Pricing
          </Link>
          {user ? (
            <Link to={ROUTES.history} className="link-hover">
              My Decisions
            </Link>
          ) : null}
        </nav>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Open account menu"
                  title="Account and settings"
                  className="max-w-[12rem] min-w-0 gap-2 px-1.5 sm:max-w-[16rem] sm:px-2"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold ring-1 ring-gold/30">
                    <CircleUser aria-hidden />
                  </span>
                  <span className="hidden min-w-0 truncate sm:inline">
                    {user.displayName ?? user.email ?? "Account"}
                  </span>
                  <ChevronDown className="shrink-0 text-muted-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.history}>My Decisions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.settings}>Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.billing}>Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void authService.signOut().then(() => navigate(ROUTES.home));
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="shrink-0 px-2 sm:px-4">
              <Link to={ROUTES.login}>Log in</Link>
            </Button>
          )}
          <Button asChild size="sm" className="shrink-0 px-3 sm:px-4">
            <Link to={ROUTES.newDecision}>
              <span className="lg:hidden">Decide</span>
              <span className="hidden lg:inline">Make a Decision</span>
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

export { SiteHeader };
