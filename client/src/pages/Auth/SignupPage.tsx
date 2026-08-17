import { Container } from "@/components/common/Container";
import { AuthForm } from "@/components/auth/AuthForm";

function SignupPage() {
  return (
    <Container className="max-w-md pt-32 pb-24">
      <h1 className="font-display text-4xl">Create a free account</h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        5 lifetime decisions on Free. Try DECIDE first if you haven&apos;t yet.
      </p>
      <AuthForm mode="signup" />
    </Container>
  );
}

export { SignupPage };
