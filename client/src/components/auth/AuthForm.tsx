import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/config/routes";
import { toUserMessage } from "@/lib/errors";
import { emailSchema, passwordSchema } from "@/lib/validation/decision";
import { authService } from "@/services/auth/auth-service";

interface AuthFormProps {
  mode: "login" | "signup";
}

function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || ROUTES.app;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? "Check your email.");
      return;
    }
    if (!passwordResult.success) {
      setError(passwordResult.error.issues[0]?.message ?? "Check your password.");
      return;
    }
    if (!authService.configured) {
      setError(
        "Authentication isn't connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env.local.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        await authService.signInWithPassword(email, password);
        void navigate(next);
      } else {
        const { session } = await authService.signUp(email, password);
        if (session) {
          void navigate(next);
        } else {
          setNotice("Check your email to confirm, then log in.");
        }
      }
    } catch (caught) {
      setError(toUserMessage(caught, "Couldn't complete that. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          className="mt-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          className="mt-2"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {notice ? <p className="mt-0 text-sm text-gold">{notice}</p> : null}
      <Button className="w-full" type="submit" disabled={busy}>
        {mode === "login" ? "Log in" : "Create account"}
      </Button>
      <Button
        className="w-full"
        type="button"
        variant="outline"
        onClick={() =>
          void authService.signInWithGoogle().catch((caught: Error) =>
            setError(toUserMessage(caught, "Google sign-in isn't configured yet. Use email instead.")),
          )
        }
      >
        Continue with Google
      </Button>
      {mode === "login" ? (
        <p className="text-center text-sm text-muted-foreground">
          <Link to={ROUTES.resetPassword} className="text-foreground">
            Forgot password?
          </Link>
          {" · "}
          <Link to={ROUTES.signup} className="text-foreground">
            Sign up
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to={ROUTES.login} className="text-foreground">
            Log in
          </Link>
        </p>
      )}
    </form>
  );
}

export { AuthForm };
