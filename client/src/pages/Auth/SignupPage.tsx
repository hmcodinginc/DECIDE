import { Container } from "@/components/common/Container";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthPageIntro } from "@/components/auth/AuthPageIntro";

function SignupPage() {
  return (
    <Container className="max-w-md pt-32 pb-24">
      <AuthPageIntro mode="signup" />
      <AuthForm mode="signup" />
    </Container>
  );
}

export { SignupPage };
