import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/ui/Button";
import { LeafMarkIcon } from "../components/ui/icons";

export function Register() {
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = await register(name, email, password);
    if (result.ok) {
      showToast(t.auth.accountCreated, "success");
      navigate("/account");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container-shop flex min-h-[70vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 sm:p-10">
        <div className="mb-6 text-center">
          <LeafMarkIcon className="mx-auto mb-3 h-8 w-8 text-forest" />
          <h1 className="font-display text-2xl text-ink">{t.auth.registerTitle}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t.auth.registerSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium text-ink">
              {t.auth.fullNameLabel}
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium text-ink">
              {t.auth.emailLabel}
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium text-ink">
              {t.auth.passwordLabel}
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-ink-soft">{t.auth.passwordHint}</p>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-clay/10 px-4 py-2.5 text-sm font-medium text-clay-dark">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
            {t.auth.createAccountButton}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          {t.auth.alreadyHaveAccount}{" "}
          <Link to="/sign-in" className="font-medium text-forest hover:underline">
            {t.auth.signInLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
