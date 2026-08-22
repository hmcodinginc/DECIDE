const STORAGE_KEY = "decide:login-cooldown";
const FAIL_THRESHOLD = 3;
const BASE_MS = 15_000;
const MAX_MS = 60_000;

type Stored = {
  fails: number;
  until: number;
};

function empty(): Stored {
  return { fails: 0, until: 0 };
}

function read(): Stored {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Stored;
    if (typeof parsed.fails !== "number" || typeof parsed.until !== "number") {
      return empty();
    }
    return {
      fails: Math.max(0, Math.floor(parsed.fails)),
      until: Math.max(0, parsed.until),
    };
  } catch {
    return empty();
  }
}

function write(state: Stored) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota / private mode
  }
}

function cooldownMs(fails: number): number {
  if (fails < FAIL_THRESHOLD) return 0;
  const exponent = fails - FAIL_THRESHOLD;
  return Math.min(MAX_MS, BASE_MS * 2 ** exponent);
}

export function remainingLoginCooldownMs(now = Date.now()): number {
  return Math.max(0, read().until - now);
}

export function recordLoginFailure(now = Date.now()): number {
  const fails = read().fails + 1;
  const wait = cooldownMs(fails);
  const until = wait > 0 ? now + wait : 0;
  write({ fails, until });
  return Math.max(0, until - now);
}

export function clearLoginCooldown() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
