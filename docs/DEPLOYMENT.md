# PlannerDesk Deployment

PlannerDesk deploys to Railway as a standard Next.js application.

## Current Deployment Shape

- Runtime: Node.js
- Framework: Next.js App Router
- Package manager: npm
- Build command: `npm run build`
- Start command: `npm run start`
- Database: not connected yet

The current static MVP does not require `DATABASE_URL`.

## Railway

Railway should detect the app from `package.json`.

Use:

```bash
npm run build
npm run start
```

The start script reads Railway's `PORT` environment variable and falls back to `3000` for local production smoke tests.

## Environment Variables

The database-backed runtime requires the following variables configured on Railway:
- `DATABASE_URL` (Neon PostgreSQL pooled connection)
- `DIRECT_URL` (Neon PostgreSQL direct connection for migrations)
- `AUTH_SECRET` (Auth.js token signing secret)
- `AUTH_URL` (Canonical production Auth API path, e.g., `https://plannerdesk-production.up.railway.app/api/auth`)

### Google OAuth Configuration Variables
To enable Google Login for the admin interface, configure the following variables in the Railway dashboard:
- `AUTH_GOOGLE_ID` (Google OAuth Client ID)
- `AUTH_GOOGLE_SECRET` (Google OAuth Client Secret)

### Google Console OAuth Settings
- **Authorized JavaScript origin**: `https://plannerdesk-production.up.railway.app`
- **Authorized Redirect URI (Callback URL)**: `https://plannerdesk-production.up.railway.app/api/auth/callback/google`

Do not commit:

- `.env`
- `.env.local`
- `.env.production`
- Any file containing real credentials, API keys, database URLs, or tokens

Configure secrets exclusively through Railway Variables. Do not commit real values to GitHub.

## Neon PostgreSQL

Neon PostgreSQL is connected at runtime for the Auth.js persistence layer (PR-22) and holds all core content models (including `Insurer` and `ClaimDocument` schemas):

- `prisma/schema.prisma` contains NextAuth models, custom fields, `Insurer`, and `ClaimDocument` schemas with their categories and verification states.
- Database schemas are applied via migrations under `prisma/migrations/*`.
- Prisma Adapter `@auth/prisma-adapter` binds NextAuth to the Neon database.
- A `lib/prisma.ts` helper manages database client connections.

The application is database-backed. Dynamic route pages (`/directory` and `/claim-documents`) and protected admin CRUD routes (`/admin/*`) require the Railway environment variables `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `AUTH_URL` to be correctly configured for the application to function.

See [docs/RAILWAY_HARDENING.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/RAILWAY_HARDENING.md) for environment configuration parameters and hardening rules.
See `docs/NEON_CONNECTION_PLAN.md` for the full Neon, Railway Variables, and Prisma rollout sequence.
See `docs/AUTH_FOUNDATION_PLAN.md` for the Auth.js foundation details.
See [docs/AUTH_DATABASE_SCHEMA_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/AUTH_DATABASE_SCHEMA_PLAN.md) for the Auth database schema plan.

## Explicit Non-Goals For This PR

- Prisma migrations or business tables
- Authentication, RBAC, or admin permissions
- Billing or subscriptions
- Community implementation
- File upload or storage
- Customer medical document upload
- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
- BOA CRM or Aiven connections
