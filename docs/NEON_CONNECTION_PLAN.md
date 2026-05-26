# PlannerDesk Neon Connection Plan

This document is a plan, not an implementation.

Do not add real Neon credentials in this PR. Do not connect Neon in this PR. Do not add Prisma or migrations in this PR. Do not add database-backed features in this PR.

## A. Purpose

PlannerDesk is currently a static MVP. Neon PostgreSQL should be introduced later only when PlannerDesk needs durable, database-backed product data and protected administrative workflows.

Neon will support future database-backed features such as:

- Admin CRUD
- Insurer directory management
- Claim document library management
- Disclosure link management
- Message template management
- Future auth
- Future verified planner accounts
- Future community
- Future billing entitlements

The current static MVP does not require Neon, Prisma, database tables, migrations, auth, or admin CRUD.

## B. Separation Rules

- PlannerDesk must not use the BOA CRM database.
- PlannerDesk must not use BOA CRM secrets.
- PlannerDesk must not use Aiven for this MVP unless explicitly changed in a later approved PR.
- PlannerDesk must use its own Neon project and database.
- PlannerDesk database resources must remain separate from all internal branch systems.
- No BOA CRM customer data may be imported into PlannerDesk.
- No customer medical, health, claim, or sensitive personal data may be copied from any internal system.

## C. Recommended Neon Structure

Recommended future Neon setup:

- Neon project name: `plannerdesk`
- Development database: `plannerdesk_dev`
- Production database: `plannerdesk_prod`
- Optional preview or staging branches may be added later if review apps need isolated data.
- Use a restricted application database role for runtime application access.
- Do not use owner or superuser credentials in Railway if a restricted role can support the app.
- Keep migration permissions separate from normal application runtime permissions where practical.

## D. Railway Variables

Future Railway Variables may include:

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_URL`
- `AUTH_SECRET`, only when auth is introduced

Current static MVP behavior:

- `DATABASE_URL` is not required.
- `DIRECT_URL` is not required.
- `AUTH_SECRET` is not required.
- `APP_URL` should be required only if a future feature or deployment setting actually uses it.

Future rules:

- `DATABASE_URL` and `DIRECT_URL` must be set only in Railway Variables or local ignored environment files.
- Never commit `.env` with real values.
- `.env.example` may contain placeholder values only.
- Do not paste real Neon URLs, passwords, tokens, or connection strings into docs, issues, pull requests, screenshots, or chat.

## E. Prisma Introduction Plan

Prisma should be introduced in a later PR only when a database-backed feature is approved.

That future Prisma PR should:

- Add `prisma/schema.prisma`.
- Use the PostgreSQL provider.
- Use `env("DATABASE_URL")`.
- Use `env("DIRECT_URL")` if migrations need a direct connection.
- Add the minimal schema needed for the feature being implemented.
- Avoid broad premature schema design.
- Avoid destructive migrations.
- Run `prisma generate` and build checks.
- Stop and report before production-impacting migrations.

The first Prisma PR must preserve the static MVP build path until the database-backed feature explicitly requires runtime database access.

## F. First Database-Backed Feature Recommendation

Recommended first database-backed feature:

- Admin-managed insurer directory CRUD

Alternative first database-backed feature:

- Admin-managed content resources CRUD for claim documents, disclosure links, or message templates

Do not start database work with:

- Customer medical document upload
- Claim document file upload
- Community
- Billing
- Auth complexity
- Customer data storage

Start with low-risk admin content management after static MVP review is complete.

## G. High-Risk Manual Approval Required

The following steps must not be auto-merged and require manual approval before implementation:

- Adding a real `DATABASE_URL`
- Adding Prisma migrations
- Adding auth tables
- Adding RBAC
- Adding admin permissions
- Adding billing
- Adding file upload
- Adding customer sensitive data
- Adding medical document processing
- Adding customer health data
- Connecting to BOA CRM
- Connecting to Aiven
- Running destructive migrations
- Accessing production data

If any of these are required, stop and report:

- Risk
- Required decision
- Safer alternative
- Recommended next step

## H. Security Rules

- No secrets in GitHub.
- No `.env` committed.
- Railway Variables only for deployed secrets.
- No database credentials in docs except placeholders.
- No customer sensitive data in seed files.
- No medical data seed examples.
- Use least privilege for database roles.
- Log future admin changes when admin features are implemented.
- Server-side authorization is required for all future protected writes.
- Frontend hiding alone is not sufficient for future admin or protected routes.

## I. Current Status

- Neon: not connected
- Prisma: not added
- Database: not required
- Railway: should deploy without `DATABASE_URL`
- Data: static placeholder only
- Auth: not implemented
- Admin CRUD: not implemented
- BOA CRM: not connected
- Aiven: not connected

## J. Next Recommended PRs

- PR-13: Neon setup and Prisma foundation planning or implementation, only after approval
- PR-14: Admin CRUD architecture planning
- PR-15: Insurer directory admin CRUD
- PR-16: Claim document admin CRUD

Each next PR should keep scope narrow and include its own security review, migration plan, test plan, and rollback notes where applicable.
