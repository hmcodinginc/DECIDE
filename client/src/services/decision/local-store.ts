import type { DecisionRecord } from "@/types/decision";

const KEY = "decide:decisions";
const GUEST_USAGE_KEY = "decide:guest-analyses";

function readAll(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DecisionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records: DecisionRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export const localDecisionStore = {
  list(): DecisionRecord[] {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  get(id: string): DecisionRecord | null {
    return readAll().find((item) => item.id === id) ?? null;
  },
  save(record: DecisionRecord): DecisionRecord {
    const all = readAll().filter((item) => item.id !== record.id);
    writeAll([record, ...all]);
    return record;
  },
  remove(id: string) {
    writeAll(readAll().filter((item) => item.id !== id));
  },
  guestAnalyses(): number {
    const value = Number(localStorage.getItem(GUEST_USAGE_KEY) ?? "0");
    return Number.isFinite(value) ? value : 0;
  },
  incrementGuestAnalyses() {
    localStorage.setItem(GUEST_USAGE_KEY, String(localDecisionStore.guestAnalyses() + 1));
  },
};
