import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { bindCheckoutToAuthUser } from "@/lib/checkout-session";
import { authService } from "@/services/auth/auth-service";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    bindCheckoutToAuthUser(previousUserId.current, user?.id ?? null);
    previousUserId.current = user?.id ?? null;
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    let ready = false;

    const unsubscribe = authService.onAuthChange((next) => {
      if (!active || !ready) return;
      setUser(next);
    });

    void authService
      .loadInitialAuth()
      .then((next) => {
        if (!active) return;
        setUser(next);
        ready = true;
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        ready = true;
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, configured: authService.configured }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
