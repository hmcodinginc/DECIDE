import { DecisionFlow } from "@/components/decision/DecisionFlow";
import { usePageTitle } from "@/hooks/usePageTitle";

function NewDecisionPage() {
  usePageTitle("Make a Decision — DECIDE");
  return <DecisionFlow />;
}

export { NewDecisionPage };
