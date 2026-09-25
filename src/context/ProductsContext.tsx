import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { baseProducts } from "../data/products";
import { findById, findBySlug, relatedProducts } from "../utils/catalog";
import { slugify } from "../utils/format";
import type { Product } from "../types/product";

export type NewProductInput = Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "reviews">;

interface Overrides {
  edits: Record<string, Partial<Product>>;
  added: Product[];
  deletedIds: string[];
}

const EMPTY_OVERRIDES: Overrides = { edits: {}, added: [], deletedIds: [] };

interface ProductsContextValue {
  products: Product[];
  getBySlug: (slug: string) => Product | undefined;
  getById: (id: string) => Product | undefined;
  getRelated: (product: Product, count?: number) => Product[];
  addProduct: (input: NewProductInput) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  isCustomProduct: (id: string) => boolean;
  resetCatalog: () => void;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

function uniqueSlug(name: string, existing: Product[]): string {
  const base = slugify(name) || "product";
  let candidate = base;
  let suffix = 2;
  while (existing.some((product) => product.slug === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useLocalStorage<Overrides>("tamjit:product-overrides", EMPTY_OVERRIDES);

  const products = useMemo(() => {
    const applyEdit = (product: Product) =>
      overrides.edits[product.id] ? { ...product, ...overrides.edits[product.id] } : product;

    const editedBase = baseProducts
      .filter((product) => !overrides.deletedIds.includes(product.id))
      .map(applyEdit);

    const editedAdded = overrides.added
      .filter((product) => !overrides.deletedIds.includes(product.id))
      .map(applyEdit);

    return [...editedBase, ...editedAdded];
  }, [overrides]);

  const getBySlug = useCallback((slug: string) => findBySlug(products, slug), [products]);
  const getById = useCallback((id: string) => findById(products, id), [products]);
  const getRelated = useCallback(
    (product: Product, count = 4) => relatedProducts(products, product, count),
    [products],
  );

  const addProduct = useCallback(
    (input: NewProductInput): Product => {
      const id = `custom-${Date.now().toString(36)}`;
      const newProduct: Product = {
        ...input,
        id,
        slug: uniqueSlug(input.name, products),
        rating: 0,
        reviewCount: 0,
        reviews: [],
      };
      setOverrides((current) => ({ ...current, added: [...current.added, newProduct] }));
      return newProduct;
    },
    [products, setOverrides],
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      setOverrides((current) => {
        const isAdded = current.added.some((product) => product.id === id);
        if (isAdded) {
          return {
            ...current,
            added: current.added.map((product) => (product.id === id ? { ...product, ...patch } : product)),
          };
        }
        return {
          ...current,
          edits: { ...current.edits, [id]: { ...current.edits[id], ...patch } },
        };
      });
    },
    [setOverrides],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setOverrides((current) => ({
        ...current,
        added: current.added.filter((product) => product.id !== id),
        deletedIds: current.deletedIds.includes(id) ? current.deletedIds : [...current.deletedIds, id],
      }));
    },
    [setOverrides],
  );

  const isCustomProduct = useCallback(
    (id: string) => overrides.added.some((product) => product.id === id),
    [overrides.added],
  );

  const resetCatalog = useCallback(() => setOverrides(EMPTY_OVERRIDES), [setOverrides]);

  const value = useMemo(
    () => ({
      products,
      getBySlug,
      getById,
      getRelated,
      addProduct,
      updateProduct,
      deleteProduct,
      isCustomProduct,
      resetCatalog,
    }),
    [products, getBySlug, getById, getRelated, addProduct, updateProduct, deleteProduct, isCustomProduct, resetCatalog],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error("useProducts must be used within a ProductsProvider");
  return context;
}
