# PlannerDesk Operating Rules

PlannerDesk is a public B2B SaaS platform for Korean insurance planners. It is completely separate from BOA CRM and must not reuse BOA CRM infrastructure, databases, customer data, or product assumptions.

## Product Boundary

Current MVP includes:

- Public landing page
- Placeholder insurer directory
- Placeholder claim document library
- Placeholder customer message templates
- Placeholder future verified planner community
- Placeholder future AI tools

Current MVP excludes:

- Community implementation
- Billing or subscriptions
- Customer medical document upload
- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
- Real file upload
- Real database schema migration

## Data And Privacy Rules

- Do not connect to Aiven.
- Do not connect to the BOA CRM database.
- Do not use BOA CRM customer data.
- Do not hardcode credentials, tokens, connection strings, or secrets.
- Do not commit `.env` files.
- Keep `.env.example` limited to placeholder values.
- Do not require `DATABASE_URL` for the initial public build.
- Neon PostgreSQL may be introduced later through a separate, reviewed change.

## Engineering Rules

- Use TypeScript for application code.
- Prefer simple app-router Next.js structure until product needs justify more layers.
- Keep the landing experience premium, calm, mobile-first, and professional.
- Avoid patterns that make the product feel like an insurance link farm or sales flyer.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before release changes.

## Stop Conditions

Stop and report before continuing if a task requires:

- Production secrets
- Railway credentials
- Neon credentials
- Database migrations
- BOA CRM access
- Customer sensitive data
