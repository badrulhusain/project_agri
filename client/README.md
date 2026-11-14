# vithu frontend

Next.js 16 frontend for the agricultural marketplace. All frontend work lives in `client/`; the backend is a separate application.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm.cmd run dev
```

`API_BASE_URL` points at the backend's `/api` base URL. Set the local `.env.local` to `http://127.0.0.1:3001/api`, matching the address the backend binds. Start the backend on port 3001 and the client on port 3000 in separate terminals. Restart the Next.js development server after changing `.env.local`. Browser requests go through `/api/backend/*` so the frontend and API share an origin; the route handler forwards only documented endpoints.

## Available flows

- Farmer and buyer registration, login, session restoration, logout, and role navigation.
- Farmer dashboard, product list, six-step product creation/editing, deletion, orders, and profile.
- Buyer dashboard, searchable marketplace, product details, order placement, orders, and profile.
- Agency and admin route structures with explicit states for features absent from the current API.
- Farmer schemes, surplus, buyer connections, and buyer wishlist routes with explicit API-gap states.

The backend uses JWT bearer authentication. The frontend keeps the token in the current tab's `sessionStorage`; closing the tab ends that session. Authentication and product/order authorization remain controlled by the backend.

See [API_GAPS.md](./API_GAPS.md) for missing endpoints and verification limits.

## Check

```powershell
npm run lint
npm run build
```
