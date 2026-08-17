import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth/auth-service";

function SettingsPage() {
  const { user } = useAuth();
  return (
    <Container className="max-w-lg pt-28 pb-24">
      <h1 className="font-display text-4xl">Settings</h1>
      <p className="mt-3 text-muted-foreground">
        The account you use to save decisions.
      </p>
      <div className="mt-8 rounded-3xl border border-white/8 p-6">
        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
          Email
        </p>
        <p className="mt-2">{user?.email ?? "—"}</p>
      </div>
      <Button className="mt-8" variant="outline" onClick={() => void authService.signOut()}>
        Log out
      </Button>
    </Container>
  );
}

export { SettingsPage };
