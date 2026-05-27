# PlannerDesk Security Model

PlannerDesk starts as a public landing page with no database connection and no customer data intake. Security work should expand with product scope rather than assume sensitive capabilities before they exist.

## Current State

- Public landing page, dynamic database-backed insurer directory, and dynamic claim document library.
- Neon PostgreSQL connection for runtime operations.
- Auth.js session protection and Role-Based Access Control (RBAC) server-side validation.
- No file upload.
- No customer medical document upload.
- No claim payout or claim amount logic.
- No BOA CRM access.
- No Aiven connection.

## Data Classification

Public:

- Landing page copy
- Product descriptions
- Public roadmap statements
- Published, verified insurer directory records and claim document checklists

Internal:

- Future operational docs
- Admin-only content drafts and unpublished records
- Verification state logs

Restricted:

- Production secrets (`AUTH_SECRET`, OAuth client keys)
- API keys
- Database URLs (`DATABASE_URL`, `DIRECT_URL`)
- User account and session records

Prohibited For MVP:

- Customer medical documents
- Claim payout judgment data
- BOA CRM customer data
- Aiven database credentials
- Hardcoded production credentials

## Environment And Secrets

- `.env.example` may contain placeholders only.
- `.env`, `.env.local`, and environment-specific secret files must not be committed.
- `DATABASE_URL` and `DIRECT_URL` are required at runtime to access Neon PostgreSQL.
- Railway and Neon credentials must be configured only in their respective service dashboards.

## Future Controls

Before adding community, AI tools, file uploads, or customer-facing document vaults, implement or document:

- Planner verification workflow
- Moderation and reporting process
- Audit logging details
- Data retention policy
- Backup and recovery plan
- Privacy policy and terms review

## Stop Conditions

Pause implementation and report if a change requires:

- Production secrets
- Railway credentials
- Neon credentials
- Database migration
- BOA CRM integration
- Customer sensitive data
