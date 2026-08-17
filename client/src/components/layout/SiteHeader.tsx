import { Link, useLocation } from "react-router";
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
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <BrandMark />
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
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user.displayName ?? user.email ?? "Account"}
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
                <DropdownMenuItem onSelect={() => void authService.signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.login}>Log in</Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link to={ROUTES.newDecision}>Make a Decision</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

export { SiteHeader };
