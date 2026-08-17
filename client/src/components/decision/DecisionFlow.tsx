import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { OptionsStep } from "@/components/decision/steps/OptionsStep";
import { PrioritiesStep } from "@/components/decision/steps/PrioritiesStep";
import { QuestionStep } from "@/components/decision/steps/QuestionStep";
import { RatingsStep } from "@/components/decision/steps/RatingsStep";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/config/routes";
import { nowIso } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { track } from "@/services/analytics/events";
import { suggestCriteria } from "@/services/decision/criteria";
import { analyzeDecision, createDraft, emptyOption } from "@/services/decision/engine";
import { decisionRepository } from "@/services/decision/repository";
import { consumeAnalysis } from "@/services/billing/entitlements";
import type { DecisionRecord } from "@/types/decision";

const STEPS = ["question", "options", "priorities", "ratings"] as const;
type Step = (typeof STEPS)[number];

function DecisionFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entitlement, refresh } = useEntitlements();
  const [step, setStep] = useState<Step>("question");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<DecisionRecord>(() => {
    const draft = createDraft();
    return {
      ...draft,
      options: [emptyOption(0), emptyOption(1)],
    };
  });

  useEffect(() => {
    void track("decision_started");
  }, []);

  const progress = ((STEPS.indexOf(step) + 1) / STEPS.length) * 100;

  const patch = (partial: Partial<DecisionRecord>) => {
    setDecision((current) => ({
      ...current,
      ...partial,
      updatedAt: nowIso(),
    }));
  };

  const go = (next: Step) => setStep(next);

  const finish = async () => {
    if (entitlement && !entitlement.canAnalyze) {
      void navigate(`${ROUTES.billing}?reason=limit`);
      void track("free_limit_reached");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await consumeAnalysis(user?.id ?? null, decision.id);
      const result = analyzeDecision(decision);
      const complete: DecisionRecord = {
        ...decision,
        userId: user?.id ?? null,
        status: "complete",
        result,
        updatedAt: nowIso(),
      };
      await decisionRepository.save(complete);
      await refresh();
      void track("decision_completed");
      void navigate(ROUTES.decision(complete.id));
    } catch (caught) {
      const err = caught as Error & { code?: string };
      if (err.code === "LIMIT_REACHED") {
        void track("free_limit_reached");
        void navigate(`${ROUTES.billing}?reason=limit`);
        return;
      }
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  let body = (
    <RatingsStep
      options={decision.options}
      criteria={decision.criteria}
      ratings={decision.ratings}
      onChange={(ratings) => patch({ ratings })}
      onBack={() => go("priorities")}
      onContinue={() => void finish()}
    />
  );

  if (step === "question") {
    body = (
      <QuestionStep
        value={decision.question}
        onChange={(question) => patch({ question })}
        onContinue={() => {
          patch({ criteria: suggestCriteria(decision.question), ratings: [] });
          go("options");
        }}
      />
    );
  } else if (step === "options") {
    body = (
      <OptionsStep
        options={decision.options}
        onChange={(options) => patch({ options })}
        onBack={() => go("question")}
        onContinue={() => go("priorities")}
      />
    );
  } else if (step === "priorities") {
    body = (
      <PrioritiesStep
        criteria={decision.criteria}
        constraints={decision.constraints}
        onCriteriaChange={(criteria) => patch({ criteria })}
        onConstraintsChange={(constraints) => patch({ constraints })}
        onBack={() => go("options")}
        onContinue={() => go("ratings")}
      />
    );
  }

  return (
    <Container className="max-w-3xl pt-28 pb-20">
      <Progress value={progress} />
      <p className="mt-3 text-xs text-muted-foreground">
        {STEPS.indexOf(step) + 1} of {STEPS.length}
      </p>
      {busy ? (
        <p className="mt-10 text-sm text-muted-foreground">Weighing the trade-offs…</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      )}
      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}
    </Container>
  );
}

export { DecisionFlow };
