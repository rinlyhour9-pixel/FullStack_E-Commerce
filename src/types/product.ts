export type ProductCategory =
  | "cleansers"
  | "serums"
  | "moisturizers"
  | "masks"
  | "sun-care"
  | "body";

export type SkinType = "all" | "dry" | "oily" | "combination" | "sensitive";

export interface ProductVariant {
  id: string;
  label: string;
  priceModifier: number;
  stock: number;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  howToUse: string[];
  ingredients: string[];
  category: ProductCategory;
  skinTypes: SkinType[];
  price: number;
  compareAtPrice?: number;
  currency: "USD";
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  badges?: ("new" | "bestseller" | "limited")[];
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
}
