import { useEffect, useState } from "react";
import {
  clearLoginCooldown,
  recordLoginFailure,
  remainingLoginCooldownMs,
} from "@/lib/login-cooldown";

function useLoginCooldown(enabled: boolean) {
  const [untilTick, setUntilTick] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const remainingMs = enabled ? remainingLoginCooldownMs(now) : 0;
  const locked = remainingMs > 0;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    if (!enabled || !locked) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [enabled, locked, untilTick]);

  return {
    locked,
    remainingSeconds,
    recordFailure() {
      recordLoginFailure();
      setNow(Date.now());
      setUntilTick((value) => value + 1);
    },
    clear() {
      clearLoginCooldown();
      setNow(Date.now());
      setUntilTick((value) => value + 1);
    },
  };
}

export { useLoginCooldown };
