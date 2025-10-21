# FastNet - MTN Data Package Sales Platform

## Project Overview
FastNet is a premium MTN data package sales platform built with React, Express, PostgreSQL, and Paystack payment integration. The application allows customers to purchase non-expiry MTN data packages and provides administrators with a comprehensive dashboard to manage orders and packages in real-time.

## Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payments**: Paystack (inline SDK)

## Features

### Customer Features
1. **Package Selection**: Browse and select from 17 MTN data packages (1GB to 100GB)
2. **Secure Checkout**: Enter phone number and email with client-side validation
3. **Paystack Payment**: Secure payment processing with Paystack inline SDK
4. **Order Confirmation**: View order details and transaction reference after payment

### Admin Features
1. **Dashboard Overview**: View statistics (total orders, revenue, pending, completed)
2. **Orders Management**: View, edit status, and delete orders with real-time updates (5s polling)
3. **Package Management**: Add, edit, and delete data packages with pricing and availability control
4. **Authentication**: Protected admin routes with Replit Auth

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` - Session secret for authentication (auto-configured by Replit)
- `PAYSTACK_SECRET_KEY` - Paystack secret key for webhook verification
- `PAYSTACK_PUBLIC_KEY` - Referenced but used on frontend

### Frontend (client/.env.local)
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key for payment initialization

## Database Schema

### Tables
1. **users** - User accounts (Replit Auth)
   - id (varchar, primary key)
   - email, firstName, lastName, profileImageUrl
   - isAdmin (boolean) - Admin access flag
   - createdAt, updatedAt

2. **packages** - MTN data packages
   - id (varchar, primary key)
   - dataAmount (varchar) - e.g., "5GB"
   - price (decimal) - in GH¢
   - isActive (boolean) - Availability flag
   - createdAt, updatedAt

3. **orders** - Customer orders
   - id (varchar, primary key)
   - packageId (foreign key to packages)
   - phoneNumber, email
   - amount (decimal) - Server-determined from package price
   - paystackReference (varchar) - Paystack transaction reference
   - status (varchar) - pending, processing, completed, failed
   - createdAt, updatedAt

4. **sessions** - Session storage (Replit Auth requirement)

## Security Features
- **Server-side pricing**: Order amounts are determined by the backend, preventing price tampering
- **Schema validation**: All PATCH/POST endpoints validate inputs using Zod schemas
- **Admin-only routes**: Package and order management protected by isAuthenticated + isAdmin middleware
- **Status validation**: Order status updates use z.enum() for strict validation
- **Real-time polling**: Admin dashboard auto-refreshes every 5 seconds for current order data

## API Endpoints

### Public Endpoints
- `GET /api/packages` - List all packages
- `GET /api/packages/:id` - Get single package
- `POST /api/orders` - Create order (requires: packageId, phoneNumber, email)
- `GET /api/orders/reference/:reference` - Get order by Paystack reference
- `POST /api/webhooks/paystack` - Paystack webhook for payment confirmation

### Protected Endpoints (Require Auth)
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/logout` - Logout user

### Admin Endpoints (Require Auth + Admin)
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `POST /api/packages` - Create package
- `PATCH /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

## Design System
The application follows MTN Ghana's brand identity:
- **Primary Yellow**: #ffcb05 (CTAs, highlights, branding)
- **MTN Blue**: #007bff (interactive elements, links)
- **Deep Charcoal**: #333 (headers, dark sections)
- **Success Green**: For order confirmations
- **Alert Red**: For delete actions and errors

See `design_guidelines.md` for complete design specifications.

## Running the Project
1. The workflow "Start application" runs `npm run dev`
2. Backend serves on port 5000
3. Frontend is served via Vite with HMR
4. Database schema is automatically synced via Drizzle

## Database Seeding
The database is pre-seeded with 17 MTN data packages matching the original HTML prototype pricing.

## Accessing the Admin Dashboard

### First Time Setup (Fresh Database)
1. The first user to log in via Replit Auth will automatically be granted admin access
2. Navigate to `/admin` in your browser
3. You'll be redirected to Replit Auth login
4. After logging in, you'll have full admin access

### Adding More Admins
To grant admin access to additional users:
```sql
UPDATE users SET is_admin = true WHERE email = 'user@example.com';
```

**Note**: The automatic admin promotion only works for the very first user when the database has no existing admins. This ensures secure, controlled access to the admin panel.

## Payment & Fulfillment Flow
1. Customer selects package and enters contact info
2. Frontend calls POST /api/orders (sends only packageId, phone, email)
3. Backend fetches package, generates Paystack reference, creates order with server price
4. Frontend receives order details and initializes Paystack inline SDK
5. Customer completes payment with Paystack
6. Paystack webhook updates order status to "completed"
7. **Automatic fulfillment**: Order is sent to DataXpress API to deliver data to customer
8. Order marked as "fulfilled" or "failed" with error message if delivery fails

## DataXpress Integration
The application integrates with DataXpress API for automatic MTN data delivery:

### Environment Variables
- `DATAXPRESS_API_KEY` - Stored in Replit Secrets for secure API access

### API Features
- **Automatic Fulfillment**: When payment is confirmed, data is automatically sent to customer's phone
- **Manual Fulfillment**: Admins can manually trigger fulfillment from orders page (Send icon)
- **Wallet Balance**: Real-time balance display in admin dashboard (refreshes every 30s)
- **Fulfillment Status**: Tracks pending, processing, fulfilled, or failed status for each order
- **Error Handling**: Failed fulfillments show error messages in admin panel for troubleshooting

### Order Schema
Orders now include fulfillment tracking fields:
- `fulfillmentStatus`: pending | processing | fulfilled | failed
- `fulfillmentError`: Error message if fulfillment fails
- `dataxpressReference`: DataXpress order reference for tracking

### Admin Features
- View fulfillment status alongside payment status in orders table
- Manual fulfill button for completed orders that haven't been fulfilled
- Real-time DataXpress wallet balance in dashboard
- Error messages displayed for failed fulfillments

## Future Enhancements
- Email notifications for order confirmations
- Advanced order filtering and search in admin panel
- Data export functionality (CSV/Excel)
- Customer order tracking page
- Paystack webhook signature verification
- Rate limiting for admin endpoints
- Support for other networks (Vodafone, AirtelTigo, Telecel)

## Recent Changes
- October 21, 2025: Initial implementation with full MVP features
- October 21, 2025: DataXpress integration for automatic order fulfillment
- Security hardening: Server-side pricing, schema validation, real-time polling
