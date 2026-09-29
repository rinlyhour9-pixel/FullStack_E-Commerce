import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export function RequireAdmin() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { t, language } = useLanguage();
  const km = language === "km";

  if (isLoading)
    return (
      <div
        lang={km ? "km" : undefined}
        className={`flex min-h-screen items-center justify-center bg-cream text-sm text-ink-soft ${km ? "font-khmer" : ""}`}
        role="status"
      >
        {t.admin.common.checkingSession}
      </div>
    );
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
