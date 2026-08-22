import { Container } from "@/components/common/Container";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageIntro } from "@/components/auth/AuthPageIntro";

function LoginPage() {
  return (
    <Container className="max-w-md pt-32 pb-24">
      <AuthPageIntro mode="login" />
      <AuthForm mode="login" />
    </Container>
  );
}

export { LoginPage };
