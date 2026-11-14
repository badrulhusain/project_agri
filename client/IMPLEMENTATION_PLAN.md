# Frontend implementation plan

## Current state and scope

- `client/` is an unmodified Next.js 16.4.6 App Router starter using React 19, TypeScript, and Tailwind CSS 4. It has no application routes, design system, API client, or product dependencies yet.
- Build only inside `client/`. Keep the existing `app/` directory and `@/*` alias unless a concrete need justifies moving them. Do not touch `server/`.
- The product serves farmers, buyers, agencies, and admins. Prioritize the farmer's phone experience, then buyer purchasing, then agency and admin operations.
- No backend contract is available in `client/` yet. API paths, request shapes, authentication method, and permissions must be confirmed from supplied API documentation or a running Swagger/OpenAPI endpoint before integration. Record unsupported features as gaps.

## Product and design decisions

- Use plain, action-oriented English and natural Malayalam. Keep the chosen language across navigation and refreshes. Use a Malayalam-capable font and test labels at real mobile widths.
- Design for low-cost Android phones: readable type, large labelled controls, short forms, visible progress, compressed images, and useful screens even when requests are slow. Never encode meaning through color alone.
- Establish tokens for green, warm neutral surfaces, text, borders, spacing, radii, focus rings, and status colors. Use real agricultural photography with appropriate usage rights, descriptive alt text, and `next/image` sizing.
- Public pages should feel welcoming and trustworthy. Farmer pages should show the next action prominently; buyer pages should emphasize searchable supply, quantity, location, and total cost. Agency and admin pages can use denser tables where justified.
- Every data-driven page needs loading, empty, error, and retry states. Mutations need pending, success, and failure feedback; no local placeholder action may claim a real transaction succeeded.

## Architecture

Use the existing root `app/` structure, adding route groups where helpful:

```text
client/
  app/
    (public)/page.tsx
    (auth)/login|register|forgot-password|reset-password/
    farmer/ buyer/ agency/ admin/
  components/ui/       # accessible primitives
  components/layout/   # public and role-specific navigation
  components/common/   # shared states, cards, confirmations
  features/            # auth, products, orders, schemes, surplus, etc.
  lib/api/             # client, transport, typed services, query hooks
  lib/i18n/            # English and Malayalam dictionaries
  types/
  public/images/
```

- Keep route files thin; put forms, data hooks, and business presentation in `features/`. Share product and order views across roles where their behavior is genuinely the same.
- Add Lucide, React Hook Form, Zod, TanStack Query, and accessible shadcn/ui primitives as each is needed. Add Recharts only for an actual chart requirement. Check installed versions and current Next.js guidance before coding, as required by `AGENTS.md`.
- Use `NEXT_PUBLIC_API_URL` in `.env.example` and one API transport. Define types from verified responses, centralize error mapping, and invalidate related queries after mutations.
- Follow the backend's actual session mechanism. Route guards improve navigation but the backend remains the authority for roles and permissions. Handle expiry, logout, and forbidden responses consistently.
- If live APIs are unavailable during UI work, isolate representative sample responses in a clearly named mock adapter enabled only by an explicit development flag. Show a visible demo indicator and never blend mock records into live responses.

## Delivery sequence

### 0. Contract and workflow inventory

1. Obtain available Swagger/OpenAPI documentation or other existing contract without changing backend files. Map each planned screen to endpoints, methods, request/response types, role permissions, and upload/session behavior.
2. Mark each interaction as supported, unclear, or missing. Confirm decisions for optional farmer email, password reset, wishlists, buyer matching, notifications, scheme eligibility, agency delegation, and commission data from the contract.
3. Define the core journeys: farmer registers and adds a product; buyer finds it and places an order; farmer responds; agency acts only with permission; admin reviews supported records.

**Gate:** No live mutation is implemented against a guessed endpoint or response shape.

### 1. Foundation, public site, and authentication

1. Create tokens, typography, responsive containers, buttons, fields, badges, dialogs, navigation, feedback states, and bilingual strings.
2. Replace the starter page with a landing page covering the value proposition, how it works, benefits, a live or explicitly demo-labelled marketplace preview, role sections, schemes, and CTAs.
3. Build `/login`, `/register`, `/forgot-password`, and `/reset-password`. Registration starts with farmer, buyer, or agency selection and requests only fields the API supports. Admin registration stays private.
4. Implement auth state, session restoration, role redirects, protected layouts, and logout after verifying the backend mechanism.

