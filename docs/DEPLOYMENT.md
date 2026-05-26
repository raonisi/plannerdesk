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

Neon PostgreSQL is not connected at runtime. PR-14 adds only the Prisma foundation:

- `prisma/schema.prisma` with `provider = "postgresql"` and `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`.
- `prisma` dev dependency and `@prisma/client` runtime dependency.
- `prisma:generate`, `prisma:validate`, and `prisma:studio` npm scripts.
- A `lib/prisma.ts` helper that is not imported by any route in the current static MVP.

The current static MVP still builds and runs without `DATABASE_URL` or `DIRECT_URL`. Railway Variables may already contain `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `AUTH_URL`. The Auth.js foundation (PR-17) is installed and can read `AUTH_SECRET` and `AUTH_URL` automatically, but no routes or database-backed features use them yet.

Connect Neon at runtime only when the first database-backed feature ships. That future PR must include its own security review, migration plan, and rollback notes.

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
