# PlannerDesk Deployment

PlannerDesk deploys to Railway as a standard Next.js application.

## Current Deployment Shape

- Runtime: Node.js
- Framework: Next.js App Router
- Package manager: npm
- Build command: `npm run build`
- Start command: `npm run start`
- Database: not connected yet

The current MVP foundation is a public landing page and does not require `DATABASE_URL`.

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

## Neon PostgreSQL

Neon PostgreSQL is intentionally not connected in this PR.

Connect Neon only when database-backed features begin, such as accounts, content management, or workspace data. That future PR should include its own security review, environment variable update, and migration plan.

## Explicit Non-Goals For This PR

- Prisma or database migrations
- Database tables
- Authentication
- Billing
- Community implementation
- File upload
- Customer medical document upload
- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
- BOA CRM or Aiven connections
