import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../../components/ui/Button";
import { LeafMarkIcon } from "../../components/ui/icons";

export function AdminLogin() {
  const { user, signIn, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const km = language === "km";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = await signIn(email, password, "admin");
    if (result.ok) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-14">
      <div
        lang={km ? "km" : undefined}
        className={`w-full max-w-md rounded-3xl border border-cream/10 bg-cream/3 p-8 sm:p-10 ${km ? "font-khmer" : ""}`}
      >
        <div className="mb-6 text-center">
          <LeafMarkIcon className="mx-auto mb-3 h-8 w-8 text-sage" />
          <h1 className="font-display text-2xl text-cream">{t.admin.login.title}</h1>
          <p className="mt-1 text-sm text-cream/60">{t.admin.login.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-cream/80">
              {t.admin.login.emailLabel}
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream focus:border-clay focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-cream/80">
              {t.admin.login.passwordLabel}
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream focus:border-clay focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-clay/15 px-4 py-2.5 text-sm font-medium text-clay">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            {t.admin.login.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-cream/50">
          {t.admin.login.storePrompt}{" "}
          <Link to="/sign-in" className="font-medium text-cream/80 hover:underline">
            {t.admin.login.storeLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
