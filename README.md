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

## Quality Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development if needed.

Do not commit real `.env` files. The initial build does not require `DATABASE_URL`.

## Railway Deployment

Railway can detect this repository as a Node/Next.js app from `package.json`.

Recommended Railway settings:

- Build command: `npm run build`
- Start command: `npm run start`
- Node version: use the `engines.node` value from `package.json`

No Railway credentials, Neon credentials, or production secrets are required for the initial landing page deployment.

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
