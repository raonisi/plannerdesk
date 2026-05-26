# PlannerDesk

PlannerDesk is a public B2B SaaS platform for Korean insurance planners.

Korean brand: **플래너데스크**  
Tagline: **보험설계사의 하루를 시작하는 실무 플랫폼**  
Positioning: **전국 보험설계사를 위한 실무 포털 & 성장 플랫폼**

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Railway deployment target
- Neon PostgreSQL planned for later, not required for the first build

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Run the production build locally:

```bash
npm run build
npm run start
```

The production server uses `PORT` when it is set and falls back to `3000`.

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development if needed.

Do not commit real `.env` files. `.env.example` must contain placeholders only.

The initial build and Railway deployment do not require `DATABASE_URL`.

Neon PostgreSQL will be connected only when database-backed features begin. Do not add Neon credentials, Prisma migrations, database tables, authentication, billing, community features, or file upload in the foundation PR.

PlannerDesk must not connect to BOA CRM data, BOA CRM databases, or Aiven.

## Railway Deployment

Railway can detect this repository as a Node/Next.js app from `package.json`.

Recommended Railway settings:

- Build command: `npm run build`
- Start command: `npm run start`
- Node version: use the `engines.node` value from `package.json`

No Railway credentials, Neon credentials, or production secrets are required for the initial landing page deployment.

See `docs/DEPLOYMENT.md` for deployment readiness notes.

See `docs/NEON_CONNECTION_PLAN.md` for the planned Neon PostgreSQL connection sequence. Neon is not connected and `DATABASE_URL` is not required for the current static MVP.

See `docs/ADMIN_ACCESS_PLAN.md` for the conceptual minimal admin access plan, role definitions, and access control principles.

See `docs/AUTH_FOUNDATION_PLAN.md` for the auth strategy before any DB or Auth.js implementation.

See `docs/RBAC_FOUNDATION_PLAN.md` for the planned Role-Based Access Control (RBAC) foundation rules and server-side authorization principles.

## Product Boundary

The MVP is limited to a public landing page and placeholders for:

- Insurer directory
- Claim document library
- Customer message templates
- Future verified planner community
- Future AI tools

Excluded from the first release:

- Billing and subscriptions
- Customer medical document upload
- Claim payout judgment or amount estimation
- Loss-adjusting workflow
- Real file upload
- Database migrations

## Content Architecture

Phase 1 static content models are documented in `docs/CONTENT_ARCHITECTURE.md` and typed under `lib/content`.

All official insurer links, document references, contact details, and policy resources must be verified before public release.
