# COMPLETE FRONTEND DEVELOPMENT – AGRICULTURAL MARKETPLACE PLATFORM

Act as a senior frontend architect, premium UI/UX designer, and experienced Next.js developer.

Your task is to build a complete, production-quality frontend for an Agricultural Marketplace and Farmer Empowerment Platform.

The platform connects farmers, buyers, agricultural agencies, and administrators in one digital ecosystem.

The frontend must look premium, modern, trustworthy, extremely user-friendly, and accessible to people who are not familiar with digital software.

IMPORTANT: Do not build a generic admin dashboard or ordinary e-commerce template. Design a product that feels like a professionally funded agricultural technology startup.

---

# 1. STRICT PROJECT RULES

The project has two completely separate directories:

```text
project/
├── client/       # Next.js frontend
└── server/       # NestJS backend
```

**ABSOLUTE RULE: WORK ONLY INSIDE THE `client/` DIRECTORY.**

- DO NOT open, edit, modify, delete, rename, or create any files inside `server/`.
- DO NOT change any backend code.
- DO NOT change backend configurations, dependencies, database schema, Prisma files, API routes, or NestJS modules.
- DO NOT run backend migrations or backend commands.
- DO NOT modify anything outside `client/`.
- Do not use NX, Turborepo, or any monorepo architecture.
- Next.js and NestJS are already installed separately.
- Work with the existing Next.js installation.
- Do not recreate the project unnecessarily.

If an API endpoint is missing or returns an error, report it clearly. Do not attempt to fix it by modifying the backend.

All frontend development must happen inside `client/`.

# 2. PROJECT UNDERSTANDING

The platform has four main user roles:

1. Farmer
2. Buyer / Market Owner
3. Agency / Facilitator
4. Admin

The platform's primary goals:

- Help farmers sell agricultural products directly to buyers.
- Help market owners, retailers, wholesalers, hotels, and other buyers find agricultural products.
- Help agencies support farmers who lack digital knowledge or market access.
- Provide transparent agency commissions for facilitated transactions.
- Recommend relevant government agricultural schemes to farmers.
- Identify surplus agricultural products and help farmers find additional buyers.
- Use AI-powered assistance to improve agricultural market access.

Build the frontend around these real user needs.

# 3. TECHNOLOGY STACK

Use:

- Next.js (existing installation)
- TypeScript
- Tailwind CSS
- App Router
- shadcn/ui where appropriate
- Lucide React icons
- React Hook Form
- Zod
- TanStack Query for API data fetching and caching
- Recharts for dashboard charts where useful

First inspect the existing client dependencies and configuration. Reuse existing packages whenever possible.

Do not unnecessarily install duplicate libraries.

Use reusable components, clean folder organization, responsive layouts, and maintainable TypeScript.

# 4. DESIGN DIRECTION – PREMIUM AGRICULTURAL TECHNOLOGY

The design should communicate:

- Trust
- Freshness
- Simplicity
- Transparency
- Growth
- Professionalism

Visual direction:

- Premium SaaS product design.
- Modern agricultural marketplace aesthetic.
- Clean, spacious layouts.
- Beautiful typography.
- Soft natural backgrounds.
- Green as the primary brand color.
- Warm neutral backgrounds.
- Subtle borders and shadows.
- Consistent border radius.
- Beautiful product photography.
- Clear visual hierarchy.
- High-quality icons and illustrations.
- Thoughtful empty states and loading states.

Suggested color palette:

- Primary green: #176B45
- Dark green: #104B35
- Secondary green: #E8F3EC
- Background: #F8FAF7
- Surface: #FFFFFF
- Main text: #18251E
- Secondary text: #68756D
- Accent: #E8B85B

You may refine this palette if a better consistent design system improves the result.

Avoid:
- Excessive gradients.
- Too many colors.
- Heavy shadows.
- Unnecessary animations.
- Tiny text.
- Overcrowded dashboards.
- Generic AI-generated dashboard appearance.
- Complicated navigation.
- Excessive cards for every small piece of information.

The UI should feel premium without sacrificing usability.

# 5. MOST IMPORTANT: FARMER-FIRST UX

