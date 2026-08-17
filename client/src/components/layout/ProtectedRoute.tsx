import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { PageSkeleton } from "@/components/common/PageSkeleton";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSkeleton />;
  if (!user) {
    return (
      <Navigate
        to={`${ROUTES.login}?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
}

export { ProtectedRoute };
