# Agricultural Marketplace API

NestJS 12 + PostgreSQL + Prisma 7 backend for the reduced scope in [ONE_HOUR_PLAN.md](ONE_HOUR_PLAN.md). Runs independently of the frontend. All implementation lives in `server/`.

Implemented: farmer/buyer registration, email-or-phone login, JWT authentication, current user/profiles, product listings and owner management, single-farmer orders, atomic stock reservation, guarded fulfilment transitions, and exactly-once cancellation/rejection restoration. APIs use `/api`; Swagger is at `http://127.0.0.1:3001/api/docs`.

## Setup

Use the existing supported Node installation (this workspace uses Node 26). Prisma 7 requires a compatible modern Node version. In PowerShell use `npm.cmd`/`npx.cmd` because this machine blocks `npm.ps1`.

Run inside `server/`:

```powershell
npm.cmd ci
npm.cmd run env:setup
```

Edit `.env` locally. Never paste credentials into chat or commit them.

For Supabase, open your project dashboard **Connect -> Session pooler**, select the URI, replace the password placeholder locally, and save it as `DATABASE_URL` in `.env`. Copy the exact pooler hostname/username shown by Supabase; do not guess them. Session mode uses port 5432 and works on IPv4 networks. URL-encode special characters in the password. The HTTPS project URL and publishable/service keys are not PostgreSQL credentials. See the [Supabase Prisma guide](https://supabase.com/docs/guides/database/prisma).

`env:setup` fills missing local defaults and generates JWT/demo secrets without printing them. It preserves existing configured values and does not invent a database password. If using transaction-mode pooling on port 6543 later, configure a separate direct/session `DIRECT_URL` for migrations; otherwise leave it empty.

The initial migration enables RLS on all six backend tables and revokes `anon`/`authenticated` Data API access. Clients access these tables through NestJS, so no browser-facing RLS policies are created. The database account must own the tables or have appropriate backend privileges. This MVP keeps its NestJS JWT authentication; it does not use Supabase Auth. Prisma migration files remain the source of schema history.

| Variable                                | Meaning                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                          | Existing PostgreSQL connection URL with provider-required SSL options. Use a dedicated development database. |
| `DIRECT_URL`                            | Optional direct/session connection for Prisma migrations; falls back to DATABASE_URL. |
| `JWT_SECRET`                            | Random secret of at least 32 characters; placeholders are rejected.                                          |
| `JWT_EXPIRES_IN`                        | Duration such as `1h`; default `1h`.                                                                         |
| `PORT`                                  | Backend port, default `3001`. Server binds to `127.0.0.1` for local development.                             |
| `CLIENT_URL`                            | Comma-separated allowed origins, default `http://localhost:3000`. No wildcard.                               |
| `DEMO_PASSWORD`                         | Password for newly seeded demo accounts: 10-72 printable ASCII characters.                                   |
| `OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET` | Optional existing Observe integration. Enabled only when both are configured.                                |
| `TEST_DATABASE_URL`                     | Optional separate migrated PostgreSQL database for HTTP smoke tests; otherwise tests use `DATABASE_URL`.     |

`npm.cmd run env:setup` generates the local JWT secret and demo password if missing. You can inspect these locally in `.env`; they are never logged by the setup script.

```powershell
npm.cmd run db:generate
npm.cmd run db:check
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run build
npm.cmd run start:prod
```

`db:migrate` applies the checked-in migration. Use an empty development database or review compatibility before applying to a database with existing tables named User/Product/Order. Do not use reset or force-push commands against an existing database. `db:seed` preserves existing rows and stock; changing `DEMO_PASSWORD` does not reset existing seeded passwords. `npm.cmd run start:dev` starts watch mode.

## Demo accounts

The seed creates `farmer1@example.test` through `farmer3@example.test`, `buyer1@example.test` through `buyer3@example.test`, and `admin@example.test`. New accounts use your configured `DEMO_PASSWORD`. These are fictional accounts. The ADMIN account has current-user access only; no admin management API exists in this scope.

Six products belong to farmer1: tomatoes, bananas, coconuts, rice, carrots, and turmeric. The tomato ID is `a0000000-0000-4000-8000-000000000001`; initial stock is 500 kg. Repeated seeding does not reset stock. Orders are created through the API/smoke flow rather than bypassing inventory rules in the seed.

## API contract

Responses use `{ "success": true, "data": ... }`; lists also have `meta: { page, limit, total, totalPages }`. Errors use `{ "success": false, "message": ... }` and an appropriate HTTP status. Password hashes are never selected for user responses. Unknown request fields are rejected.

| Method        | Route after `/api`           | Access                                       |
| ------------- | ---------------------------- | -------------------------------------------- |
| POST          | `/auth/register`             | Public; FARMER or BUYER only                 |
| POST          | `/auth/login`                | Public; `identifier` is email or exact phone |
| GET           | `/auth/me`, `/users/me`      | Active authenticated user                    |
| GET           | `/farmers/me`                | FARMER                                       |
| GET           | `/buyers/me`                 | BUYER                                        |
| GET           | `/products`, `/products/:id` | Public, available active listings only       |
| POST          | `/products`                  | FARMER                                       |
| PATCH, DELETE | `/products/:id`              | Owning FARMER; DELETE deactivates            |
| POST          | `/orders`                    | BUYER                                        |
| GET           | `/orders/my`, `/orders/:id`  | Owning BUYER or FARMER                       |
| PATCH         | `/orders/:id/status`         | Owning FARMER                                |
| POST          | `/orders/:id/cancel`         | Owning BUYER; pending orders only            |

Supply `Authorization: Bearer <accessToken>` on protected calls. Owner IDs come from authentication, never the body. Resource `farmerId`/`buyerId` refer to profile IDs; `user.id` is a separate identity. Public products do not expose farmer contact details.

Product list queries: `page` (default 1), `limit` (default 10, max 100), `search`, `category`, `location`. Lists are newest first with ID as a stable tiebreaker. Route UUIDs are validated.

Money and quantities are decimal **strings**. Currency is INR. Prices have at most two fractional digits; quantities have at most three. Item totals round half up to two decimal places; order totals sum rounded item totals. Items below INR 0.01 after rounding are rejected. Order prices/totals are calculated on the server and stored as snapshots.

Create a product:

```json
{
  "name": "Tomatoes",
  "category": "Vegetables",
  "description": "Fresh harvest",
  "quantity": "500",
  "unit": "kg",
  "pricePerUnit": "25.00",
  "location": "Coimbatore, Tamil Nadu",
  "images": []
}
```

Updates accept descriptive fields, unit, price, location, and HTTPS image URLs. Quantity and availability cannot be overwritten. Uploads and restocking are deferred. Deactivation hides a listing while retaining existing order references.

Place an order:

```json
{
  "items": [
    { "productId": "a0000000-0000-4000-8000-000000000001", "quantity": "300" }
  ],
  "deliveryAddress": "Demo market, Coimbatore",
  "notes": "Demo pickup arrangement"
}
```

Orders allow 1-50 distinct products from one farmer. Duplicate products and mixed-farmer carts are rejected. Stock is reserved immediately. Payments, shipping, taxes, automatic reservation expiry, and external contact are outside this scope.

Farmer transitions: `PENDING -> CONFIRMED -> COMPLETED`, or `PENDING -> REJECTED`. Buyer cancellation: `PENDING -> CANCELLED`. Send `{ "status": "CONFIRMED" }` to the status endpoint. Terminal transitions return 409. Restoration and status changes share a transaction, preventing double restock. Inactive listings stay inactive after restoration.

PostgreSQL row locks and conditional updates protect stock; an order commits or rolls back as a whole. Database constraints enforce positive quantities/prices/totals and stock within its initial quantity. Request idempotency keys are deferred: retrying order creation may create another order if stock remains. Avoid automatic POST retries after ambiguous network failures.

## Verification

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
npm.cmd run test:smoke
```

Unit tests need no database credentials. `test:smoke` builds and starts the compiled backend on a free local port against real PostgreSQL. Migrate the selected database first. It verifies auth/roles/ownership, inactive users, stock reduction, insufficient stock, concurrent overselling, cart rollback, transitions, price snapshots, deactivation, and concurrent cancellation. Uniquely named fixtures are created and only those fixtures are removed afterward. No data reset is performed. Use a development/test database. Tests fail clearly if no database URL is configured; they do not substitute memory storage.

To migrate a separate test database, temporarily set `DATABASE_URL` to that database in your PowerShell session before `npm.cmd run db:migrate`. Variables loaded from `.env` are not exported into the parent shell. The simplest setup uses the same dedicated development `DATABASE_URL` for migration and smoke tests.

The local default limits API requests to 120/minute per IP per process; login and registration each allow 10/minute. Distributed rate limiting, refresh/session revocation, and deployment proxy settings are deferred.

## Deferred scope and limits

The original [plan.md](plan.md) remains the full backlog. Agencies/commissions, schemes/recommendations, surplus/matching, AI agents, notifications, wishlist, Cloudinary, password reset/email, profile edits, dashboards, category administration, and full admin management are not implemented. No AI/storage/external messaging credentials are required. There are no placeholder success endpoints for these features.

This is a local demo backend. Build/unit success does not establish live database correctness; see [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for the checks actually completed.
