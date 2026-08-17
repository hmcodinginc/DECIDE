import { Link } from "react-router";
import { BrandMark } from "@/components/common/BrandMark";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/config/routes";

function SiteFooter() {
  return (
    <footer className="border-t border-white/6 py-12">
      <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <BrandMark size="sm" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Stop comparing. Get a decision.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to={ROUTES.pricing} className="hover:text-foreground">
            Pricing
          </Link>
          <Link to={ROUTES.newDecision} className="hover:text-foreground">
            Make a Decision
          </Link>
          <Link to={ROUTES.login} className="hover:text-foreground">
            Log in
          </Link>
        </div>
      </Container>
    </footer>
  );
}

export { SiteFooter };
