# PlannerDesk Admin CRUD Architecture Plan

This document is a plan, not an implementation.

Do not add Neon, Prisma, database migrations, auth, admin routes, admin UI, login, protected server actions, or runtime database behavior in this PR.

## A. Purpose

Admin CRUD is needed because static MVP data is useful for early validation but not enough for long-term operation.

PlannerDesk will need a safe way for authorized operators to update:

- Insurer links and contact references
- Claim document library entries
- Disclosure and policy link references
- Customer message templates

Future Admin CRUD should allow approved operators to update public resource data without code changes while preserving verification status, publication controls, and safety boundaries.

## B. Current Status

- Static content exists in `lib/content`.
- Neon PostgreSQL connection and Prisma foundation are configured.
- Auth DB schema, Prisma Adapter, and minimal RBAC helpers are implemented (PR-22, PR-23, PR-24).
- The `Insurer` model and its database migration are defined in Prisma (PR-25).
- Protected insurer admin CRUD exists under `/admin/insurers` (PR-26).
- Public `/directory` still reads static content until a later public DB-read integration PR.
- Claim document, disclosure link, and message template CRUD are not implemented.
- Audit logging is not implemented yet.
- PlannerDesk is separate from BOA CRM.
- Aiven is not used for PlannerDesk MVP.

## C. Admin CRUD Scope

Future admin-managed resources:

1. Insurer directory
2. Claim document library
3. Disclosure and policy links
4. Customer message templates

Out of scope for the first Admin CRUD work:

- Customer medical document upload
- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
- Community moderation
- Billing
- User account management
- Customer data storage

## D. Recommended Implementation Order

Recommended future sequence:

1. PR-14 Neon setup and Prisma foundation
2. PR-15 Minimal admin auth planning or protected admin access planning (see [ADMIN_ACCESS_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/ADMIN_ACCESS_PLAN.md))
3. PR-16 Auth foundation planning (see `AUTH_FOUNDATION_PLAN.md`)
4. PR-17 Auth.js foundation implementation
5. PR-18 Minimal protected admin shell
6. PR-19 RBAC foundation planning (see `RBAC_FOUNDATION_PLAN.md`)
7. PR-20 RBAC implementation planning (see `RBAC_IMPLEMENTATION_PLAN.md`)
8. PR-21 Auth database schema planning, manual approval required (Done)
   - See [docs/AUTH_DATABASE_SCHEMA_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/AUTH_DATABASE_SCHEMA_PLAN.md)
9. PR-22 Auth DB schema + adapter implementation, manual approval required (Done)
10. PR-23 Minimal RBAC helper implementation, manual approval required (Done)
11. PR-24 Admin route server-side role protection, manual approval required (Done)
12. PR-25 Insurer model + migration, manual approval required (Done)
13. PR-26 Insurer directory admin CRUD, manual approval required (Done)
14. PR-27 Insurer action field expansion planning, documentation only (Done)
    - See [docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md)
15. PR-28 Insurer action fields migration, manual approval required (Done)
16. PR-29 Admin form update for insurer action fields, manual approval required (Done)
17. PR-30 Public directory DB read integration, manual approval required (Done)
18. PR-31 Public insurer action card UI, manual approval required (Current)
19. PR-32 Favorites localStorage MVP (no server writes), manual approval optional depending on telemetry choices
20. PR-33 Verification/publish workflow polish, manual approval required
21. PR-34 Audit log planning or foundation, manual approval required

Each PR should include its own scope statement, security review, test plan, and rollback notes where applicable.

## E. Data Model Planning

These are conceptual future models only. Do not treat this section as a Prisma schema or migration plan.

### Insurer

- `id`
- `name`
- `category`: `life` or `non_life`
- `officialWebsiteUrl`
- `plannerPortalUrl`
- `claimPageUrl`
- `customerCenterPhone`
- `faxNumber`
- `mailingAddress`
- `notes`
- `lastVerifiedAt`
- `verificationStatus`
- `isPublished`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

### ClaimDocument

- `id`
- `title`
- `insurerId`
- `claimType`
- `documentName`
- `sourceUrl`
- `description`
- `cautionNote`
- `lastVerifiedAt`
- `verificationStatus`
- `isPublished`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

### DisclosureLink

- `id`
- `title`
- `category`
- `sourceUrl`
- `description`
- `notes`
- `lastVerifiedAt`
- `verificationStatus`
- `isPublished`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

### MessageTemplate

- `id`
- `title`
- `situation`
- `tone`
- `body`
- `safetyNote`
- `isPublished`
- `lastUpdatedAt`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

## F. Verification Workflow

Future verification statuses:

- `draft` = `&#52488;&#50504;`
- `needs_review` = `&#44160;&#49688; &#54596;&#50836;`
- `verified` = `&#44160;&#49688; &#50756;&#47308;`

Rules:

