# Implementation status

Updated 14 November 2026. Scope: the reduced core marketplace in `ONE_HOUR_PLAN.md`, not the full original backlog.

## Implemented

- Prisma PostgreSQL schema, initial migration with stock/financial constraints and backend-only RLS/Data API protection, non-destructive demo seed, and connection-check command. Migration configuration supports optional DIRECT_URL for Supabase direct/session connections.
- Farmer/buyer registration with nested profile creation; bcrypt passwords; email/phone login; JWT; global authentication/role guard; active-account checks; current identity/profile routes.
- Public product search/category/location filtering and bounded pagination; owner create/update/deactivation; HTTPS image URL validation.
- Single-farmer orders with server-derived decimal totals, price/name/unit snapshots, ordered row locking, conditional stock updates, transactional cart rollback, authorized status transitions, and exactly-once stock restoration.
- Global validation/error/response handling, CORS, throttling, Swagger, environment validation, and local port 3001.
- Setup/API documentation, fictional seed accounts, and unit plus real-database HTTP test suites.

## Verification completed

- Prisma client generation succeeded; schema validation passed.
- Production build passed; compiled entry is `dist/main.js`.
- Full TypeScript check passed, including seed/scripts/tests.
- 42 unit tests passed across six files.
- Lint passed without warnings after fixes.
- Nine HTTP checks against the compiled app passed: route wiring, Swagger JSON, invalid authentication, DTO/UUID/query validation, and local CORS. These checks intentionally override the database provider and do not establish persistence correctness.
- Production dependency audit reported no known vulnerabilities at check time. No forced dependency upgrades were performed.

## Supabase verification completed

- Connected successfully from the local Prisma/pg stack to Supabase project `project_agri` (`rvxvzkfjdnhrrmhkaist`). Runtime DATABASE_URL uses the shared transaction pooler on port 6543; Prisma migrations use the session pooler DIRECT_URL on port 5432. Credentials remain only in ignored `.env`.
- Applied migration `20261114070000_core_marketplace` successfully with Prisma Migrate. No database reset or Supabase credential reset was performed.
- Seed succeeded twice. The database contains one admin, three farmers, three buyers, and six products; the seed tomato listing retains 500 kg. Existing rows were preserved.
- `npm.cmd run test:smoke` passed all five real PostgreSQL + compiled HTTP scenarios. These cover authentication, roles/ownership, inactive accounts, stock reduction, insufficient stock, concurrent overselling prevention, transactional cart rollback, mixed-farmer rejection, legal/illegal transitions, price snapshots, deactivation, and concurrent cancellation/restoration.
- Smoke fixtures were cleaned up: zero remaining smoke users, zero test orders, and zero products with invalid stock.
- RLS is enabled on all six application tables plus Prisma migration metadata. Verified `anon` and `authenticated` cannot SELECT any of these seven tables.
- The Supabase security advisor reported only seven informational [RLS enabled without policies notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), expected for backend-only tables that deliberately deny direct Data API access. No warning/error findings were returned. All data access goes through NestJS authorization.
- Port 3001 was already occupied by the running backend. It was preserved and verified through real HTTP requests: root, product list (six products), Swagger JSON, and successful farmer1 demo login with token issuance. A redundant second startup was stopped by EADDRINUSE; no existing process was killed.

The reduced core plan is implemented and live database verification is complete. Swagger: `http://127.0.0.1:3001/api/docs`.

## Local configuration

The direct Supabase endpoint could not resolve on this network; switching to the exact shared-pooler host resolved the connection problem. Backend JWT/demo secrets and the PostgreSQL credentials are configured locally and were not printed by setup/verification commands. Hosted database smoke tests allow 30 seconds per scenario for network round trips. Demo credentials are the fictional emails listed in README and the local DEMO_PASSWORD value.

## Deferred

Agencies/commissions, schemes/recommendations, surplus/buyer matching, AI, uploads, password reset/email, wishlist, notifications, editable profiles, dashboards, category/admin management, payments, shipping, reservation expiry, and order request idempotency. See README for API limits and setup.

The original full plan and frontend were preserved. All implementation changes are inside `server/`.