Farmers are the primary users. Many may not be familiar with websites, dashboards, software terminology, or complicated digital workflows.

Design the farmer experience for someone using a smartphone for the first time.

Follow these principles:

### Simple language
Use familiar words instead of technical terms.

Examples:
- "Add Product" instead of "Create Listing".
- "Available Quantity" instead of "Inventory Allocation".
- "People interested in your products" instead of "Lead Management".
- "Money you earned" instead of "Revenue Analytics".

### Large interaction areas
- Large buttons.
- Clear labels.
- Easy-to-read typography.
- Large touch targets.
- Simple forms.
- Visible navigation.
- Avoid tiny icons without labels.

### Guided workflows
When adding a product, use a step-by-step form:

Step 1: Product name and category.
Step 2: Quantity and unit.
Step 3: Price.
Step 4: Product images.
Step 5: Location and availability.
Step 6: Review and publish.

Show progress clearly.

### Visual understanding
Use agricultural product photographs and meaningful icons.

Farmers should understand the page without reading long explanations.

### Mobile-first
The farmer portal must be exceptionally good on mobile screens.

Use a simple bottom navigation on mobile where appropriate.

### Language support
Provide Malayalam and English language switching.

- Malayalam should be properly supported across the interface.
- Use a suitable Malayalam font such as Noto Sans Malayalam.
- Keep translations natural and easy to understand.
- Avoid machine-like translations.
- Preserve the selected language while navigating.
- Make sure layouts work with Malayalam text lengths.

# 6. PUBLIC WEBSITE

Create a beautiful landing page that explains the platform clearly.

Route: `/`

Sections:

1. Navigation
   - Logo and brand name.
   - Home.
   - Marketplace.
   - How It Works.
   - For Farmers.
   - For Buyers.
   - Login.
   - Get Started.

2. Hero section
   - Powerful headline about connecting farmers directly with buyers.
   - Simple supporting description.
   - Primary CTA: Explore Marketplace.
   - Secondary CTA: Join as a Farmer.
   - Beautiful agricultural imagery.
   - Clear visual composition.

3. How It Works
   - Farmers list their products.
   - Buyers discover and order products.
   - Agencies help farmers access markets.

4. Platform Benefits
   - Direct market access.
   - Better price opportunities.
   - Reduced agricultural waste.
   - Government scheme awareness.
   - Agency-assisted selling.

5. Marketplace Preview
   - Real product cards.
   - Product image.
   - Name.
   - Price and unit.
   - Location.
   - Available quantity.

6. For Farmers section
   - Explain how farmers can join and sell products.
   - Strong CTA.

7. For Buyers section
   - Explain how retailers and market owners can discover suppliers.

8. Government Schemes section
   - Explain personalized scheme recommendations.

9. Final CTA.

10. Footer
   - Useful links.
   - Contact information.
   - Terms and privacy.

The landing page must feel like a premium startup website, not a basic college project.

# 7. AUTHENTICATION AND ONBOARDING

Create:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Registration should support:

- Farmer
- Buyer
- Agency

Use a clear role-selection screen with simple descriptions and illustrations.

After selecting a role, show only the relevant registration fields.

Farmer onboarding:
- Name.
- Phone.
- Email (optional if supported by the backend).
- Password.
- State.
- District.
- Farming type.
- Primary crops.

Buyer onboarding:
- Name.
- Business name.
- Buyer type.
- Phone.
- Email.
- Location.

Agency onboarding:
- Agency name.
- Contact person.
- Phone.
- Email.
- Location.
- Description.

Do not request unnecessary information during initial registration.

Use clear form validation and helpful error messages.

After successful login, redirect users to their correct role-based dashboard.

Admin registration must not be publicly available. Admin accounts should be provisioned through the existing backend.

# 8. FARMER PORTAL

Base route: `/farmer`

Design this portal with maximum simplicity.

### Farmer dashboard
Route: `/farmer/dashboard`

Show:

- Welcome message.
- Total products.
- Active products.
- Total orders.
- Products sold.
- Money earned.
- Pending orders.
- Products that need attention.
- Recent orders.
- Quick actions.

Quick actions:
- Add Product.
- View My Products.
- View Orders.
- Find Government Schemes.

