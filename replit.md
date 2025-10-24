# FastNet - MTN Data Package Sales Platform

## Overview
FastNet is a premium MTN data package sales platform designed to facilitate the sale of non-expiry MTN data packages to customers. The platform provides a seamless purchasing experience for users and a robust administration dashboard for managing orders, packages, and multiple suppliers (DataXpress and Hubnet) in real-time. It aims to be a comprehensive solution for data package sales with secure payments and efficient fulfillment.

## User Preferences
I prefer clear and concise information. For coding tasks, I appreciate an iterative development approach where major changes are discussed before implementation. Please ensure that all changes adhere to the established design guidelines and technical specifications. I also prefer detailed explanations of complex solutions.

## System Architecture
The FastNet platform is built with a React and TypeScript frontend, an Express.js and TypeScript backend, and a PostgreSQL database utilizing Drizzle ORM. Authentication is handled via Replit Auth (OpenID Connect), and payments are processed using Paystack's inline SDK.

### UI/UX Decisions
The application's design adheres to MTN Ghana's brand identity, using #ffcb05 (Primary Yellow) for CTAs and branding, #007bff (MTN Blue) for interactive elements, and #333 (Deep Charcoal) for headers. Success and alert colors are also standardized.

### Technical Implementations
- **Frontend**: React + TypeScript, Wouter for routing, TanStack Query for data fetching, Shadcn UI for components, and Tailwind CSS for styling.
- **Backend**: Express.js with Zod for schema validation and middleware for access control.
- **Database**: PostgreSQL hosted on Neon with Drizzle ORM for type-safe database interactions.
- **Security**: Server-side pricing to prevent tampering, Zod schema validation for all inputs, admin-only routes secured with `isAuthenticated` and `isAdmin` middleware.
- **Real-time Updates**: Admin dashboard utilizes 5-second polling for real-time order and wallet balance updates.

### Feature Specifications
- **Customer Features**: Package selection (1GB-100GB), transparent 1.18% convenience fee, secure checkout, Paystack payment integration, and order confirmation.
- **Admin Features**: Dashboard overview with statistics and supplier wallet balances, comprehensive order management (view, edit status, delete), package management (add, edit, delete with dual-supplier pricing), and supplier management with one-click switching between DataXpress and Hubnet.
- **Multi-Supplier Architecture**: A central `supplier-manager.ts` routes order fulfillment based on the active supplier stored in a settings table. Admins can manually switch suppliers via the settings page.
- **Pricing & Fees**: A 1.18% convenience fee is applied to all orders, calculated server-side, and transparently displayed.

## External Dependencies
- **Database**: PostgreSQL (via Neon)
- **Authentication**: Replit Auth (OpenID Connect)
- **Payment Gateway**: Paystack (inline SDK and webhooks)
- **Data Fulfillment API 1**: DataXpress API (for MTN data delivery)
- **Data Fulfillment API 2**: Hubnet API (for MTN data delivery)