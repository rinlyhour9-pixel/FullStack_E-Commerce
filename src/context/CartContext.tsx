import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useProducts } from "./ProductsContext";
import type { CartLine, Product, ProductVariant } from "../types/product";

export interface CartLineDetail {
  line: CartLine;
  product: Product;
  variant: ProductVariant;
  unitPrice: number;
  lineTotal: number;
}

interface CartContextValue {
  lines: CartLine[];
  lineDetails: CartLineDetail[];
  itemCount: number;
  subtotal: number;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useLocalStorage<CartLine[]>("tamjit:cart", []);
  const { getById } = useProducts();

  const addToCart = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      setLines((current) => {
        const existing = current.find(
          (line) => line.productId === productId && line.variantId === variantId,
        );
        if (existing) {
          return current.map((line) =>
            line === existing ? { ...line, quantity: line.quantity + quantity } : line,
          );
        }
        return [...current, { productId, variantId, quantity }];
      });
    },
    [setLines],
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      setLines((current) =>
        quantity <= 0
          ? current.filter((line) => !(line.productId === productId && line.variantId === variantId))
          : current.map((line) =>
              line.productId === productId && line.variantId === variantId
                ? { ...line, quantity }
                : line,
            ),
      );
    },
    [setLines],
  );

  const removeFromCart = useCallback(
    (productId: string, variantId: string) => {
      setLines((current) =>
        current.filter((line) => !(line.productId === productId && line.variantId === variantId)),
      );
    },
    [setLines],
  );

  const clearCart = useCallback(() => setLines([]), [setLines]);

  const lineDetails = useMemo<CartLineDetail[]>(() => {
    return lines
      .map((line) => {
        const product = getById(line.productId);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        if (!product || !variant) return null;
        const unitPrice = product.price + variant.priceModifier;
        return { line, product, variant, unitPrice, lineTotal: unitPrice * line.quantity };
      })
      .filter((detail): detail is CartLineDetail => detail !== null);
  }, [lines, getById]);

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const subtotal = useMemo(
    () => lineDetails.reduce((sum, detail) => sum + detail.lineTotal, 0),
    [lineDetails],
  );

  const value = useMemo(
    () => ({ lines, lineDetails, itemCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart }),
    [lines, lineDetails, itemCount, subtotal, addToCart, updateQuantity, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
