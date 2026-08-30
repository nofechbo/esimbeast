# eSIMBeast

A full-stack eSIM marketplace built for real customers to discover, purchase, and manage international mobile data plans.

**Live product:** [esimbeast.com](https://www.esimbeast.com)

> This repository represents the version I developed and delivered. The production application has continued evolving with client-side changes, so the live code may differ from this portfolio snapshot.

## Overview

eSIMBeast helps travelers find suitable eSIM plans by destination, data allowance, and trip duration, then complete the purchase and fulfillment flow online.

The project combines a customer-facing storefront with backend APIs, payment processing, supplier integrations, persistent order management, email delivery, and administrative tooling.

## Key Features

- Search and filter eSIM plans across international destinations
- Integrations with multiple external eSIM suppliers
- Stripe-based checkout and payment processing
- Automated eSIM ordering and fulfillment
- QR code and activation-information delivery
- Order and plan-status tracking
- PostgreSQL-backed plan and order management with Prisma
- Administrative tools for store data
- Referral tracking
- Transactional email delivery
- SEO-focused destination and plan pages
- AI-powered customer assistance

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL, Prisma ORM |
| Payments | Stripe |
| Supplier APIs | eSIMAccess, WorldMove |
| Email | Nodemailer |
| AI | Anthropic API |
| Integrations | Google APIs / Google Sheets |
| Styling | CSS Modules, Tailwind CSS, Emotion |

## Architecture

```text
Customer
   |
   v
Next.js Storefront
   |
   +-- Plan search and filtering
   +-- Checkout
   +-- Order status
   +-- Customer support
   |
   v
Next.js API Layer
   |
   +-- Stripe
   +-- eSIM supplier APIs
   +-- Email services
   +-- AI assistant
   +-- Google services
   |
   v
PostgreSQL / Prisma
```

The database stores both available plans and customer orders, including payment state, supplier-specific fulfillment data, activation details, and order status.

## Project Structure

```text
esimbeast/
└── website/
    ├── components/     # Reusable UI components
    ├── lib/            # Application and integration logic
    ├── pages/          # Storefront pages
    │   ├── api/        # Backend API routes
    │   ├── admin/      # Administration UI
    │   ├── payment/    # Checkout flow
    │   └── plans/      # Plan browsing
    ├── prisma/         # Database schema and migrations
    ├── scripts/        # Data utilities
    └── public/         # Static assets
```

## Running Locally

```bash
cd website
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

The application depends on external credentials for services such as PostgreSQL, Stripe, supplier APIs, email delivery, Google services, and the AI integration.

See [`website/.env.example`](./website/.env.example) for the expected configuration variables.

## Portfolio Context

This project was built for an actual client and deployed as a real customer-facing product.

It gave me hands-on experience connecting frontend UX, backend APIs, third-party services, payments, persistent data, and automated order fulfillment in one production-oriented system.
