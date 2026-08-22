import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optionLetterLabel } from "@/lib/format";
import { optionInputSchema } from "@/lib/validation/decision";
import { emptyOption } from "@/services/decision/engine";
import { OptionUrlField } from "@/components/decision/OptionUrlField";
import type { DecisionOption } from "@/types/decision";

interface OptionsStepProps {
  options: DecisionOption[];
  onChange: (options: DecisionOption[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

function OptionsStep({ options, onChange, onBack, onContinue }: OptionsStepProps) {
  const [error, setError] = useState<string | null>(null);

  const update = (id: string, patch: Partial<DecisionOption>) => {
    onChange(options.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const add = () => {
    onChange([...options, emptyOption(options.length)]);
  };

  const submit = () => {
    const named = options.filter((item) => item.name.trim());
    if (named.length < 2) {
      setError("Add at least two options.");
      return;
    }
    for (const option of named) {
      const parsed = optionInputSchema.safeParse({
        name: option.name,
        description: option.description,
        url: option.url,
        notes: option.notes,
        price:
          typeof option.attributes.price === "number"
            ? option.attributes.price
            : null,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Check your options.");
        return;
      }
    }
    setError(null);
    onChange(named.map((item, index) => ({ ...item, sortOrder: index })));
    onContinue();
  };

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-gold uppercase">Step 2</p>
      <h1 className="font-display mt-3 text-3xl sm:text-5xl">Add your options</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Names are enough. An optional link can fill name or price when the page
        publishes them. If it doesn&apos;t, type the details yourself.
      </p>
      <div className="mt-8 space-y-4">
        {options.map((option, index) => (
          <div key={option.id} className="rounded-3xl border border-white/8 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                Option {optionLetterLabel(index)}
              </p>
              {options.length > 2 ? (
                <button
                  type="button"
                  className="rounded-full p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-white/8 hover:text-foreground"
                  onClick={() => onChange(options.filter((item) => item.id !== option.id))}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Remove option</span>
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor={`name-${option.id}`}>Name</Label>
                <Input
                  id={`name-${option.id}`}
                  className="mt-2"
                  value={option.name}
                  onChange={(event) => update(option.id, { name: event.target.value })}
                  placeholder="MacBook Air"
                />
              </div>
              <div>
                <Label htmlFor={`price-${option.id}`}>Price (₹, optional)</Label>
                <Input
                  id={`price-${option.id}`}
                  className="mt-2"
                  inputMode="numeric"
                  value={
                    typeof option.attributes.price === "number"
                      ? String(option.attributes.price)
                      : ""
                  }
                  onChange={(event) => {
                    const raw = event.target.value.replace(/[^\d]/g, "");
                    update(option.id, {
                      attributes: {
                        ...option.attributes,
                        price: raw ? Number(raw) : null,
                      },
                    });
                  }}
                  placeholder="129990"
                />
              </div>
              <div className="min-w-0">
                <OptionUrlField
                  option={option}
                  onPatch={(patch) => update(option.id, patch)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`notes-${option.id}`}>Notes or pasted details</Label>
                <Textarea
                  id={`notes-${option.id}`}
                  className="mt-2 min-h-24"
                  value={option.notes}
                  onChange={(event) => update(option.id, { notes: event.target.value })}
                  placeholder="Lighter, better battery, smaller screen..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={add}>
          <Plus className="size-4" />
          Add option
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={submit}>Continue</Button>
      </div>
    </div>
  );
}

export { OptionsStep };
