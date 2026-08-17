import { Container } from "@/components/common/Container";
import { AuthForm } from "@/components/auth/AuthForm";

function LoginPage() {
  return (
    <Container className="max-w-md pt-32 pb-24">
      <h1 className="font-display text-4xl">Welcome back</h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        Log in to save decisions and keep your history.
      </p>
      <AuthForm mode="login" />
    </Container>
  );
}

export { LoginPage };
