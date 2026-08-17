import { Link } from "react-router";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

function AppHomePage() {
  const { user } = useAuth();
  return (
    <Container className="max-w-2xl pt-32 pb-24">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">DECIDE</p>
      <h1 className="font-display mt-4 text-4xl text-balance sm:text-6xl">
        What are you choosing?
      </h1>
      <p className="mt-4 text-muted-foreground">
        {user
          ? "Start a new comparison, or reopen something you already decided."
          : "Try it first. Save it when you're ready."}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to={ROUTES.newDecision}>Make a Decision</Link>
        </Button>
        {user ? (
          <Button asChild size="lg" variant="outline">
            <Link to={ROUTES.history}>My Decisions</Link>
          </Button>
        ) : null}
      </div>
    </Container>
  );
}

export { AppHomePage };
