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

1. Create Neon project → copy connection string to `DATABASE_URL`.
2. Push this repo to GitHub.
3. Import into Vercel → set env vars → deploy.
4. Run `npx prisma migrate deploy` in Vercel Build Command (or a postdeploy script).

Seeding an admin user

- Ensure `DATABASE_URL` is set and DB is reachable.
- Optional envs: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ROLE` (ADMIN|SUPERADMIN)
- Run locally:
  - Windows PowerShell
    - npm run db:seed
  - Or set envs inline (PowerShell):
    - $env:ADMIN_EMAIL="admin@goldbod.com"; $env:ADMIN_PASSWORD="password"; npm run db:seed

Inline first admin (optional)

- Set `ALLOW_INLINE_ADMIN_CREATE=true` and deploy/start the app.
- Go to `/signin`. If no users are found, an inline form appears to create the first admin securely.
- Turn this flag back to `false` after creating the initial admin.

Security

- Server-side validation (Zod)
- Rate-limit ready (middleware stub)
- Avoid secrets in client; use env on server

Next steps

- Auth (Clerk/Auth.js) with RBAC (Regulator, Company, Individual)
- File uploads for assay docs (Supabase Storage)
- Webhooks for payment providers

## Contributing and Git workflow

This repo uses a lightweight trunk-based flow with feature branches, Conventional Commits, CI checks on PRs, and squash merges into `main`.

Branch naming

- Use short, kebab-case names prefixed by type:
  - feat/<scope-or-summary>
  - fix/<bug-or-area>
  - chore/<task>
  - refactor/<area>
  - docs/<topic>
  - ci/<topic>
  - test/<topic>
  - example: `feat/auth-rbac`, `chore/ci-fix-secrets-condition`

Commit messages (Conventional Commits)

- Format: `type(scope): short summary`
  - Common types: feat, fix, chore, refactor, docs, ci, test
  - Examples:
    - `feat(auth): add JWT sessions and credentials provider`
    - `fix(dashboard): prevent parallel routes conflict`
    - `ci(workflow): guard optional jobs behind secrets`

Before you start

1. Sync trunk and create a branch
  - `git checkout main`
   - `git pull --ff-only`
   - `git switch -c feat/your-branch-name`
2. Install deps and generate Prisma client if needed
   - `npm install`
   - `npm run db:generate`

Local checks (run before pushing)

- Lint: `npm run lint`
- Types: `npm run typecheck`
- Tests: `npm test`
- Build: `npm run build`

Database changes

- If you edit `prisma/schema.prisma`:
  - Create a migration: `npx prisma migrate dev --name <change-name>`
  - Re-seed if needed: `npm run db:seed`
  - Commit the updated `prisma/migrations/**` and `prisma/schema.prisma` files

Push and open a PR

1. Push your branch: `git push -u origin <branch>`
2. Open a PR to `main` in GitHub
   - Title should follow Conventional Commit style (e.g., `feat(auth): add RBAC`)
   - Link issues using “Closes #123” where applicable
   - Keep PRs focused and under ~300 lines when possible; stack larger work into smaller PRs
   - Mark as Draft to get early CI and feedback if still in progress
  - The PR description is auto-prefilled from `.github/pull_request_template.md` — fill out the checklist before requesting review

PR checklist (quick self-review)

- [ ] CI is green (lint, types, tests, build)
- [ ] Migrations (if any) are included and tested locally
- [ ] Security/auth paths considered (no secrets on client, protected routes enforced)
- [ ] Docs/README updated when behavior or setup changes

Reviews and merging

- Address review comments with follow-up commits (avoid force-push unless requested)
- Prefer “Squash and merge” with a clean, conventional PR title
- After merge:
  - `git checkout main && git pull --ff-only`
  - Delete your branch locally and on origin (`git branch -d <branch>` / delete via GitHub)

Branch protection (maintainers)

- Run the "Configure branch protection" workflow from Actions to require the PR title check (Semantic Pull Request) on `main`.
- This requires setting a repo secret `ADMIN_TOKEN` with a token that has admin:repo_hook and repo permissions.

Hotfixes

- Use `fix/*` branches for urgent bugs; follow the same PR flow. If a production deploy is blocked, prioritize a small, targeted fix PR.

Notes

- CI optional jobs (DB check, Vercel preview) require repository secrets. If they’re not set, the core checks still run.
