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
- Claim document library content model
- Customer message template library
- Editorial review workflow for public information
- Admin-only content update process

See [docs/ADMIN_CRUD_ARCHITECTURE.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/ADMIN_CRUD_ARCHITECTURE.md) for the future Admin CRUD architecture plan, [docs/ADMIN_ACCESS_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/ADMIN_ACCESS_PLAN.md) for the minimal admin access plan, [docs/RBAC_FOUNDATION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/RBAC_FOUNDATION_PLAN.md) for the planned Role-Based Access Control rules, [docs/AUTH_DATABASE_SCHEMA_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/AUTH_DATABASE_SCHEMA_PLAN.md) for the Auth database schema plan, [docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md) for the planned evolution of the basic insurer directory into a practical insurer action center, and [docs/CORRECTION_REQUEST_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) for the future correction request feature plan. These documents outline the structural layout for the data layer and routing shells.

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

