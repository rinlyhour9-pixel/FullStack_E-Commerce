import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useLanguage } from "./LanguageContext";

export type UserRole = "customer" | "admin";

export interface DemoUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: DemoUser | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
    role?: UserRole,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<DemoUser | null>("tamjit:user", null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const signIn = useCallback(
    async (email: string, password: string, role: UserRole = "customer") => {
      setIsLoading(true);
      await delay(650);
      setIsLoading(false);
      if (!email.includes("@") || password.length < 6) {
        return { ok: false as const, error: t.auth.invalidCredentials };
      }
      const name = email.split("@")[0].replace(/[._-]/g, " ");
      setUser({ name: name.replace(/\b\w/g, (c) => c.toUpperCase()), email, role });
      return { ok: true as const };
    },
    [setUser, t],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole = "customer") => {
      setIsLoading(true);
      await delay(650);
      setIsLoading(false);
      if (!name.trim()) return { ok: false as const, error: t.auth.nameRequired };
      if (!email.includes("@")) return { ok: false as const, error: t.auth.invalidEmail };
      if (password.length < 6) return { ok: false as const, error: t.auth.passwordTooShort };
      setUser({ name, email, role });
      return { ok: true as const };
    },
    [setUser, t],
  );

  const signOut = useCallback(() => setUser(null), [setUser]);

  const value = useMemo(
    () => ({ user, isLoading, signIn, register, signOut }),
    [user, isLoading, signIn, register, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
