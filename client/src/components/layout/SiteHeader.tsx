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
        <BrandMark className="shrink-0" />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href={isLanding ? "#how" : "/#how"} className="hover:text-foreground">
            How it works
          </a>
          <Link to={ROUTES.pricing} className="hover:text-foreground">
            Pricing
          </Link>
          {user ? (
            <Link to={ROUTES.history} className="hover:text-foreground">
              My Decisions
            </Link>
          ) : null}
        </nav>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="max-w-[9.5rem] min-w-0 px-2 sm:max-w-[14rem] sm:px-4">
                  <span className="truncate">
                    {user.displayName ?? user.email ?? "Account"}
                  </span>
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
              <span className="sm:hidden">Decide</span>
              <span className="hidden sm:inline">Make a Decision</span>
            </Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

export { SiteHeader };
