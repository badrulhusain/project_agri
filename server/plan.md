# Build the Complete Backend – Agricultural Marketplace Platform

Act as a senior NestJS backend architect and full-stack engineer. Build a complete, scalable, secure backend for an Agricultural Marketplace and Farmer Empowerment Platform.

## 1. IMPORTANT PROJECT STRUCTURE

The project has two completely separate folders:

```text
project_non/
├── client/       # Next.js frontend
└── server/       # NestJS backend
```

**STRICT RULES:**
- Work ONLY inside the `server/` directory.
- DO NOT open, edit, create, delete, rename, or modify anything inside `client/`.
- Do not modify frontend files, configurations, dependencies, or components.
- Do not introduce NX, Turborepo, or any monorepo architecture.
- Next.js and NestJS are already installed.
- Do not reinstall or recreate the existing applications.
- First inspect the existing `server/` structure, dependencies, configuration, and source files.
- Preserve existing working configurations and build upon them.
- Implement actual working backend functionality, not just placeholder files or example code.

## 2. PROJECT OVERVIEW

Build an integrated agricultural ecosystem connecting:

1. Farmers – Sell agricultural products directly.
2. Buyers – Discover and purchase agricultural products.
3. Agencies – Help farmers access technology and markets.
4. Admin – Manage and monitor the entire platform.

The platform should also provide:
- Government agricultural scheme recommendations.
- Agency-assisted farmer onboarding and product management.
- Agency commission management.
- Surplus agricultural product identification.
- Smart buyer matching.
- AI-powered agricultural assistance.

The primary objective is to empower farmers, improve market access, reduce agricultural waste, and increase farmer income.

## 3. TECHNOLOGY STACK

Use the following backend technologies:

- Framework: NestJS (existing installation)
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT
- Password hashing: bcrypt
- Validation: class-validator and class-transformer
- API documentation: Swagger
- File/image storage: Cloudinary integration (use environment variables)
- API architecture: REST API
- Configuration: @nestjs/config

If Prisma or any required dependency is missing, install only the necessary packages inside `server/`.

Use clean architecture, modular design, reusable services, DTOs, guards, and proper exception handling.

## 4. USER ROLES AND PERMISSIONS

Implement Role-Based Access Control (RBAC).

### FARMER
- Register and manage personal profile.
- Add, edit, and delete agricultural products.
- Manage product quantities and availability.
- View orders received from buyers.
- Accept or reject orders.
- Update order status.
- View agency connections.
- View government schemes and recommendations.
- View surplus product alerts.
- Receive buyer matching suggestions.
- Manage notifications.

### BUYER
- Register and manage buyer profile.
- Browse agricultural products.
- Search and filter products.
- View individual product details.
- Place orders.
- View order history and status.
- Add products to wishlist.
- Cancel eligible orders.
- Contact farmers through available platform mechanisms.

### AGENCY
- Register and manage agency profile.
- Register farmers who need assistance.
- Connect with existing farmers.
- Manage farmer connections.
- Create and manage product listings on behalf of farmers, with proper permission.
- Discover potential buyers.
- Facilitate farmer-buyer transactions.
- Track facilitated orders.
- View earned commissions.
- View transaction history.

### ADMIN
- Manage all users.
- Manage farmers, buyers, and agencies.
- Approve, suspend, or reject agency accounts if required.
- Manage products and categories.
- Manage orders and transactions.
- Manage government agricultural schemes.
- Manage commission settings.
- Monitor platform activities.
- View platform statistics and reports.

A user must have one primary role. Enforce role permissions on the backend, not just in the frontend.

## 5. DATABASE DESIGN

Create a proper relational database schema using Prisma.

Design the following models and their relationships. You may add necessary fields, indexes, enums, and supporting models.

### User
- id
- name
- email
- phone
- password
- role
- isActive
- isVerified
- createdAt
- updatedAt

### FarmerProfile
- id
- userId
- address
- state
- district
- pincode
- farmingType
- landSize
- landUnit
- farmingExperience
- primaryCrops
- createdAt
- updatedAt

### BuyerProfile
- id
- userId
- businessName
- buyerType
- address
- state
- district
- pincode
- preferredCategories
- createdAt
- updatedAt

### AgencyProfile
- id
- userId
- agencyName
- description
- address
- state
- district
- commissionRate
- verificationStatus
- createdAt
- updatedAt

### Product
- id
- farmerId
- name
- category
- description
- quantity
- availableQuantity
- unit
- pricePerUnit
- location
- harvestDate
- expiryDate (optional)
- images
- status
- createdAt
- updatedAt

