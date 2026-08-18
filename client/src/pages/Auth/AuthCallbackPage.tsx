import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/config/routes";
import { toUserMessage } from "@/lib/errors";
import { authService } from "@/services/auth/auth-service";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get("error_description") ?? params.get("error");
    if (errorDescription) {
      setMessage(
        toUserMessage(
          decodeURIComponent(errorDescription.replace(/\+/g, " ")),
          "Couldn't complete sign-in. Try email instead.",
        ),
      );
      const timer = window.setTimeout(() => {
        void navigate(ROUTES.login, { replace: true });
      }, 1600);
      return () => window.clearTimeout(timer);
    }

    const unsubscribe = authService.onAuthChange((user) => {
      if (!active) return;
      if (user) void navigate(ROUTES.app, { replace: true });
    });

    void authService.getSession().then((session) => {
      if (!active) return;
      if (session) void navigate(ROUTES.app, { replace: true });
    });

    const timeout = window.setTimeout(() => {
      if (!active) return;
      void navigate(ROUTES.login, { replace: true });
    }, 5000);

    return () => {
      active = false;
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <Container className="pt-32">
      <p className="text-sm text-muted-foreground">{message}</p>
    </Container>
  );
}

export { AuthCallbackPage };
