# TAMJIT Skincare Store

React/Vite storefront with an API built on NestJS, TypeScript, PostgreSQL, and Prisma. The existing storefront routes, responsive styling, product images, and English/Khmer language switch are retained. Product catalog data is seeded from `src/data/products.ts`.

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 15 or newer (local service or Docker)

For a local PostgreSQL container:

```sh
docker run --name tamjit-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tamjit -p 5432:5432 -d postgres:16
```

## Setup

From the repository root:

```sh
npm install
copy .env.example .env.local
cd backend
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run start:dev
```

Set a long random `JWT_SECRET` in `backend/.env`. Configure `DATABASE_URL`, `FRONTEND_ORIGINS`, and optional checkout values there. `FRONTEND_ORIGINS` accepts a comma-separated allowlist; include the exact deployed frontend origin in production. The API uses `PORT` (default `3001`) and the frontend defaults to `http://localhost:3001/api`.

In another terminal, from the repository root:

```sh
npm run dev
```

To use a different API address, set `VITE_API_URL` in `.env.local`, for example `VITE_API_URL=https://api.example.com/api`.

## First admin account

Public registration only creates customer accounts. Set the admin details as one-time environment variables and run the setup command from `backend`:

PowerShell:

```powershell
$env:ADMIN_EMAIL = "seller@example.com"
$env:ADMIN_NAME = "Store Admin"
$env:ADMIN_PASSWORD = "use-a-long-unique-password"
npm run admin:create
```

macOS/Linux:

```sh
ADMIN_EMAIL=seller@example.com ADMIN_NAME="Store Admin" ADMIN_PASSWORD="use-a-long-unique-password" npm run admin:create
```

The command requires a password of at least 12 characters and hashes it before saving. Admins sign in at `/admin/login` with this account.

## Database commands

Run from `backend`:

```sh
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

The seed is safe to rerun and imports the catalog, image paths, variants, stock, and sample product reviews from the current frontend catalog. New schema changes should use `npx prisma migrate dev --name describe_change` during development, then commit the generated migration.

## Build and tests

From the root, after setup:

```sh
npm run build
cd backend
npm run build
npm test
```

## API and checkout

The REST API is prefixed with `/api`. Swagger is served at `http://localhost:3001/api/docs` while the API is running. Authentication uses a bearer token, with role and ownership checks on protected routes. Authentication routes are rate limited and request bodies are validated with a whitelist.

Checkout is cash on delivery. The server reads the signed-in customer's cart and current database prices, calculates shipping, tax, and total, atomically checks/decrements inventory, snapshots order lines, and clears the cart. It never reports an online payment as successful.

### Main routes

| Area | Routes |
|---|---|
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Catalog | `GET /api/products` (search, category, skin type, price, sort, page, limit), `GET /api/products/:slug`, `GET /api/categories`, `POST /api/products/:id/reviews` |
| Customer shopping | `GET /api/cart`, `PUT /api/cart/items`, `DELETE /api/cart/items/:variantId`, `DELETE /api/cart`, `GET /api/wishlist`, `PUT/DELETE /api/wishlist/:productId` |
| Orders | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` |
| Newsletter | `POST /api/newsletter/subscribe` |
| Admin | `/api/admin/products`, `/api/admin/orders`, `/api/admin/customers`, `/api/admin/stats` (all admin-only; see Swagger for methods) |

## Persistent and local data

Users, catalog entries, variants, stock, reviews, carts, wishlists, orders, and newsletter subscriptions are stored in PostgreSQL. Language selection and purely visual UI preferences remain local to the browser. Store information and routine scoring are static/client-side because those screens do not collect records.
