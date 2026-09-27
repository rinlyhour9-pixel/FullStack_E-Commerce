import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";
import type { CartLine, Product, ProductVariant } from "../types/product";

export interface CartLineDetail { line: CartLine; product: Product; variant: ProductVariant; unitPrice: number; lineTotal: number }
interface CartResponse { lines: CartLine[]; lineDetails: CartLineDetail[]; itemCount: number; subtotal: number }
interface CartContextValue {
  lines: CartLine[]; lineDetails: CartLineDetail[]; itemCount: number; subtotal: number; error: string | null; isLoading: boolean;
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void; clearCart: () => void; refresh: () => Promise<void>;
}
const CartContext = createContext<CartContextValue | undefined>(undefined);
const empty: CartResponse = { lines: [], lineDetails: [], itemCount: 0, subtotal: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse>(empty);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setCart(await api.get<CartResponse>("/cart")); setError(null); }
    catch (e) { if (e instanceof Error && "status" in e && (e as { status: number }).status === 401) { setCart(empty); setError(null); } else setError(e instanceof Error ? e.message : "Could not load cart"); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void refresh(); const changed = () => void refresh(); window.addEventListener("tamjit:auth-changed", changed); return () => window.removeEventListener("tamjit:auth-changed", changed); }, [refresh]);
  const setLine = useCallback(async (productId: string, variantId: string, quantity: number, add: boolean): Promise<boolean> => {
    const current = cart.lines.find((line) => line.productId === productId && line.variantId === variantId)?.quantity ?? 0;
    const next = add ? current + quantity : quantity;
    try { if (next <= 0) setCart(await api.delete<CartResponse>(`/cart/items/${encodeURIComponent(variantId)}`)); else setCart(await api.put<CartResponse>("/cart/items", { variantId, quantity: next })); setError(null); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Could not update cart"); return false; }
  }, [cart.lines]);
  const addToCart = useCallback((productId: string, variantId: string, quantity = 1) => setLine(productId, variantId, quantity, true), [setLine]);
  const updateQuantity = useCallback((productId: string, variantId: string, quantity: number) => { void setLine(productId, variantId, quantity, false); }, [setLine]);
  const removeFromCart = useCallback((productId: string, variantId: string) => { void setLine(productId, variantId, 0, false); }, [setLine]);
  const clearCart = useCallback(() => { void api.delete("/cart").then(() => setCart(empty)).catch((e) => setError(e instanceof Error ? e.message : "Could not clear cart")); }, []);
  const value = useMemo(() => ({ ...cart, error, isLoading, addToCart, updateQuantity, removeFromCart, clearCart, refresh }), [cart, error, isLoading, addToCart, updateQuantity, removeFromCart, clearCart, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within a CartProvider"); return context; }
