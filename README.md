# eSIMBeast Web Application

This directory contains the main eSIMBeast application.

For the product overview, architecture, feature set, and portfolio context, see the [root README](../README.md).

## Technology stack

* Next.js
* React
* Next.js API Routes
* PostgreSQL
* Prisma ORM
* Stripe
* External eSIM supplier APIs
* Nodemailer
* Google APIs / Google Sheets
* Anthropic API

## Local development

```bash
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

Open http://localhost:3000.

## Environment variables

The application relies on external services for functionality including:

* PostgreSQL
* Stripe
* eSIM supplier integrations
* Email delivery
* Google services
* AI-assisted customer support

Use `.env.example` as the reference for configuration.

Do not commit secrets or production credentials.

## Available commands

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the Next.js development server |
| `npm run build`        | Create a production build            |
| `npm start`            | Serve the production build           |
| `npm run export:plans` | Export plan data to CSV              |

## Project structure

```text
website/
├── components/     # Reusable UI components
├── lib/            # Shared application and integration logic
├── pages/
│   ├── api/        # Server-side API routes
│   ├── admin/      # Administration functionality
│   ├── payment/    # Checkout flow
│   └── plans/      # Plan browsing
├── prisma/         # Database schema and migrations
├── scripts/        # Utilities and data tooling
└── public/         # Static assets
```

## Repository status

This repository represents the application version I developed and delivered.

The live eSIMBeast product has continued evolving with changes made by the client, so the production code may differ from this snapshot.
