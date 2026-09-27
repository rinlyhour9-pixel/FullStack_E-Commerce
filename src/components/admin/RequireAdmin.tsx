import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function RequireAdmin() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-ink-soft" role="status">Checking your seller session…</div>;
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