Use simple visual statistics instead of complex analytical charts.

### My Products
Route: `/farmer/products`

Show:
- Product image.
- Product name.
- Available quantity.
- Price.
- Status.
- Edit action.
- Delete action.

Include search and category filters.

### Add Product
Route: `/farmer/products/new`

Use the guided step-by-step product form described earlier.

Allow:
- Image upload.
- Product category.
- Quantity.
- Unit (kg, quintal, tonne, piece, litre, etc.).
- Price per unit.
- Harvest date.
- Location.
- Description.

### Edit Product
Route: `/farmer/products/[id]/edit`

### Orders
Route: `/farmer/orders`

Show:
- Buyer information.
- Product.
- Quantity.
- Total amount.
- Order date.
- Order status.

Use clear status labels.

Allow farmers to accept or reject pending orders and update eligible order statuses.

### Buyers
Route: `/farmer/buyers`

Show potential buyers and buyer connections where the backend supports them.

### Government Schemes
Route: `/farmer/schemes`

This is an important feature.

Display:
- Recommended schemes.
- Scheme name.
- Department.
- Benefits.
- Eligibility summary.
- Match score.
- Deadline.
- Required documents.
- Official application link.

Create a visually clear "Why this scheme matches you" section.

Distinguish between:
- Potentially suitable.
- Missing information.
- Eligibility needs official verification.

### Surplus Products
Route: `/farmer/surplus`

Show products that need attention because they remain unsold or have urgent availability.

Example:
A farmer has 500 kg tomatoes.
300 kg sold.
200 kg remaining.

Show:
- Original quantity.
- Sold quantity.
- Remaining quantity.
- Potential buyers.
- Suggested actions.

Make this feature easy to understand and visually important.

### Farmer Profile
Route: `/farmer/profile`

# 9. BUYER / MARKET OWNER PORTAL

Base route: `/buyer`

The buyer portal should feel like a modern B2B agricultural purchasing platform.

Buyers may include:
- Retail shop owners.
- Wholesale merchants.
- Supermarkets.
- Hotels.
- Restaurants.
- Food processors.
- Agricultural traders.

### Buyer dashboard
Route: `/buyer/dashboard`

Show:
- Total orders.
- Pending orders.
- Completed orders.
- Recent purchases.
- Favorite products.
- Quick action: Find Products.

### Buyer marketplace
Route: `/buyer/marketplace`

This is one of the most important pages.

Build a professional marketplace with:

- Product search.
- Category filters.
- Location filters.
- Price range.
- Quantity availability.
- Sorting.
- Grid/list view where useful.

Product cards should display:
- High-quality product image.
- Product name.
- Price per unit.
- Available quantity.
- Farmer/location.
- Availability status.
- View Details CTA.

### Product details
Route: `/buyer/products/[id]`

Show:
- Large product images.
- Product information.
- Available quantity.
- Price.
- Farmer details.
- Location.
- Harvest information.
- Quantity selector.
- Total price calculation.
- Place Order button.

### Orders
Route: `/buyer/orders`

Show order history and status tracking.

### Wishlist
Route: `/buyer/wishlist`

### Buyer profile
Route: `/buyer/profile`

# 10. AGENCY PORTAL

Base route: `/agency`

Agencies act as facilitators who help farmers use the platform and access buyers.

### Agency dashboard
Route: `/agency/dashboard`

Show:
- Total connected farmers.
- Active farmers.
- Products managed.
- Facilitated orders.
- Completed transactions.
- Total commission earned.
- Pending commissions.

### Farmers
Route: `/agency/farmers`

Show:
- Connected farmers.
- Farmer location.
- Farming type.
- Products.
- Connection status.

### Register Farmer
Route: `/agency/farmers/new`

Create a simple farmer registration process.

### Farmer Details
Route: `/agency/farmers/[id]`

Display farmer information, products, connection permissions, and transaction history.

### Products
Route: `/agency/products`

Allow agencies to manage products only when the farmer has provided the required permission.

### Connections
Route: `/agency/connections`

Show connection requests and their statuses.

### Transactions
Route: `/agency/transactions`

Show facilitated transactions with buyer, farmer, products, quantity, amount, and status.

