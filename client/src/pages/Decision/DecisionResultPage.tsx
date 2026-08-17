import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Container } from "@/components/common/Container";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { ComparisonCards } from "@/components/decision/ComparisonCards";
import { PriorityWhatIf } from "@/components/decision/PriorityWhatIf";
import { RecalcPriorities } from "@/components/decision/RecalcPriorities";
import { ResultHero } from "@/components/decision/ResultHero";
import { ShareableResult } from "@/components/decision/ShareableResult";
import { TradeOffBlock } from "@/components/decision/TradeOff";
import { WhyThisOne } from "@/components/decision/WhyThisOne";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { decisionRepository } from "@/services/decision/repository";
import { track } from "@/lib/product-log";
import { toast } from "sonner";
import type { DecisionRecord } from "@/types/decision";

function DecisionResultPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<DecisionRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle("Your decision — DECIDE");

  useEffect(() => {
    if (!id) return;
    let active = true;
    decisionRepository
      .get(id, user?.id ?? null)
      .then((record) => {
        if (!active) return;
        setDecision(record);
      })
      .catch((caught: Error) => {
        if (active) setError(caught.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const save = async () => {
    if (!decision) return;
    if (!user) {
      void navigate(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.decision(decision.id))}`);
      return;
    }
    const saved = await decisionRepository.save({ ...decision, userId: user.id });
    if (saved.warning) {
      toast.error(saved.warning);
      return;
    }
    toast.success("Decision saved.");
    void track("decision_saved");
  };

  if (loading) return <PageSkeleton />;
  if (error) {
    return (
      <Container className="pt-28">
        <ErrorState title="Couldn't open this decision" description={error} />
      </Container>
    );
  }
  if (!decision?.result) {
    return (
      <Container className="pt-28">
        <EmptyState
          title="No result yet"
          description="This decision hasn't been analysed."
          action={
            <Button asChild>
              <Link to={ROUTES.newDecision}>Make a Decision</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const result = decision.result;
  const insufficient = result.confidence === "insufficient" || !result.recommendedOptionId;

  return (
    <Container className="max-w-3xl space-y-12 pt-28 pb-24">
      <ResultHero decision={decision} />
      {insufficient ? (
        <div className="rounded-3xl border border-white/8 p-6">
          <h2 className="font-display text-2xl">What&apos;s missing</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {result.missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button asChild className="mt-6" variant="outline">
            <Link to={ROUTES.newDecision}>Add more and try again</Link>
          </Button>
        </div>
      ) : (
        <>
          <WhyThisOne reasons={result.why} />
          <TradeOffBlock tradeoff={result.tradeoff} />
          <ComparisonCards result={result} />
          <PriorityWhatIf items={result.whatIf} />
        </>
      )}
      <ShareableResult decision={decision} />
      <RecalcPriorities
        decision={decision}
        onChange={(next) => {
          setDecision(next);
          void decisionRepository
            .save({ ...next, userId: user?.id ?? next.userId })
            .then((saved) => {
              if (saved.warning) toast.error(saved.warning);
            });
        }}
      />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void save()}>
          {user ? "Save decision" : "Sign in to save"}
        </Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.newDecision}>New decision</Link>
        </Button>
      </div>
    </Container>
  );
}

export { DecisionResultPage };
