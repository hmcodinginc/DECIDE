import { useCallback, useEffect, useState } from "react";
import { getEntitlement } from "@/services/billing/entitlements";
import type { Entitlement } from "@/types/billing";
import { useAuth } from "@/hooks/useAuth";

function useEntitlements() {
  const { user } = useAuth();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getEntitlement(user?.id ?? null);
      setEntitlement(next);
    } catch {
      setEntitlement(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entitlement, loading, refresh };
}

export { useEntitlements };
