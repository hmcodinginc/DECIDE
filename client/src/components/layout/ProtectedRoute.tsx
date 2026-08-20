import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { authHref, rememberAuthNext } from "@/lib/auth-next";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSkeleton />;
  if (!user) {
    const next = `${location.pathname}${location.search}`;
    rememberAuthNext(next);
    return (
      <Navigate
        to={authHref("login", next)}
        replace
      />
    );
  }
  return children;
}

export { ProtectedRoute };
