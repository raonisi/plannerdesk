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
- Neon PostgreSQL (connected via Prisma)
- Auth.js (NextAuth) for admin session protection

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
npx prisma validate
npx prisma generate
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development if needed.

Do not commit real `.env` files. `.env.example` must contain placeholders only.

Production operations require the configuring of Neon database variables (`DATABASE_URL`, `DIRECT_URL`) and Auth.js session keys (`AUTH_SECRET`, `AUTH_URL`) in the Railway dashboard.

PlannerDesk must not connect to BOA CRM data, BOA CRM databases, or Aiven.

## Railway Deployment

Railway can detect this repository as a Node/Next.js app from `package.json`.

Recommended Railway settings:

- Build command: `npm run build`
- Start command: `npm run start`
- Node version: use the `engines.node` value from `package.json`

See [docs/DEPLOYMENT.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/DEPLOYMENT.md) for deployment readiness notes.
See [docs/RAILWAY_HARDENING.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/RAILWAY_HARDENING.md) for environment configuration parameters and hardening rules.
See [docs/OPERATING_QA_CHECKLIST.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/OPERATING_QA_CHECKLIST.md) for verification and QA checklists.

See `docs/ADMIN_ACCESS_PLAN.md` for the conceptual minimal admin access plan, role definitions, and access control principles.

See `docs/AUTH_FOUNDATION_PLAN.md` for the auth strategy before any DB or Auth.js implementation.

See `docs/RBAC_FOUNDATION_PLAN.md` for the planned Role-Based Access Control (RBAC) foundation rules and server-side authorization principles.

See `docs/RBAC_IMPLEMENTATION_PLAN.md` for the planned Role-Based Access Control (RBAC) implementation steps and authorization helper design.

See `docs/AUTH_DATABASE_SCHEMA_PLAN.md` for the planned database schema and model structure for authentication.

See `docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md` for the planned evolution of the `Insurer` model from a basic directory record into a practical, premium, verified insurer action center for Korean insurance planners. The plan covers proposed action fields, status enums, field grouping, data governance labeling, public card UI direction, and the recommended follow-up PR sequence.

See `docs/CORRECTION_REQUEST_POLICY.md` for the operating policy, safety boundaries, and review principles of the correction request (수정 요청·제보) flow.

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
