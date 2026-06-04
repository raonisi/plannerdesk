# PlannerDesk Railway Hardening & Configuration Guide

This document defines the configuration rules, environment variable specifications, and deployment boundaries for running the PlannerDesk MVP securely on Railway.

---

## A. Required Railway Variables

The database-backed features (Insurer Directory, Claim Document Library, and Auth.js RBAC admin session controls) require the following environment variables to be configured in the Railway dashboard.

> [!WARNING]
> Do not write or paste real production secret values into any file in the repository or git commits. Only manage them via the Railway dashboard interface.

| Variable Name | Purpose | Example / Format | Writable/Readable |
|---|---|---|---|
| `DATABASE_URL` | Prisma Client connection string (pooled connection). | `postgresql://user:pass@ep-host.neon.tech/dbname?sslmode=require` | Server-only |
| `DIRECT_URL` | Direct connection to database (unpooled) for migration runners. | `postgresql://user:pass@ep-host.neon.tech/dbname?sslmode=require` | Server-only |
| `AUTH_SECRET` | Secret key used to encrypt Auth.js session cookies. Generate a strong key. | Random 32+ char hex value (e.g. `openssl rand -hex 32`) | Server-only |
| `AUTH_URL` | Canonical URL of the authentication API router path. | `https://plannerdesk.co/api/auth` or `https://your-railway-app.up.railway.app/api/auth` | Server-only |

---

## B. Build and Process Execution Settings

Railway compiles and deploys the application based on standard Next.js parameters. Ensure these settings are declared in your deployment settings:

- **Build Command** (no DB migration):
  ```bash
  npm run build
  ```
  Runs `prisma generate` and `next build` only. Does **not** execute `prisma migrate deploy`.

- **Migration deploy** (operator-only, separate step):
  ```bash
  npm run release:migrate
  ```
  Uses `prisma migrate deploy`. Requires reviewed migrations in `prisma/migrations/` and valid `DATABASE_URL` / `DIRECT_URL`. Run only after environment and backup checks.

- **Start Command**:
  ```bash
  npm run start
  ```
- **Port Assignment**:
  Next.js reads the `PORT` variable assigned by Railway automatically. Do not hardcode a specific port in server startup code.

---

## C. Database Access and Routing Requirements

### Runtime DB Dependencies
The following routes render dynamic content and require active database connections. If the database connection fails, the application will catch the error and render user-safe failover screens:
- `/directory` (Reads published `Insurer` records)
- `/claim-documents` (Reads published `ClaimDocument` records)

### Protected Admin Interface
Admin paths (`/admin/*`) require the `DATABASE_URL` for database access and the `AUTH_SECRET` to validate Auth.js administrator credentials and manage role-based permissions (`content_admin`, `super_admin`).

---

## D. Code Integration & Release Hardening

- **Automatic Deploys**: Merges into the `main` branch trigger automated production builds on Railway. Make sure all local validation checks (`npm run typecheck`, `npm run lint`, `npm run build`) pass before committing and pushing code.
- **Environment Boundaries**: `.env` and `.env.*` configuration files are strictly gitignored to prevent credentials leakage. Maintain only the dummy placeholders in `.env.example`.
- **Database Migrations Policy**: Do not run arbitrary database alterations (`npx prisma db push` or direct SQL overrides) on the production database. Migrations must be packaged as SQL under `prisma/migrations/` in reviewed PRs and applied with `npm run release:migrate` (or `npm run db:migrate:deploy`) by an operator — **not** during `npm run build` or default CI. CI runs `npm run build` without touching the database.
