import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/config/routes";
import { authService } from "@/services/auth/auth-service";

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    authService.getSession().then((session) => {
      if (!active) return;
      void navigate(session ? ROUTES.app : ROUTES.login, { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <Container className="pt-32">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </Container>
  );
}

export { AuthCallbackPage };
