import type { Product, ProductVariant } from "../types/product";

export function isVariantInStock(variant: ProductVariant): boolean {
  return variant.stock > 0;
}

export function isProductInStock(product: Product): boolean {
  return product.variants.some(isVariantInStock);
}

export function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function getDefaultVariant(product: Product): ProductVariant {
  return product.variants.find(isVariantInStock) ?? product.variants[0];
}

export const LOW_STOCK_THRESHOLD = 8;

export function isLowStock(product: Product): boolean {
  const total = getTotalStock(product);
  return total > 0 && total <= LOW_STOCK_THRESHOLD;
}
