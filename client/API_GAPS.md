# Backend integration status

Source: the OpenAPI document at the provided `/api/docs-json` endpoint, checked on 14 November 2026.

## Connected routes

- Farmer and buyer registration: `POST /api/auth/register`. The documented role enum allows `FARMER` and `BUYER` only.
- Login and session check: `POST /api/auth/login`, `GET /api/auth/me`. The API declares JWT bearer authentication.
- Profiles: `GET /api/users/me`, `GET /api/farmers/me`, `GET /api/buyers/me`.
- Products: `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id`.
- Orders: `POST /api/orders`, `GET /api/orders/my`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status`, `POST /api/orders/:id/cancel`.

The frontend sends these through a same-origin route handler. Both `.env.local` in this workspace and `.env.example` point to the local backend at `http://127.0.0.1:3001/api`.

## Missing from the documented API

| Feature | Frontend behavior |
| --- | --- |
| Agency registration, farmer connections, delegated permissions, transactions, commissions | Routes are present with explicit unavailable states. No agency action is presented as successful. |
| Admin metrics, moderation, user management, schemes, commissions, settings | Routes are present with explicit unavailable states. |
| Government scheme matching and official application details | Farmer schemes route explains the gap. |
| Surplus quantities and buyer matching | Farmer surplus and buyers routes explain the gap. |
| Wishlist persistence | Buyer wishlist route explains the gap. |
| Image upload | Product form accepts an optional hosted image URL only. |
| Product stock adjustment after publishing | Edit form shows quantity as read-only; the documented update DTO does not include it. |
| Farmer-specific product listing | The frontend filters the current public product page using the authenticated user and farmer profile IDs. This may miss products beyond the loaded page. |
| Password reset, profile editing, notifications | Not exposed by the OpenAPI contract. |

## Verification limits

- The local backend currently cannot compile: `RegisterDto.phone` is optional while Prisma requires `User.phone`. This needs a server-side DTO/type fix before registration or any live local integration can be tested. The client now requires a phone number and sends it in the backend's expected format.
- The client registration form now makes email optional. The backend `RegisterDto.email` still requires an email, so registering without one will return validation error until the backend DTO makes email optional. The Prisma `User.email` field already allows a missing email.
- The public product list and an invalid login request were exercised through the frontend API bridge. The product list was empty when checked.
- The OpenAPI document does not define success response schemas for login, registration, products, or orders. The frontend reads the observed `success/data` envelope and checks common JWT token field names, but a successful login/registration and order mutation still need testing with a provisioned test account.
- Backend authorization remains authoritative. The frontend role guard is for navigation and user experience.
