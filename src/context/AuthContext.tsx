import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, getToken, setToken } from "../api/client";
import { useLanguage } from "./LanguageContext";

export type UserRole = "customer" | "admin";
export interface DemoUser { id: string; name: string; email: string; role: UserRole }
interface AuthResponse { accessToken: string; user: DemoUser }
interface AuthContextValue {
  user: DemoUser | null; isLoading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>; refreshProfile: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const refreshProfile = useCallback(async () => {
    if (!getToken()) { setUser(null); setIsLoading(false); return; }
    setIsLoading(true);
    try { setUser(await api.get<DemoUser>("/auth/me")); }
    catch { setToken(null); setUser(null); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void refreshProfile(); }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string, role: UserRole = "customer") => {
    setIsLoading(true);
    try {
      const result = await api.post<AuthResponse>("/auth/login", { email, password });
      if (role === "admin" && result.user.role !== "admin") return { ok: false as const, error: t.auth.invalidCredentials };
      setToken(result.accessToken); setUser(result.user);
      return { ok: true as const };
    } catch (error) { return { ok: false as const, error: error instanceof Error ? error.message : t.auth.invalidCredentials }; }
    finally { setIsLoading(false); }
  }, [t]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.post<AuthResponse>("/auth/register", { name, email, password });
      setToken(result.accessToken); setUser(result.user);
      return { ok: true as const };
    } catch (error) { return { ok: false as const, error: error instanceof Error ? error.message : t.auth.invalidCredentials }; }
    finally { setIsLoading(false); }
  }, [t]);

  const signOut = useCallback(async () => {
    try { if (getToken()) await api.post("/auth/logout"); } catch { /* Clear local session even if the API is unreachable. */ }
    setToken(null); setUser(null);
  }, []);
  const value = useMemo(() => ({ user, isLoading, signIn, register, signOut, refreshProfile }), [user, isLoading, signIn, register, signOut, refreshProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within an AuthProvider"); return context; }
