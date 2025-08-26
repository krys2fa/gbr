# GoldBod Registry (MVP)

A minimal, secure-by-default web app for GoldBod to evaluate gold and process payments for sales and exports.

Tech stack

- Next.js 14 (React 18, TypeScript)
- Prisma ORM + PostgreSQL (Supabase free tier)
- API routes (app router)
- Zod for validation
- Vitest for unit tests
- Vercel (free) for hosting

Features (MVP)

- Submit gold details for evaluation (karat, weight, impurities, origin)
- Compute indicative valuation using configurable market price and purity formula
- Create cases for companies/individuals; track status: Submitted → Evaluated → Approved → Paid → Exported
- Record payments (reference, method) and export docs metadata

Getting started (local)

1. Install deps
2. Set env vars
3. Init DB and run

Env

- DATABASE_URL=postgres connection (from Supabase)
- GOLD_SPOT_USD= e.g., 2400
- FEE_BPS= e.g., 50 (0.50%)

Deploy (free)

1. Create Supabase project → copy connection string to `DATABASE_URL`.
2. Push this repo to GitHub.
3. Import into Vercel → set env vars → deploy.
4. Run `npx prisma migrate deploy` in Vercel Build Command (or a postdeploy script).

Security

- Server-side validation (Zod)
- Rate-limit ready (middleware stub)
- Avoid secrets in client; use env on server

Next steps

- Auth (Clerk/Auth.js) with RBAC (Regulator, Company, Individual)
- File uploads for assay docs (Supabase Storage)
- Webhooks for payment providers
