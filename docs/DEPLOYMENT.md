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

The initial deployment does not require secrets.

Allowed placeholder file:

- `.env.example`

Do not commit:

- `.env`
- `.env.local`
- `.env.production`
- Any file containing real credentials, API keys, database URLs, or tokens

When secrets are needed in a later PR, configure them through Railway Variables. Do not commit real values to GitHub.

## Neon PostgreSQL

Neon PostgreSQL is now connected at runtime for the Auth.js persistence layer (PR-22):

- `prisma/schema.prisma` contains the standard NextAuth models (`User`, `Account`, `Session`, `VerificationToken`) and custom fields/enums.
- Database schema applied via the `init_auth` migration.
- Prisma Adapter `@auth/prisma-adapter` is introduced to bind NextAuth to the Neon database.
- A `lib/prisma.ts` helper is now imported in `auth.ts` to manage database client connections.

The current static MVP still builds and runs without `DATABASE_URL` or `DIRECT_URL` during static generation, but runtime auth routes will require Railway Variables `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `AUTH_URL` to be correctly configured.

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
