# FastNet - MTN Data Package Sales Platform

## Overview
FastNet is a premium MTN data package sales platform designed to allow customers to purchase non-expiry MTN data packages. It provides a comprehensive administration dashboard for managing orders and packages in real-time. The platform aims to offer a secure, transparent, and efficient way for users to acquire MTN data, with robust backend management for administrators.

## User Preferences
I prefer clear and concise communication. When suggesting code changes, please provide a brief explanation of the "why" behind the change, not just the "what." I value iterative development, so propose changes in manageable steps. Always ask for my approval before implementing major architectural changes or introducing new dependencies. Ensure that any modifications align with the existing code style and design principles.

## System Architecture
FastNet is built with a modern web stack. The **Frontend** uses React with TypeScript, Wouter for routing, TanStack Query for data fetching, and Shadcn UI with Tailwind CSS for styling. The **Backend** is developed with Express.js and TypeScript. **PostgreSQL** (Neon) serves as the database, managed with Drizzle ORM. Authentication is handled via **Replit Auth** (OpenID Connect). Payments are processed securely through **Paystack**. The system integrates with multiple data suppliers, **DataXpress and Hubnet**, using a manual switching mechanism.

### UI/UX Decisions
The application adheres to MTN Ghana's brand identity:
- **Primary Yellow**: `#ffcb05` (CTAs, highlights)
- **MTN Blue**: `#007bff` (interactive elements)
- **Deep Charcoal**: `#333` (headers, dark sections)
- **Success Green**: For confirmations
- **Alert Red**: For errors and destructive actions

### Technical Implementations & Features
- **Customer Features**: Package selection from 17 MTN data packages (1GB to 100GB), transparent 1.18% convenience fee display, secure checkout with client-side validation, Paystack payment processing, and order confirmation.
- **Admin Features**: Dashboard with statistics (orders, revenue, wallet balances), comprehensive order management (view, edit status, delete), package management (add, edit, delete), manual supplier switching, and protected routes.
- **Database Schema**: Key tables include `users`, `packages`, `orders`, `settings`, and `sessions`, designed to support user authentication, package definitions, order tracking, and global platform configurations.
- **Security**: Server-side pricing to prevent tampering, Zod schema validation for all inputs, middleware for admin-only route protection, strict status validation, and real-time polling for admin data.
- **API Endpoints**: Categorized into public (e.g., list packages, create order, Paystack webhook), protected (user authentication), and admin (order/package management, supplier switching, wallet balance).
- **Payment & Fulfillment Flow**: Orders are created server-side with calculated fees, processed via Paystack, and then automatically fulfilled by the active data supplier.
- **Multi-Supplier Architecture**: A `supplier-manager` pattern facilitates routing orders to either DataXpress or Hubnet based on an admin-selected active supplier. This allows for manual switching and dual wallet monitoring but does not include automatic failover.

## External Dependencies
- **PostgreSQL (Neon)**: Relational database for all application data.
- **Paystack**: Payment gateway for secure customer transactions.
- **Replit Auth**: OpenID Connect-based authentication for user and admin access.
- **DataXpress API**: Primary data supplier for MTN data package fulfillment.
- **Hubnet API**: Secondary data supplier for MTN data package fulfillment.