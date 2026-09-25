import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useProducts } from "./ProductsContext";
import type { Product } from "../types/product";

interface WishlistContextValue {
  ids: string[];
  items: Product[];
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useLocalStorage<string[]>("tamjit:wishlist", []);
  const { getById } = useProducts();

  const toggle = useCallback(
    (productId: string) => {
      setIds((current) =>
        current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      );
    },
    [setIds],
  );

  const remove = useCallback(
    (productId: string) => {
      setIds((current) => current.filter((id) => id !== productId));
    },
    [setIds],
  );

  const isSaved = useCallback((productId: string) => ids.includes(productId), [ids]);

  const items = useMemo(
    () => ids.map((id) => getById(id)).filter((p): p is Product => !!p),
    [ids, getById],
  );

  const value = useMemo(
    () => ({ ids, items, isSaved, toggle, remove }),
    [ids, items, isSaved, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
