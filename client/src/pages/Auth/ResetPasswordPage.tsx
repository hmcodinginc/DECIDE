import { useState, type FormEvent } from "react";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema, passwordSchema } from "@/lib/validation/decision";
import { authService } from "@/services/auth/auth-service";

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendLink = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter your email.");
      return;
    }
    try {
      await authService.resetPassword(email);
      setNotice("If that email exists, a reset link is on its way.");
      setError(null);
    } catch (caught) {
      setError((caught as Error).message);
    }
  };

  const update = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Use a stronger password.");
      return;
    }
    try {
      await authService.updatePassword(password);
      setNotice("Password updated. You can close this page.");
      setError(null);
    } catch (caught) {
      setError((caught as Error).message);
    }
  };

  return (
    <Container className="max-w-md space-y-10 pt-32 pb-24">
      <div>
        <h1 className="font-display text-4xl">Reset password</h1>
        <p className="mt-3 text-muted-foreground">
          Request a link, then set a new password when you return.
        </p>
      </div>
      <form onSubmit={(event) => void sendLink(event)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            className="mt-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="submit">Send reset link</Button>
      </form>
      <form onSubmit={(event) => void update(event)} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            className="mt-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Update password
        </Button>
      </form>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {notice ? <p className="text-sm text-gold">{notice}</p> : null}
    </Container>
  );
}

export { ResetPasswordPage };
