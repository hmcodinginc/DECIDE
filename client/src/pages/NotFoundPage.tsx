import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ROUTES } from "@/config/routes";

function NotFoundPage() {
  return (
    <Container className="pt-32 pb-24 text-center">
      <p className="font-display text-6xl">404</p>
      <p className="mt-4 text-muted-foreground">This page isn&apos;t a decision DECIDE can make.</p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.home}>Back to DECIDE</Link>
      </Button>
    </Container>
  );
}

export { NotFoundPage };