Product status should support available, partially_sold, sold_out, and inactive.

### AgencyFarmer
- id
- agencyId
- farmerId
- status
- permissions
- connectedAt

Support pending, accepted, and rejected connection statuses.

### Order
- id
- buyerId
- farmerId
- agencyId (nullable)
- orderNumber
- totalAmount
- status
- deliveryAddress
- notes
- createdAt
- updatedAt

### OrderItem
- id
- orderId
- productId
- quantity
- unitPrice
- subtotal

### Commission
- id
- agencyId
- orderId
- commissionRate
- amount
- status
- createdAt
- paidAt

### Wishlist
- id
- buyerId
- productId
- createdAt

### GovernmentScheme
- id
- name
- description
- department
- benefits
- eligibilityCriteria
- requiredDocuments
- applicationProcess
- officialUrl
- state
- deadline
- status
- createdAt
- updatedAt

### SchemeRecommendation
- id
- farmerId
- schemeId
- matchScore
- matchReason
- missingRequirements
- status
- createdAt

### SurplusAlert
- id
- farmerId
- productId
- surplusQuantity
- reason
- status
- createdAt

### BuyerMatch
- id
- productId
- buyerId
- matchReason
- status
- createdAt

### Notification
- id
- userId
- title
- message
- type
- isRead
- createdAt

### Additional requirements
- Use proper foreign keys and relations.
- Use Decimal for all monetary values.
- Use appropriate enums for roles and statuses.
- Add timestamps where necessary.
- Add indexes for frequently searched fields.
- Prevent duplicate wishlist entries and duplicate active agency-farmer connections.
- Use database transactions for order creation and stock updates.
- Prevent orders from exceeding available product quantity.
- Ensure commission is calculated only for successfully completed agency-facilitated orders.
- Direct farmer-to-buyer orders must not generate agency commission.
- Do not allow an agency to modify a farmer's products without an accepted connection and appropriate permission.

## 6. AUTHENTICATION AND SECURITY

Implement:

- Farmer, buyer, and agency registration.
- Login using email or phone and password.
- Password hashing using bcrypt.
- JWT access-token authentication.
- Protected routes.
- Role-based guards.
- Current-user decorator.
- Profile retrieval and updates.
- Password change.
- Forgot/reset password structure (implement a safe token-based flow; email delivery can be configured later).
- DTO validation.
- Ownership checks.
- Proper HTTP status codes.
- Centralized exception handling.

Never expose password hashes or sensitive user data in API responses.

## 7. BACKEND MODULES

Create separate NestJS modules with controllers, services, DTOs, and related files.

Required modules:

1. AuthModule
2. UsersModule
3. FarmersModule
4. BuyersModule
5. AgenciesModule
6. ProductsModule
7. CategoriesModule
8. OrdersModule
9. CommissionsModule
10. WishlistModule
11. SchemesModule
12. RecommendationsModule
13. SurplusModule
14. MatchingModule
15. NotificationsModule
16. AdminModule
17. UploadModule

Keep business logic inside services. Controllers should remain clean and handle HTTP requests and responses.

## 8. API ENDPOINTS

Implement REST APIs following consistent naming conventions.

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Users
- GET /api/users/me
- PATCH /api/users/me
- PATCH /api/users/change-password

### Farmers
- GET /api/farmers/me
- PATCH /api/farmers/profile
- GET /api/farmers/dashboard
- GET /api/farmers/orders

### Buyers
- GET /api/buyers/me
- PATCH /api/buyers/profile
- GET /api/buyers/dashboard
- GET /api/buyers/orders

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PATCH /api/products/:id
- DELETE /api/products/:id
- GET /api/products/farmer/:farmerId

Support pagination, search, category filtering, location filtering, price filtering, and sorting.

Public marketplace APIs should expose only active and available products.

### Orders
- POST /api/orders
- GET /api/orders/my
- GET /api/orders/:id
- PATCH /api/orders/:id/status
- POST /api/orders/:id/cancel

### Agencies
- GET /api/agencies/me
- PATCH /api/agencies/profile
- GET /api/agencies/dashboard
- POST /api/agencies/farmers/:farmerId/request
- GET /api/agencies/farmers
- PATCH /api/agencies/farmers/:farmerId/accept
- PATCH /api/agencies/farmers/:farmerId/reject
- DELETE /api/agencies/farmers/:farmerId

### Commissions
- GET /api/agencies/commissions
- GET /api/agencies/transactions
- GET /api/admin/commissions
- PATCH /api/admin/commissions/:id/status

