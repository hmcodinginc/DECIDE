import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";
  const staleModule =
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module");

  return (
    <Container className="flex min-h-svh flex-col items-center justify-center py-24 text-center">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">DECIDE</p>
      <h1 className="font-display mt-4 text-4xl">
        {staleModule ? "Refresh to continue" : "This page couldn't load"}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {staleModule
          ? "The app updated while this tab was open. A refresh will bring you back."
          : message}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.home}>Back to DECIDE</Link>
        </Button>
      </div>
    </Container>
  );
}

export { RouteErrorPage };
