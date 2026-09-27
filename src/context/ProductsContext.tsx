import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";
import { relatedProducts } from "../utils/catalog";
import type { Product } from "../types/product";

export type NewProductInput = Omit<Product, "id" | "slug" | "rating" | "reviewCount" | "reviews">;
interface ProductPage { items: Product[]; total: number }
interface ProductsContextValue {
  products: Product[]; isLoading: boolean; error: string | null; refresh: () => Promise<void>;
  getBySlug: (slug: string) => Product | undefined; getById: (id: string) => Product | undefined;
  getRelated: (product: Product, count?: number) => Product[];
  addProduct: (input: NewProductInput) => Promise<Product>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>; isCustomProduct: (id: string) => boolean; resetCatalog: () => void;
}
const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const response = await api.get<ProductPage>("/products?limit=60"); setProducts(response.items); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load products"); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const getBySlug = useCallback((slug: string) => products.find((p) => p.slug === slug), [products]);
  const getById = useCallback((id: string) => products.find((p) => p.id === id), [products]);
  const getRelated = useCallback((product: Product, count = 4) => relatedProducts(products, product, count), [products]);
  const addProduct = useCallback(async (input: NewProductInput) => { const product = await api.post<Product>("/admin/products", input); setProducts((items) => [product, ...items]); return product; }, []);
  const updateProduct = useCallback(async (id: string, patch: Partial<Product>) => {
    const current = products.find((p) => p.id === id); if (!current) throw new Error("Product not found");
    const merged = { ...current, ...patch };
    const payload = { name: merged.name, tagline: merged.tagline, description: merged.description, howToUse: merged.howToUse, ingredients: merged.ingredients, category: merged.category, skinTypes: merged.skinTypes, price: merged.price, compareAtPrice: merged.compareAtPrice, currency: merged.currency, images: merged.images, variants: merged.variants, badges: merged.badges };
    const product = await api.patch<Product>(`/admin/products/${id}`, payload);
    setProducts((items) => items.map((item) => item.id === id ? product : item)); return product;
  }, [products]);
  const deleteProduct = useCallback(async (id: string) => { await api.delete(`/admin/products/${id}`); setProducts((items) => items.filter((item) => item.id !== id)); }, []);
  const isCustomProduct = useCallback(() => false, []);
  const resetCatalog = useCallback(() => { void refresh(); }, [refresh]);
  const value = useMemo(() => ({ products, isLoading, error, refresh, getBySlug, getById, getRelated, addProduct, updateProduct, deleteProduct, isCustomProduct, resetCatalog }), [products, isLoading, error, refresh, getBySlug, getById, getRelated, addProduct, updateProduct, deleteProduct, isCustomProduct, resetCatalog]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
export function useProducts() { const context = useContext(ProductsContext); if (!context) throw new Error("useProducts must be used within a ProductsProvider"); return context; }