### Wishlist
- GET /api/wishlist
- POST /api/wishlist/:productId
- DELETE /api/wishlist/:productId

### Government Schemes
- GET /api/schemes
- GET /api/schemes/:id
- POST /api/admin/schemes
- PATCH /api/admin/schemes/:id
- DELETE /api/admin/schemes/:id
- GET /api/schemes/recommendations
- POST /api/schemes/recommendations/refresh

### Surplus Management
- GET /api/surplus
- GET /api/surplus/my
- POST /api/surplus
- PATCH /api/surplus/:id
- PATCH /api/surplus/:id/resolve

### Buyer Matching
- GET /api/matching/suggestions
- POST /api/matching/:id/contact

### Notifications
- GET /api/notifications
- PATCH /api/notifications/:id/read
- PATCH /api/notifications/read-all

### Dashboards
- GET /api/admin/dashboard
- GET /api/farmers/dashboard
- GET /api/buyers/dashboard
- GET /api/agencies/dashboard

Implement the endpoints with proper access control and actual database operations.

## 9. IMPORTANT BUSINESS LOGIC

### A. Order Management

When a buyer places an order:

1. Validate the buyer.
2. Validate the product and available quantity.
3. Check that the requested quantity is available.
4. Calculate the total amount.
5. Create the order and order items.
6. Reduce available product quantity.
7. Update product status if necessary.
8. Notify the farmer.
9. If the order is agency-facilitated, associate the relevant agency.

Use a database transaction to ensure stock and order data remain consistent.

Support order statuses such as:
- pending
- confirmed
- processing
- ready_for_delivery
- completed
- cancelled
- rejected

### B. Agency Commission

- Agencies can facilitate transactions between farmers and buyers.
- Each agency has a configurable commission percentage.
- Commission must be calculated only for completed facilitated transactions.
- Direct transactions between farmers and buyers must not generate commission.
- Prevent duplicate commission records.
- Keep a transparent transaction history.
- Admin should be able to manage commission settings and payment status.

### C. Farmer Assistance

An agency can register a farmer or request a connection with an existing farmer.

An agency can manage a farmer's products only after the farmer accepts the connection and grants the necessary permission.

The farmer should remain the actual owner of the products and transactions.

### D. Surplus Agricultural Products

Example:

A farmer lists 500 kg of tomatoes.
A buyer orders 300 kg.
The remaining 200 kg is still available.

The platform should:
- Track remaining quantity.
- Identify products that remain unsold beyond a configurable period or have an approaching expiry/harvest urgency.
- Allow farmers or authorized agencies to flag surplus.
- Create surplus alerts.
- Search for potential buyers based on product category, quantity, and location.
- Suggest possible buyers such as retailers, wholesalers, hotels, supermarkets, and processors.
- Allow authorized users to initiate buyer connections.

Do not automatically mark every remaining quantity as waste. Surplus should be identified using configurable rules and user confirmation.

### E. Government Scheme Recommendations

Create a recommendation service that compares farmer profile information with scheme eligibility criteria.

Consider:
- State and district.
- Farming type.
- Crop categories.
- Land size.
- Other eligibility information stored in the farmer profile.

For every recommendation, return:
- Scheme details.
- Match score.
- Why the farmer may qualify.
- Eligibility criteria.
- Missing information.
- Required documents.
- Benefits.
- Deadline.
- Official application link.

For the initial implementation, use a transparent rule-based recommendation engine. Keep the architecture ready for future AI integration.

Never claim that a farmer is officially eligible based only on an approximate match. Clearly distinguish a potential match from verified eligibility.

## 10. AGENTIC AI INTEGRATION

The hackathon project includes an Agentic AI component.

Prepare a clean architecture for two AI agents:

### Agent 1: Government Scheme Assistant

Purpose:
Help farmers discover relevant government schemes.

The agent should:
1. Retrieve the farmer's profile.
2. Retrieve relevant scheme information.
3. Compare eligibility criteria.
4. Identify missing information.
5. Explain why a scheme may be relevant.
6. Guide the farmer through the application process.
7. Provide official links and required document information.

### Agent 2: Smart Agricultural Market Matching Agent

Purpose:
Help farmers find buyers and reduce agricultural waste.

The agent should:
1. Retrieve available farmer products.
2. Identify surplus or urgent-to-sell products.
3. Find potential buyers based on category, quantity, and location.
4. Rank buyer suggestions.
5. Explain why each buyer is a suitable match.
6. Recommend possible actions to the farmer or agency.