### Commissions
Route: `/agency/commissions`

Show:
- Total earned.
- Pending.
- Paid.
- Commission history.

Make commission calculations transparent.

# 11. ADMIN PORTAL

Base route: `/admin`

Create a professional administration interface.

Admin dashboard:
- Total users.
- Farmers.
- Buyers.
- Agencies.
- Active products.
- Total orders.
- Completed transactions.
- Platform activity.

Other pages:

- `/admin/farmers`
- `/admin/buyers`
- `/admin/agencies`
- `/admin/products`
- `/admin/orders`
- `/admin/schemes`
- `/admin/commissions`
- `/admin/settings`

Admin must be able to manage the platform according to backend permissions.

# 12. NAVIGATION AND LAYOUT

Use role-specific layouts.

Desktop:
- Sidebar navigation.
- Top header.
- Page title.
- Breadcrumbs where useful.
- Main content area.

Mobile:
- Responsive layouts.
- Simple navigation.
- Bottom navigation for important farmer and buyer actions where appropriate.
- Collapsible secondary navigation.
- No horizontal overflow.

Keep the sidebar simple and avoid too many menu items.

Use consistent layouts across all role portals.

# 13. COMPONENT SYSTEM

Build reusable components.

Examples:

- MainNavbar
- DashboardSidebar
- MobileBottomNav
- PageHeader
- StatCard
- ProductCard
- ProductGrid
- ProductFilters
- ProductForm
- ImageUploader
- OrderCard
- OrderStatusBadge
- UserProfileCard
- SchemeCard
- SchemeMatchIndicator
- SurplusProductCard
- EmptyState
- LoadingSkeleton
- ErrorState
- ConfirmationDialog
- SearchInput
- Pagination
- LanguageSwitcher
- NotificationPanel

Keep components reusable and avoid repeating the same UI code.

# 14. BACKEND API INTEGRATION

The backend is a separate NestJS application inside `server/`.

**DO NOT MODIFY THE BACKEND TO MAKE FRONTEND INTEGRATION EASIER.**

First inspect the available API documentation or existing API contract if provided.

Use the backend API through a centralized API layer.

Create:
- API client.
- Authentication service.
- Token/session handling.
- Typed request and response interfaces.
- React Query hooks.
- Error handling.
- Loading states.

Use an environment variable:

`NEXT_PUBLIC_API_URL=http://localhost:3001/api`

Never hardcode API URLs throughout components.

Integrate the existing endpoints for:
- Authentication.
- Users.
- Farmers.
- Buyers.
- Agencies.
- Products.
- Orders.
- Commissions.
- Schemes.
- Recommendations.
- Surplus.
- Matching.
- Notifications.
- Admin.

Important:
- Follow the actual backend API contract.
- Do not invent endpoint names or response fields.
- If Swagger is available, use it as the source of truth.
- If an endpoint is unavailable, document it as an integration gap.
- Never silently pretend that a request succeeded.
- Do not show fake success messages.
- Do not use hardcoded demo data as if it came from the real backend.

If the backend is not yet running, use a clearly separated mock API adapter for UI development. Make it easy to switch to the real API later.

Do not mix mock data directly into production components.

# 15. AUTHENTICATION AND ROLE PROTECTION

Implement frontend route protection based on the authenticated user.

- Farmer can access only farmer routes.
- Buyer can access only buyer routes.
- Agency can access only agency routes.
- Admin can access only admin routes.

Do not rely on frontend checks for actual security; backend authorization remains authoritative.

Handle:
- Unauthenticated users.
- Expired sessions.
- Unauthorized role access.
- Logout.
- Loading during authentication checks.

Follow the authentication method supported by the existing backend. Prefer secure cookie-based sessions if the backend supports them. Do not invent an incompatible token storage method.

# 16. RESPONSIVE DESIGN AND ACCESSIBILITY

Support:
- Mobile phones.
- Tablets.
- Laptops.
- Large desktop screens.

Pay special attention to farmers using low-cost Android smartphones.

Accessibility:
- Good color contrast.
- Keyboard accessibility.
- Visible focus states.
- Proper form labels.
- Accessible dialogs.
- Descriptive button labels.
- Readable font sizes.
- Touch-friendly controls.

