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
- Neon is not connected.
- Prisma is not added.
- Auth is not implemented.
- Admin CRUD is not implemented.
- Railway deploys without `DATABASE_URL`.
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
2. PR-15 Minimal admin auth planning or protected admin access planning
3. PR-16 Insurer directory admin CRUD
4. PR-17 Claim document admin CRUD
5. PR-18 Disclosure link admin CRUD
6. PR-19 Message template admin CRUD
7. PR-20 Audit logs for admin changes

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
