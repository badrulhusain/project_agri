# Agricultural marketplace: reviewed one-hour backend plan

## Decision

The original `plan.md` is the full product backlog. Starting from the current starter app, completing all 17 modules securely and testing every workflow within one hour is not realistic. Use this reduced plan for a demo backend. The timeboxes are targets, not a completion guarantee; database setup and dependency compatibility are the first risks.

All work stays inside `server/`. Do not inspect or change `client/`. Preserve the existing app, ESM configuration, and Vitest setup.

## Verified starting point

- `package.json` declares NestJS 12, TypeScript 6, ESM, Vitest, and Express. Local relative imports use `.js`.
- `src/` contains the starter controller/service and Observe instrumentation only.
- Prisma, authentication, validation, Swagger, and configuration packages are not declared in the current manifest.
- No `prisma/schema.prisma`, `.env`, or `.env.example` exists. A working PostgreSQL connection has not been verified.
- `node_modules/` exists. Preserve the existing untracked `package-lock.json`.
- The backend currently defaults to port 3000, which conflicts with the planned local frontend port. Use backend port 3001.
- PowerShell blocks `npm.ps1` here. Use `npm.cmd` for commands without changing execution policy.

## One-hour scope

Deliver one real database-backed flow: farmer registers and logs in, farmer creates a product, buyer browses and orders, farmer confirms/completes the order, and remaining stock stays correct. Demonstrate through HTTP requests or Swagger; frontend integration is outside this server-only timebox.

Keep:

- PostgreSQL + Prisma, a migration, and a small repeatable demo seed.
- JWT login, bcrypt, DTO validation, role and ownership checks; public registration for FARMER and BUYER only. Create ADMIN through seed/setup only.
- User identity and minimal farmer/buyer profiles.
- Product creation, owner edits, soft deactivation, and public browse/detail with bounded pagination and basic search/category filtering.
- Single-farmer orders, server-calculated Decimal totals, atomic stock reservation, authorized status changes, and cancellation/rejection stock restoration.
- `/api` prefix, configurable CORS, `/api/docs`, `.env.example`, and setup/demo instructions.
- Focused security/stock tests and one real-database smoke run.

Defer explicitly:

- Agency onboarding/connections, delegation, commissions, and agency dashboards.
- Government schemes, recommendations, surplus detection, buyer matching, and all AI provider/agent integration.
- Cloudinary uploads; use validated image URLs for the demo.
- Password reset/email delivery, wishlist, notifications, category administration, advanced filters, reporting, and full admin CRUD.
- Production deployment and production-readiness claims.

These deferred features remain requirements in the original backlog. Do not create placeholder endpoints or claim they are implemented. If judging requires AI or agencies, this scope must be changed explicitly; neither is delivered by this one-hour core plan.

## Schedule and stop rules

| Elapsed time | Work                                                                                                                                                  | Exit condition                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 0-8 min      | Check existing scripts, install only required packages with compatible versions, configure Prisma/PostgreSQL and environment, migrate minimal schema. | A real database query succeeds.                                                                 |
| 8-20 min     | Registration/login, safe user selection, JWT/role guards, minimal profiles, global validation.                                                        | Farmer and buyer can log in; invalid token and forbidden role requests fail.                    |
| 20-30 min    | Product create/edit/deactivate and public listing/detail.                                                                                             | Farmer creates a product; a different farmer cannot edit it; buyers see available listings.     |
| 30-44 min    | Order transaction, stock reservation, ownership-scoped reads, guarded transitions, cancellation/rejection restoration.                                | Overselling fails; stock changes correctly; repeat cancellation has no additional stock effect. |
| 44-60 min    | Finish seed, Swagger, README; run focused tests, lint, build, and real HTTP/database smoke checks.                                                    | Record what passed and any blocker; stop adding features.                                       |

If PostgreSQL cannot be reached by minute 8, report that blocker immediately and keep the remaining work limited to the core. Do not silently substitute in-memory storage or spend the hour trying multiple hosting providers. A backend that has not passed a real database smoke test is not verified runnable.

Start compiling after the foundation and after each core module. If a timebox slips, cut product sorting, profile edit endpoints, and cosmetic response messages before cutting authorization, stock safety, or the final verification window. Keep API documentation minimal. Avoid building all backlog models before the core flow works.

## Minimal schema and API contract

Models: `User`, `FarmerProfile`, `BuyerProfile`, `Product`, `Order`, `OrderItem`. A category string/enum is enough for this reduced scope; normalize categories when category management is implemented. Profiles reference `User`; products reference `FarmerProfile`; orders reference the buyer and farmer profiles consistently. Document which IDs each endpoint accepts.

Use unique normalized emails and unique non-null phones if phone login is retained. Use Decimal for prices, quantities, and totals, a documented currency/rounding policy, positive quantity validation, and foreign keys. Keep the stock invariant `0 <= availableQuantity <= quantity`. Do not let generic product updates overwrite stock directly. Soft-deactivate products so existing order items remain valid.

