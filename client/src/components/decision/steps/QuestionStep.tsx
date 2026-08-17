import { useState } from "react";
import { QUESTION_EXAMPLES } from "@/services/decision/criteria";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { questionSchema } from "@/lib/validation/decision";

interface QuestionStepProps {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}

function QuestionStep({ value, onChange, onContinue }: QuestionStepProps) {
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const parsed = questionSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Tell DECIDE what you're choosing.");
      return;
    }
    setError(null);
    onContinue();
  };

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-gold uppercase">Step 1</p>
      <h1 className="font-display mt-3 text-3xl text-balance sm:text-5xl">
        What are you trying to decide?
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        A sentence is enough. DECIDE will ask only what it needs next.
      </p>
      <Textarea
        className="mt-8 min-h-32 text-base"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Which laptop should I buy?"
        autoFocus
      />
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUESTION_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange(example)}
          >
            {example}
          </button>
        ))}
      </div>
      <Button className="mt-8" size="lg" onClick={submit}>
        Continue
      </Button>
    </div>
  );
}

export { QuestionStep };
