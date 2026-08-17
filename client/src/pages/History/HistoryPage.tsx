import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { formatRelativeTime } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { decisionRepository } from "@/services/decision/repository";
import type { DecisionRecord } from "@/types/decision";

function HistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    decisionRepository
      .list(user?.id ?? null)
      .then((result) => {
        if (!active) return;
        setItems(result.items.filter((item) => item.status === "complete"));
        setWarning(result.warning ?? null);
      })
      .catch(() => {
        if (active) {
          setWarning(
            "We couldn't load your decisions right now. Your current decision is still safe locally.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  if (loading) return <PageSkeleton />;

  return (
    <Container className="max-w-3xl pt-28 pb-24">
      <h1 className="font-display text-4xl">My Decisions</h1>
      <p className="mt-3 text-muted-foreground">Reopen anything DECIDE already settled.</p>
      {warning ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-muted-foreground">
          {warning}
        </p>
      ) : null}
      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No decisions yet"
            description="Make your first comparison. It only takes a few questions."
            action={
              <Button asChild>
                <Link to={ROUTES.newDecision}>Make a Decision</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {items.map((item) => {
            const winner = item.result?.scores.find(
              (score) => score.optionId === item.result?.recommendedOptionId,
            );
            return (
              <li key={item.id}>
                <Link
                  to={ROUTES.decision(item.id)}
                  className="block rounded-3xl border border-white/8 p-5 transition-colors hover:border-white/16"
                >
                  <p className="font-medium">{item.question}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {winner ? `Recommended: ${winner.name}` : "No recommendation yet"}
                    {" · "}
                    {item.options.length} options
                    {" · "}
                    {formatRelativeTime(item.updatedAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}

export { HistoryPage };