**Gate:** Keyboard and screen-reader usable public/auth flows; language selection persists; no false login or registration success.

### 2. Farmer portal

1. Build `/farmer/dashboard` with clear earnings, orders requiring action, product counts, and the primary quick actions. Provide compact mobile bottom navigation.
2. Build `/farmer/products`, `/farmer/products/new`, and `/farmer/products/[id]/edit`. The product form uses six visible steps: identity, quantity, price, images, availability/location, review. Preserve input between steps; validate units and prices; show upload progress and errors if supported.
3. Build `/farmer/orders` with understandable statuses and only permitted transitions. Confirm accept/reject actions where appropriate.
4. Build `/farmer/schemes` with benefit, deadline, documents, official link, and a clear explanation of recommendation versus verified eligibility. Never imply official approval from a match score.
5. Build `/farmer/surplus`, `/farmer/buyers`, and `/farmer/profile` around available data and actions. Show remaining quantity and suggested buyer/agency actions only when backed by supported APIs.

**Gate:** A first-time mobile user can publish and edit a product, understand an order, and find help without relying on hidden icons or dashboard jargon.

### 3. Buyer portal

1. Build `/buyer/dashboard`, `/buyer/marketplace`, `/buyer/products/[id]`, `/buyer/orders`, `/buyer/wishlist`, and `/buyer/profile`.
2. Make search, category, location, price, quantity, and sort controls usable on mobile. Keep applied filters visible and allow a one-tap clear action.
3. On product details, show unit price, available quantity, location, farmer information permitted by the API, quantity limits, and calculated total before order confirmation.
4. Connect order submission and status tracking to real APIs. Implement wishlist persistence only if the backend supports it; otherwise record the gap and avoid a misleading permanent-save control.

**Gate:** A buyer can find suitable supply, evaluate total cost, place an order, and see its actual status.

### 4. Agency portal

1. Build `/agency/dashboard`, `/agency/farmers`, `/agency/farmers/new`, `/agency/farmers/[id]`, `/agency/products`, `/agency/connections`, `/agency/transactions`, and `/agency/commissions`.
2. Show farmer connections and permission state before any agency product action. Disable or omit actions the API does not authorize.
3. Explain commissions from the returned amount/rate/status data; show pending and paid separately, without computing authoritative balances from incomplete client data.

**Gate:** Agency actions respect explicit farmer permissions, and transaction/commission figures can be traced to backend records.

### 5. Admin portal

1. Build `/admin/dashboard`, `/admin/farmers`, `/admin/buyers`, `/admin/agencies`, `/admin/products`, `/admin/orders`, `/admin/schemes`, `/admin/commissions`, and `/admin/settings`.
2. Provide search, filtering, pagination, record detail, and confirmation for supported management actions. Render controls according to the actual admin permissions and endpoints.

**Gate:** An admin can inspect and perform the management actions the API exposes, with clear confirmation and error feedback.

### 6. Integration and quality pass

1. Replace enabled mocks with verified API services, or retain an explicitly separate demo mode for unavailable endpoints. Keep an integration-gap list with route, missing behavior, and expected contract.
2. Check every route and core journey at narrow phone, tablet, and desktop widths in both languages. Check focus order, contrast, labels, touch targets, overflow, slow network behavior, and image fallbacks.
3. Run lint, TypeScript checking, and a production frontend build. Exercise role redirects, expired sessions, form validation, uploads, failed requests, order transitions, and empty data. Fix observed errors before handoff.

## Completion criteria

- All specified routes exist and use consistent role navigation; unsupported actions are clearly identified rather than simulated as successful.
- The farmer product and order journeys and buyer discovery and purchase journeys work against verified APIs.
- English and Malayalam interfaces are readable and usable on a narrow Android viewport.
- Every major view handles loading, empty, error, and success states where applicable.
- Frontend lint, type check, and production build pass. Any remaining backend API gaps are listed with their impact.