IMPORTANT:
- Do not create fake AI functionality.
- Keep AI provider integration modular.
- Read API keys from environment variables.
- Do not hardcode API keys.
- If no AI API key is available, provide functional rule-based fallback services.
- AI-generated recommendations must be explainable.
- Require user confirmation before creating orders, contacting buyers, or performing other important actions.
- Keep the AI agents' data access restricted by user permissions.

## 11. FILE UPLOAD

Implement image upload support for product images.

Use Cloudinary with environment variables:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Validate file type and size.

If Cloudinary credentials are missing, return a clear configuration error instead of pretending the upload succeeded.

## 12. API CONFIGURATION

Configure:

- Global API prefix: `/api`
- CORS: allow the local Next.js development origin (`http://localhost:3000`) and configurable production origins.
- Global validation pipe.
- Swagger documentation at `/api/docs`.
- Environment-based configuration.
- Consistent response structure.
- Pagination for list endpoints.
- Proper error responses.

Example response:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Use a consistent structure without unnecessarily wrapping every internal service result.

## 13. ENVIRONMENT VARIABLES

Create a `.env.example` inside `server/` containing all required variables.

Include:
- PORT
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- CLIENT_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- AI_PROVIDER_API_KEY (only if required by the selected provider)

Never commit actual secrets.

## 14. SEED DATA

Create a Prisma seed script with realistic demo data:

- 1 admin.
- 3 farmers.
- 3 buyers.
- 2 agencies.
- Multiple agricultural categories.
- Products such as tomatoes, bananas, coconuts, rice, vegetables, and spices.
- Sample orders.
- Agency-facilitated transactions.
- Government schemes with sample eligibility criteria.
- Sample notifications.

Use clearly documented demo credentials. Never use real personal information.

## 15. TESTING

Add tests for critical business logic:

- Registration and login.
- Role-based access.
- Product creation.
- Product ownership.
- Agency permission checks.
- Order creation.
- Insufficient stock validation.
- Stock reduction.
- Commission calculation.
- Direct orders without commission.
- Scheme recommendation matching.

Run the available lint, build, and test commands. Fix errors introduced by your changes.

## 16. EXPECTED SERVER STRUCTURE

Organize the backend cleanly. A suggested structure:

```text
server/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── auth/
│   ├── users/
│   ├── farmers/
│   ├── buyers/
│   ├── agencies/
│   ├── products/
│   ├── categories/
│   ├── orders/
│   ├── commissions/
│   ├── wishlist/
│   ├── schemes/
│   ├── recommendations/
│   ├── surplus/
│   ├── matching/
│   ├── notifications/
│   ├── admin/
│   ├── upload/
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── enums/
│   ├── prisma/
│   ├── config/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
├── package.json
└── README.md
```

Adjust this structure to the existing NestJS project instead of unnecessarily recreating it.

## 17. DEVELOPMENT PRIORITY

Build in this order:

Phase 1 – Foundation:
- Prisma setup.
- Database schema.
- Database connection.
- Authentication.
- User roles and guards.

Phase 2 – Core marketplace:
- Farmer profiles.
- Buyer profiles.
- Product management.
- Public marketplace APIs.
- Order management.

Phase 3 – Agency system:
- Agency profiles.
- Farmer connections.
- Permission management.
- Facilitated transactions.
- Commission calculation.

Phase 4 – Additional features:
- Government schemes.
- Scheme recommendations.
- Surplus management.
- Buyer matching.
- Notifications.

Phase 5 – AI integration:
- Scheme Assistant architecture.
- Smart Market Matching Agent architecture.
- Rule-based fallback.
- Optional AI provider integration.

Phase 6 – Finalization:
- Seed data.
- API testing.
- Swagger.
- README.
- Build and lint verification.

## 18. FINAL INSTRUCTIONS

Do not just generate a large number of files without checking whether they work together.

Follow this process:

1. Inspect the existing server application.
2. Understand its current configuration and installed dependencies.
3. Plan the implementation.
4. Build the database schema.
5. Implement modules and business logic.
6. Connect all modules.
7. Test the important workflows.
8. Run the production build.
9. Fix TypeScript, Prisma, and runtime errors.
10. Update the server README with setup instructions, environment variables, database migration, seed commands, API documentation, and demo credentials.

The final backend must be runnable independently from the Next.js frontend.

**MOST IMPORTANT: DO NOT MODIFY ANYTHING INSIDE THE `client/` FOLDER. ALL DEVELOPMENT MUST HAPPEN INSIDE `server/` ONLY.**

Start by inspecting the existing backend and then implement the complete backend.