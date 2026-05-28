# PlannerDesk Product Roadmap

PlannerDesk will grow from a public product surface into a practical work platform for Korean insurance planners. Each phase should preserve the product boundary, avoid sensitive customer data until controls are ready, and remain separate from BOA CRM.

## Phase 1: Public Foundation

- Premium landing page
- Clear product positioning
- Placeholder modules for core work areas
- Railway-ready build pipeline
- No database dependency
- No customer data processing

## Phase 2: Practical Content Hubs

- Insurer directory content model
- Insurer action-field schema foundation
- Public insurer action card UI
- Local-only favorites for the public insurer directory (no server persistence, no analytics)
- Verification + publish workflow guardrails (draft records are never publicly visible; admin UI and server actions enforce the same rule)
- Correction request planning (queueing surface for editorial review; never mutates published data directly)
- Correction request MVP (no-DB, client-only): public users can prepare a structured correction request from the `/directory` insurer cards or directory footer and copy it to the clipboard. PR-35 ships no Prisma model, no migration, no server action, no admin queue, and no automatic Insurer update. See [docs/CORRECTION_REQUEST_PLAN.md §L](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) for shipped scope and the future DB-backed flow.
- ClaimDocument model + migration foundation: PR-37 adds the `ClaimDocument` Prisma model, the `ClaimDocumentCategory` enum, the optional `Insurer` FK, and a single additive migration. No admin CRUD, no public DB read, no API route, no file upload, no customer/medical data field. See [docs/CLAIM_DOCUMENT_MODEL_PLAN.md §L](file:///c:/work/plannerdesk/plannerdesk-main/docs/CLAIM_DOCUMENT_MODEL_PLAN.md) for shipped scope; admin CRUD ships in PR-38 and public DB read in PR-39.
- ClaimDocument admin CRUD foundation: PR-38 adds protected `/admin/claim-documents` list, create, edit, and publish/unpublish toggle. Slug uniqueness, prohibited-phrase deny-list, draft-publish guard, and Korean sensitive-data notices are enforced server-side. No hard delete, no public DB read, no API route, no file upload, no customer/medical data. See [docs/CLAIM_DOCUMENT_MODEL_PLAN.md §M](file:///c:/work/plannerdesk/plannerdesk-main/docs/CLAIM_DOCUMENT_MODEL_PLAN.md) for shipped scope.
- ClaimDocument public DB read integration: PR-39 converts the public `/claim-documents` page from static mock data to a database-backed dynamic render of published and verified `ClaimDocument` records. No public claim submission, file uploads, OCR, payout estimation, or medical/customer data storage. See [docs/CLAIM_DOCUMENT_MODEL_PLAN.md §N](file:///c:/work/plannerdesk/plannerdesk-main/docs/CLAIM_DOCUMENT_MODEL_PLAN.md) for shipped scope.
- MVP operating QA & Railway hardening: PR-40 adds operating QA checklists, deployment validation scripts, and configuration guidelines for secure Railway operations. See [docs/OPERATING_QA_CHECKLIST.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/OPERATING_QA_CHECKLIST.md) and [docs/RAILWAY_HARDENING.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/RAILWAY_HARDENING.md) for details.
- Claim document library content model
- Customer message template library
- Editorial review workflow for public information
- Admin-only content update process

See [docs/ADMIN_CRUD_ARCHITECTURE.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/ADMIN_CRUD_ARCHITECTURE.md) for the future Admin CRUD architecture plan, [docs/ADMIN_ACCESS_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/ADMIN_ACCESS_PLAN.md) for the minimal admin access plan, [docs/RBAC_FOUNDATION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/RBAC_FOUNDATION_PLAN.md) for the planned Role-Based Access Control rules, [docs/AUTH_DATABASE_SCHEMA_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/AUTH_DATABASE_SCHEMA_PLAN.md) for the Auth database schema plan, [docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md) for the planned evolution of the basic insurer directory into a practical insurer action center, [docs/CORRECTION_REQUEST_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) for the future correction request feature plan, and [docs/CORRECTION_REQUEST_POLICY.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_POLICY.md) for the correction request operating policy and safety boundaries. These documents outline the structural layout for the data layer and routing shells.

## Phase 3: Accounts And Verification

- Planner account model
- Authentication
- Planner verification policy
- Community moderation policy
- Audit logging strategy
- Abuse reporting flow

## Phase 4: AI-Assisted Workflows

- Customer-safe prompt boundaries
- No medical document upload by default
- Message tone revision
- Checklist summarization from approved public content
- Human review for regulated or high-impact guidance

## Phase 5: Commercial Platform

- Billing strategy
- Subscription tiers
- Usage analytics
- Team or agency workspaces
- Enterprise support process

## Explicit Non-Goals

- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
- Replacing licensed professional judgment
- Processing customer medical documents in the MVP

