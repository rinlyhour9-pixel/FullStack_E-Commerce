import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";
import type { Product } from "../types/product";
interface WishlistContextValue { ids: string[]; items: Product[]; isSaved: (productId: string) => boolean; toggle: (productId: string) => Promise<boolean>; remove: (productId: string) => void; error: string | null; isLoading: boolean }
const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]); const [error, setError] = useState<string | null>(null); const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => { setIsLoading(true); try { setItems(await api.get<Product[]>("/wishlist")); setError(null); } catch (e) { if (e instanceof Error && "status" in e && (e as { status: number }).status === 401) { setItems([]); setError(null); } else setError(e instanceof Error ? e.message : "Could not load wishlist"); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void refresh(); const changed = () => void refresh(); window.addEventListener("tamjit:auth-changed", changed); return () => window.removeEventListener("tamjit:auth-changed", changed); }, [refresh]);
  const ids = useMemo(() => items.map((p) => p.id), [items]);
  const toggle = useCallback(async (id: string) => { const exists = ids.includes(id); const task = exists ? api.delete<Product[]>(`/wishlist/${encodeURIComponent(id)}`) : api.put<Product[]>(`/wishlist/${encodeURIComponent(id)}`); try { setItems(await task); setError(null); return true; } catch (e) { setError(e instanceof Error ? e.message : "Could not update wishlist"); return false; } }, [ids]);
  const remove = useCallback((id: string) => { void api.delete<Product[]>(`/wishlist/${encodeURIComponent(id)}`).then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Could not remove item")); }, []);
  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);
  const value = useMemo(() => ({ ids, items, isSaved, toggle, remove, error, isLoading }), [ids, items, isSaved, toggle, remove, error, isLoading]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error("useWishlist must be used within a WishlistProvider"); return context; }