Ensure Malayalam text renders correctly.

# 17. MICRO-INTERACTIONS

Use subtle interactions:

- Button hover states.
- Smooth transitions.
- Loading indicators.
- Skeleton loaders.
- Toast notifications.
- Form progress indicators.
- Clear confirmation dialogs.
- Helpful empty states.

Avoid excessive animation or anything that slows down the experience.

# 18. IMPORTANT UX DETAILS

Every major page must handle:

1. Loading state.
2. Empty state.
3. Error state.
4. Success feedback.
5. Responsive layout.

Examples:

If a farmer has no products:
Show a friendly illustration, a simple explanation, and a prominent "Add Your First Product" button.

If a buyer has no orders:
Show "Your orders will appear here when you purchase products."

If no schemes match:
Explain that no suitable schemes were found and provide a way to review profile information.

If a farmer has surplus products:
Show clear actions to find buyers or ask an agency for help.

Never leave a blank page or an unexplained empty table.

# 19. PROJECT STRUCTURE

Use a clean Next.js App Router structure.

Suggested structure:

```text
client/
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (auth)/
│   │   ├── farmer/
│   │   ├── buyer/
│   │   ├── agency/
│   │   ├── admin/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   ├── layout/
│   │   └── forms/
│   ├── features/
│   │   ├── auth/
│   │   ├── farmer/
│   │   ├── buyer/
│   │   ├── agency/
│   │   ├── admin/
│   │   ├── products/
│   │   ├── orders/
│   │   └── schemes/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   └── utils/
│   ├── types/
│   └── styles/
├── .env.example
└── package.json
```

Adapt this structure to the existing Next.js application. Do not recreate the project or replace existing configurations unnecessarily.

# 20. DEVELOPMENT ORDER

Build the frontend in the following order:

PHASE 1 – Design foundation:
- Inspect existing client application.
- Establish color system and typography.
- Set up reusable components.
- Build public landing page.
- Build authentication and role selection.

PHASE 2 – Farmer portal:
- Farmer layout.
- Farmer dashboard.
- Product management.
- Add/edit product workflow.
- Orders.
- Government schemes.
- Surplus products.

PHASE 3 – Buyer portal:
- Buyer layout.
- Marketplace.
- Product details.
- Order placement.
- Order history.
- Wishlist.

PHASE 4 – Agency portal:
- Agency dashboard.
- Farmer management.
- Connections.
- Product management.
- Transactions.
- Commissions.

PHASE 5 – Admin portal:
- Admin dashboard.
- User management.
- Product management.
- Orders.
- Scheme management.
- Commission management.

PHASE 6 – Integration and quality:
- Connect frontend with real backend APIs.
- Handle authentication.
- Test role-based routing.
- Test all major workflows.
- Test mobile responsiveness.
- Fix TypeScript and build errors.

# 21. FINAL QUALITY REQUIREMENTS

The final frontend must:

- Look like a premium agricultural technology product.
- Be easy for first-time software users.
- Be particularly simple for farmers.
- Offer a professional B2B experience for market owners and buyers.
- Support Malayalam and English.
- Be fully responsive.
- Have consistent design and navigation.
- Use reusable components.
- Integrate with the existing NestJS backend.
- Handle loading, empty, error, and success states.
- Avoid fake functionality.
- Avoid unnecessary complexity.

Do not stop after building only the landing page or dashboards. Implement the actual page structure and user workflows.

Before finishing:
1. Run the frontend build.
2. Fix TypeScript errors.
3. Check all routes.
4. Check mobile responsiveness.
5. Check forms and navigation.
6. Verify API integration.
7. List any backend API gaps without modifying the backend.

## FINAL AND MOST IMPORTANT INSTRUCTION

**YOU ARE DEVELOPING ONLY THE NEXT.JS FRONTEND.**

**DO NOT TOUCH ANYTHING INSIDE THE `server/` DIRECTORY. NOT EVEN ONE LINE OF BACKEND CODE.**

Do not modify backend files for any reason.

Start by inspecting the existing `client/` directory, understand the current setup, and then begin frontend development.