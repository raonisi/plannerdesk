# PlannerDesk Security Model

PlannerDesk starts as a public landing page with no database connection and no customer data intake. Security work should expand with product scope rather than assume sensitive capabilities before they exist.

## Current State

- Static public landing page
- No authentication
- No database requirement
- No file upload
- No customer medical document upload
- No claim payout or claim amount logic
- No BOA CRM access

## Data Classification

Public:

- Landing page copy
- Product descriptions
- Public roadmap statements

Internal:

- Future operational docs
- Future admin-only content drafts

Restricted:

- Production secrets
- API keys
- Database URLs
- Future user account data

Prohibited For MVP:

- Customer medical documents
- Claim payout judgment data
- BOA CRM customer data
- Aiven database credentials
- Hardcoded production credentials

## Environment And Secrets

- `.env.example` may contain placeholders only.
- `.env`, `.env.local`, and environment-specific secret files must not be committed.
- `DATABASE_URL` is reserved for future Neon PostgreSQL work and must not be required by the first build.
- Railway and Neon credentials must be configured only in their respective service dashboards.

## Future Controls

Before adding accounts, community, AI tools, uploads, or database-backed workflows, implement or document:

- Authentication and session management
- Authorization model
- Planner verification workflow
- Moderation and reporting process
- Audit logging
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
