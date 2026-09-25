# TAMJIT — Skincare E-Commerce Demo

A polished, fully bilingual (English / Khmer) skincare storefront built as a demo e-commerce experience. React 19 + TypeScript + Vite + Tailwind CSS v4, with a localStorage-backed cart, wishlist, demo auth, orders, and a seller/admin dashboard — no backend required.

## Features

- **Storefront**: home, shop with filters/sort/search, product detail (gallery, variants, reviews), cart, checkout with validation and a demo order confirmation, account, wishlist, sign-in/register, a "Routine Finder" quiz, and a store-information page.
- **Bilingual (EN / ខ្មែរ)**: a language switcher in the header/mobile menu drives a fully-typed translation system (`src/i18n/translations.ts`) covering navigation, forms, cart/checkout, and the routine finder.
- **Seller dashboard** (`/admin`): role-gated, with product CRUD (including stock per variant), order management with status updates, a derived customer list, and a live analytics dashboard — all backed by a `localStorage` overlay on top of the base catalog.
- **Persistent demo state**: cart, wishlist, orders, language, and the admin catalog overlay all persist via `localStorage`. No real backend, payments, or authentication.
- **Accessible & responsive**: keyboard navigation, visible focus states, reduced-motion support, and mobile/tablet/desktop layouts throughout.

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS-first theme in `src/index.css`)
- React Router v7
- No backend — sample data lives in `src/data/products.ts` and is designed to be swapped for a real API later.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Project structure

```
src/
  types/          # Product, order, and shared type definitions
  data/products.ts  # Sample catalog (swap for a real API later)
  i18n/           # Translation dictionaries (en / km)
  context/        # Cart, Wishlist, Auth, Orders, Products, Language, Toast, UI
  hooks/          # useLocalStorage, useReveal, useReducedMotion
  components/
    layout/       # Header, Footer, mobile menu, search modal, language switcher
    ui/           # Button, StarRating, QuantitySelector, EmptyState, etc.
    home/         # Hero, categories, promo, testimonials, newsletter
    product/      # Product card/grid, gallery, filters, reviews
    cart/         # Cart drawer
    admin/        # Admin layout, route guard, stat cards, order status badge
  pages/          # Route-level pages (storefront + admin/*)
```

## Demo accounts

- **Customer**: any email + password (6+ characters) on `/sign-in` or `/register`.
- **Seller**: any email + password (6+ characters) on `/admin/login`.

No real data is collected — everything lives in your browser's `localStorage`.
