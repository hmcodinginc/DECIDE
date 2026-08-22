import { useSearchParams } from "react-router";
import { GUEST_ANALYSIS_LIMIT } from "@/config/plans";
import { readAuthGateReason } from "@/lib/auth-next";

function AuthPageIntro({ mode }: { mode: "login" | "signup" }) {
  const [params] = useSearchParams();
  const reason = readAuthGateReason(params);

  if (reason === "limit") {
    return (
      <>
        <h1 className="font-display text-3xl text-balance sm:text-4xl">
          You&apos;ve used all {GUEST_ANALYSIS_LIMIT} free analyses.
        </h1>
        <p className="mt-3 mb-8 text-muted-foreground">
          Sign in to save what you&apos;ve already decided, then upgrade for more analyses.
        </p>
      </>
    );
  }

  if (reason === "account") {
    return (
      <>
        <h1 className="font-display text-3xl text-balance sm:text-4xl">
          Create your free account to make your first decision.
        </h1>
        <p className="mt-3 mb-8 text-muted-foreground">
          Your decisions are saved to your account, and you can upgrade whenever you need more analyses.
        </p>
      </>
    );
  }

  if (mode === "login") {
    return (
      <>
        <h1 className="font-display text-3xl text-balance sm:text-4xl">Welcome back</h1>
        <p className="mt-3 mb-8 text-muted-foreground">
          Log in to save decisions and keep your history.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-3xl text-balance sm:text-4xl">Create a free account</h1>
      <p className="mt-3 mb-8 text-muted-foreground">
        5 lifetime decisions on Free. Try DECIDE first if you haven&apos;t yet.
      </p>
    </>
  );
}

export { AuthPageIntro };