Core routes:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- `GET /api/farmers/me`, `GET /api/buyers/me`.
- `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id`.
- `POST /api/orders`, `GET /api/orders/my`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status`, `POST /api/orders/:id/cancel`.

Registration creates the matching profile transactionally. Derive the acting user from authentication; do not trust a body-supplied owner or buyer ID. Never return hashes. Reject inactive users and public ADMIN/AGENCY registration in this reduced scope. Require a configured JWT secret without an insecure fallback.

For public products, include active AVAILABLE/PARTIALLY_SOLD listings with positive available quantity. Cap page size and allowlist sort fields if sorting is added.

For orders, reject mixed-farmer items and aggregate or reject duplicate product IDs. Ignore client-supplied prices/totals. Reserve stock using a conditional atomic decrement inside the same database transaction as order creation; a transaction around a separate read/check is insufficient by itself. Fail the entire order if any product cannot be reserved.

Use a documented reduced transition map: `PENDING -> CONFIRMED -> COMPLETED`; buyer cancellation and farmer rejection are allowed only from `PENDING`. Only the owning farmer can confirm, reject, or complete. Restore stock in the same transaction as a conditional transition out of PENDING, so concurrent/repeated requests cannot restore it twice. Reconcile product availability status after every stock change. Fulfilment intermediate states remain deferred.

## Corrections needed in the full backlog

1. Agency acceptance/rejection belongs to the authenticated farmer. An agency must never approve its own request. Prefer a farmer-scoped connection endpoint with a connection/agency ID; the original agency-scoped URLs are ambiguous.
2. An order has one `farmerId`; either reject mixed-farmer carts or split them into separate orders. Define this before implementation.
3. Cancellation/rejection needs an explicit transition policy and exactly-once stock restoration. Define who may update each status.
4. An agency ID supplied by a buyer does not prove facilitation. Define authorization/consent, snapshot the agreed rate at the chosen contractual event, and enforce one commission per completed order with a unique constraint and transactional status handling.
5. Categories need a model and endpoints if they are administered separately; the original schema lists only a product category field.
6. Secure reset flows need hashed reset tokens, expiry, single use, enumeration-safe responses, and a delivery mechanism. Never return reset secrets through the public forgot-password endpoint.
7. Agency-assisted farmer creation needs an invitation/claim workflow. Do not let an agency choose and retain the farmer's password or self-grant product permissions.
8. Exact buyer quantity matching needs buyer demand/capacity data, which the current BuyerProfile does not contain. Add it later or disclose that matching uses category/location only.
9. Normalize land units and define structured scheme rules before scoring. Clearly mark sample scheme fixtures as demo data; do not represent sample benefits/deadlines as verified current government information.
10. Define buyer-contact consent and the notification/contact mechanism before implementing a contact action. AI architecture alone does not implement a working agent.
11. Do not assume public auth responses or role guards enforce record ownership. Check ownership on every scoped read and write, including notifications, orders, and agency actions.
12. Before adding the original dynamic routes, prevent static paths such as `/schemes/recommendations` and `/notifications/read-all` from being captured by `:id` routes.

## Search and execution budget

- Initial local inspection is complete. Read only files needed for the current change or a concrete error; do not re-scan the repo or open the frontend.
- Keep NestJS, Prisma, PostgreSQL, JWT, bcrypt, and the existing test runner. No framework/provider comparison or application recreation.
- Check installed package types/exports and lockfile first. Use one targeted official documentation lookup when an API/version incompatibility actually requires it; avoid broad tutorials and repeated searches.
- Install missing packages in a batch inside `server/`, after checking compatibility with the declared Nest major and ESM configuration. Avoid unqualified upgrades.
- Do not configure AI keys, Cloudinary accounts, Observe linking, deployment, queues, cron, or extra abstractions for this reduced scope.
- Run relevant commands with `npm.cmd`; retain useful errors and fix their cause before retrying. Do not rerun unchanged successful checks.

## Definition of done

- Migration and repeatable demo seed succeed against PostgreSQL; seed uses fictional accounts and documented demo credentials.
- Real HTTP smoke flow: login -> create 500 kg tomato listing -> buyer orders 300 kg -> 200 kg remains -> another request for 201 kg fails -> cancel pending order -> 500 kg remains -> repeated cancellation cannot increase stock.
- A competing-order database check proves that two simultaneous 300 kg orders against 500 kg cannot both succeed.
- Tests cover invalid auth, forbidden role, foreign-product/foreign-order access, insufficient stock, legal/illegal transitions, and exactly-once restock.
- `npm.cmd run test`, `npm.cmd run lint`, and `npm.cmd run build` pass. Run the e2e script if the smoke coverage is implemented there; verify the actual compiled production entry path before documenting startup.
- README includes environment variables, migration/seed commands, port 3001, Swagger URL, demo requests, and the deferred scope. No actual secrets are committed.
- Final handoff separates implemented, verified, deferred, and blocked items. A successful build alone does not prove database/runtime correctness.

This file is a plan review. It does not mean the backend features or checks above have already been implemented or passed.
