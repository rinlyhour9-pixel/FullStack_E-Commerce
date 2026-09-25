import type { Product } from "../types/product";

export function findBySlug(list: Product[], slug: string): Product | undefined {
  return list.find((product) => product.slug === slug);
}

export function findById(list: Product[], id: string): Product | undefined {
  return list.find((product) => product.id === id);
}

export function relatedProducts(list: Product[], product: Product, count = 4): Product[] {
  return list
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .concat(list.filter((candidate) => candidate.id !== product.id && candidate.category !== product.category))
    .slice(0, count);
}