- New records should default to `draft`.
- Public pages should show only published records later.
- `draft` and `needs_review` records may be visible only in admin preview later.
- `verified` status requires manual operator review.
- Do not create fake `lastVerifiedAt` dates.
- Missing official URL should display `&#44277;&#49885; &#54869;&#51064; &#54980; &#50629;&#45936;&#51060;&#53944; &#50696;&#51221;`.

## G. Admin Roles Planning

Future roles:

- `super_admin`
- `content_admin`
- `moderator`, later only
- `verified_planner`, later only

First Admin CRUD should only require:

- `super_admin`
- `content_admin`

Rules:

- `content_admin` can manage content resources.
- `content_admin` should not manage billing.
- `content_admin` should not manage user verification unless explicitly added later.
- `super_admin` can manage system-level settings.
- Every admin change should later be audit-logged.

See `docs/RBAC_FOUNDATION_PLAN.md` for the planned Role-Based Access Control (RBAC) details and rules.

## H. Audit Log Planning

Future audit logs should track:

- `actorUserId`
- `action`
- `targetType`
- `targetId`
- `beforeValue`
- `afterValue`
- `createdAt`

Admin CRUD should eventually log:

- create
- update
- publish
- unpublish
- status change
- delete or archive

Prefer soft delete or archive over destructive delete.

## I. Safety and Compliance Rules

Admin CRUD must not allow:

- Claim payout guarantee language
- Claim amount estimation
- Loss-adjusting advice
- Medical advice
- Legal advice as final opinion
- Fear marketing
- False urgency
- Insurance fraud tips
- Customer medical document upload
- Customer sensitive data storage

## J. BOA CRM / Aiven Separation

- Do not connect to BOA CRM.
- Do not import BOA CRM data.
- Do not use the BOA CRM database.
- Do not reuse BOA CRM secrets.
- Do not use Aiven for PlannerDesk MVP.
- PlannerDesk must use its own Neon database when DB is introduced.

## K. Security Requirements Before Implementation

Before actual Admin CRUD implementation:

- Neon `DATABASE_URL` must be set in Railway Variables only.
- `DIRECT_URL` must be set if Prisma migrations require it.
- `.env` must never be committed.
- `.env.example` must contain placeholders only.
- Server-side authorization must be implemented before protected writes.
- Admin routes must not rely only on frontend hiding.
- Admin changes should be logged once the audit system exists.

## L. First Admin CRUD Recommendation

Start with insurer directory admin CRUD.

Reasons:

- Lowest sensitivity
- No customer data
- High product value
- Good first DB-backed feature
- Easy to verify public output

PR-26 implements this first protected CRUD surface for the `Insurer` model only. It does not change public `/directory` behavior, does not add hard delete, and does not add audit logging yet.

PR-27 plans the expansion of the `Insurer` model into a practical insurer action center (planner system access, helpdesk phone, call monitoring phone, card payment status, terms URL, claim form URL, claim fax handling type, and related governance fields). PR-27 is documentation only.

The schema and migration for those action fields land in PR-28 under manual approval. PR-28 does not update admin forms or public runtime behavior.

PR-29 surfaces those fields in the protected admin create/edit forms with grouped sections (A. Basic Info / B. Access / C. Support / D. Claim / E. Policy or Disclosure / F. Payment / G. Governance), tri-state controls for nullable payment booleans, and the required Korean operator copy ("공식 확인 후 업데이트 예정", "해당사항 없음", "콜센터 개별접수", "조건 확인 필요"). PR-29 does not change `prisma/schema.prisma`, does not add migrations, and does not change public `/directory` runtime behavior. The admin list view in PR-29 also flags records with three or more missing core operational fields under a "운영 정보 보강 필요" badge so operators can prioritize follow-up verification before public read-through ships.

PR-30 switches the public `/directory` page from static sample data to a DB read of published `Insurer` records via a new `lib/public/insurers.ts` helper. The helper restricts the query to `isPublished = true` AND `verificationStatus IN ('verified', 'needs_review')`, orders by `isFeatured desc, sortOrder asc, name asc`, and projects only public-safe columns (admin governance fields such as `notes`, `sourceNote`, `createdById`, and `updatedById` are excluded). The page is rendered as an async Server Component with `dynamic = "force-dynamic"` so admin publish toggles propagate immediately, and unexpected DB failures surface as the calm "잠시 후 다시 확인해 주세요" notice without exposing raw errors. PR-30 does not change `prisma/schema.prisma`, does not add migrations, and does not change the admin CRUD surface. The public insurer action card visual polish ships in PR-31. See [docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md) for the full expansion plan, including the data governance rules for empty, unavailable, conditional, and unknown states.

## M. Manual Approval Required

Do not auto-merge future work if it includes:

- Prisma migration
- Auth or RBAC
- Admin permissions
- Secrets or environment values
- Billing
- File upload
- Customer medical data
- Customer sensitive data
- BOA CRM connection
- Aiven connection
- Destructive database changes

If any of these are required, stop and report:

- Risk
- Required decision
- Safer alternative
- Recommended next step
