import { nowIso } from "@/lib/format";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { localDecisionStore } from "@/services/decision/local-store";
import type { DecisionRecord } from "@/types/decision";

interface DecisionRow {
  id: string;
  user_id: string;
  question: string;
  status: DecisionRecord["status"];
  constraints: DecisionRecord["constraints"];
  result: DecisionRecord["result"];
  created_at: string;
  updated_at: string;
}

export interface DecisionListResult {
  items: DecisionRecord[];
  warning?: string;
}

export interface DecisionSaveResult {
  record: DecisionRecord;
  warning?: string;
}

function fromRemote(
  row: DecisionRow,
  options: DecisionRecord["options"],
  criteria: DecisionRecord["criteria"],
  ratings: DecisionRecord["ratings"],
): DecisionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    question: row.question,
    status: row.status,
    options,
    criteria,
    ratings,
    constraints: row.constraints,
    result: row.result,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function hydrate(row: DecisionRow): Promise<DecisionRecord> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const [optionsRes, criteriaRes, ratingsRes] = await Promise.all([
    supabase.from("decision_options").select("*").eq("decision_id", row.id).order("sort_order"),
    supabase.from("decision_criteria").select("*").eq("decision_id", row.id),
    supabase.from("decision_ratings").select("*").eq("decision_id", row.id),
  ]);

  const options = (optionsRes.data ?? []).map((item) => ({
    id: item.id as string,
    name: item.name as string,
    description: (item.description as string) ?? "",
    url: (item.url as string) ?? "",
    images: (item.images as string[]) ?? [],
    attributes: (item.attributes as DecisionRecord["options"][number]["attributes"]) ?? {},
    notes: (item.notes as string) ?? "",
    sortOrder: item.sort_order as number,
  }));

  const criteria = (criteriaRes.data ?? []).map((item) => ({
    id: item.id as string,
    key: item.key as string,
    label: item.label as string,
    weight: Number(item.weight),
    kind: item.kind as DecisionRecord["criteria"][number]["kind"],
  }));

  const ratings = (ratingsRes.data ?? []).map((item) => ({
    optionId: item.option_id as string,
    criterionId: item.criterion_id as string,
    relative: item.relative as DecisionRecord["ratings"][number]["relative"],
    score: Number(item.score),
  }));

  return fromRemote(row, options, criteria, ratings);
}

export const decisionRepository = {
  async list(userId: string | null): Promise<DecisionListResult> {
    const local = localDecisionStore.list();
    if (!userId || !supabase) return { items: local };

    try {
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const remote = await Promise.all((data as DecisionRow[]).map(hydrate));
      const remoteIds = new Set(remote.map((item) => item.id));
      return {
        items: [...remote, ...local.filter((item) => !remoteIds.has(item.id))],
      };
    } catch {
      return {
        items: local,
        warning:
          "We couldn't load your decisions right now. Your current decision is still safe locally.",
      };
    }
  },

  async get(id: string, userId: string | null): Promise<DecisionRecord | null> {
    const local = localDecisionStore.get(id);
    if (local) return local;
    if (!userId || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return hydrate(data as DecisionRow);
    } catch {
      return localDecisionStore.get(id);
    }
  },

  async save(
    record: DecisionRecord,
    options?: { requireRemote?: boolean },
  ): Promise<DecisionSaveResult> {
    const next = { ...record, updatedAt: nowIso() };
    localDecisionStore.save(next);
    if (!next.userId || !supabase || !isSupabaseConfigured) {
      if (options?.requireRemote) {
        throw new Error("We couldn't save this decision. Try again.");
      }
      return { record: next };
    }

    try {
      const { error } = await supabase.from("decisions").upsert({
        id: next.id,
        user_id: next.userId,
        question: next.question,
        status: next.status,
        constraints: next.constraints,
        result: next.result,
        created_at: next.createdAt,
        updated_at: next.updatedAt,
      });
      if (error) throw error;

      await supabase.from("decision_ratings").delete().eq("decision_id", next.id);
      await supabase.from("decision_options").delete().eq("decision_id", next.id);
      await supabase.from("decision_criteria").delete().eq("decision_id", next.id);

      if (next.options.length > 0) {
        const { error: optionError } = await supabase.from("decision_options").insert(
          next.options.map((option) => ({
            id: option.id,
            decision_id: next.id,
            name: option.name,
            description: option.description,
            url: option.url,
            images: option.images,
            attributes: option.attributes,
            notes: option.notes,
            sort_order: option.sortOrder,
          })),
        );
        if (optionError) throw optionError;
      }

      if (next.criteria.length > 0) {
        const { error: criteriaError } = await supabase.from("decision_criteria").insert(
          next.criteria.map((criterion) => ({
            id: criterion.id,
            decision_id: next.id,
            key: criterion.key,
            label: criterion.label,
            weight: criterion.weight,
            kind: criterion.kind,
          })),
        );
        if (criteriaError) throw criteriaError;
      }

      if (next.ratings.length > 0) {
        const { error: ratingError } = await supabase.from("decision_ratings").insert(
          next.ratings.map((rating) => ({
            decision_id: next.id,
            option_id: rating.optionId,
            criterion_id: rating.criterionId,
            relative: rating.relative,
            score: rating.score,
          })),
        );
        if (ratingError) throw ratingError;
      }

      return { record: next };
    } catch (caught) {
      if (options?.requireRemote) throw caught;
      return {
        record: next,
        warning: "We couldn't save this decision. Try again.",
      };
    }
  },
};
