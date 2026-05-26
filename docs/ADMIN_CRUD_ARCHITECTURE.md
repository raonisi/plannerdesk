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
18. PR-31 Public insurer action card UI, manual approval required (Done)
19. PR-32 Favorites localStorage MVP (no server writes), manual approval optional depending on telemetry choices (Done)
20. PR-33 Verification/publish workflow polish, manual approval required (Done)
21. PR-34 Correction request planning, documentation only (Done)
    - See [docs/CORRECTION_REQUEST_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md)
22. PR-35 Correction request MVP (no-DB clipboard flow; client-only dialog from public `/directory`) (Current)
    - No Prisma model, no migration, no server action, no admin queue, no automatic `Insurer` update.
    - See [docs/CORRECTION_REQUEST_PLAN.md ?L](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) for shipped scope.
23. PR-36 ClaimDocument model planning, documentation only (Done)
24. PR-37 ClaimDocument model + migration (additive `ClaimDocument` table, `ClaimDocumentCategory` enum, optional `Insurer` FK with `ON DELETE SET NULL`; reuses `VerificationStatus`) (Current)
    - HIGH-risk schema change. Antigravity review required.
    - See [docs/CLAIM_DOCUMENT_MODEL_PLAN.md ?L](file:///c:/work/plannerdesk/plannerdesk-main/docs/CLAIM_DOCUMENT_MODEL_PLAN.md) for shipped scope.
25. PR-38 ClaimDocument admin CRUD, manual approval required
26. PR-39 ClaimDocument public DB read (`lib/public/claimDocuments.ts`, published-only projection, consumes `PUBLIC_VERIFICATION_STATUSES` from `lib/public/insurers.ts`), manual approval required
27. PR-40 Correction request DB-backed flow (CorrectionRequest Prisma model + migration + protected admin queue + server-side validation + abuse boundaries from PR-34 Sections E/F/H), manual approval required (deferred from the PR-35 plan)
28. Audit log foundation, manual approval required (sequence number deferred until correction request + claim document tracks land)

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

Verification statuses:

- `draft` = `?????`
- `needs_review` = `?????????`
- `verified` = `????????`

Rules:

- New records default to `draft`.
- `draft` records are never publicly visible, even if `isPublished` is true. PR-33 enforces this server-side: both `parseInsurerForm` and `setInsurerPublished` reject the `isPublished=true + verificationStatus=draft` combination with the calm Korean error "????? ???????????????? ?????????????????. ????????? ????? ???????? ????????????? ?????????????" The list UI also disables the publish toggle for draft rows.
- `verified` status requires manual operator review against an official source.
- Do not create fake `lastVerifiedAt` dates.
- Missing official URL on the public surface should display `???? ??? ?????????? ????`.

### Public visibility policy (canonical)

A record is visible on `/directory` if and only if both conditions hold:

- `isPublished === true`
- `verificationStatus ??{ verified, needs_review }`

This rule lives in `lib/public/insurers.ts` (`PUBLIC_VERIFICATION_STATUSES`, `isInsurerPubliclyVisible`). Both the Prisma read query in `getPublicInsurers` and the admin-side publish guard (`app/admin/insurers/visibility.ts`, `actions.ts`) read from the same export so the policy cannot drift.

Governance notes:

- `verified` means the record was reviewed against the insurer's official source (website, official disclosure, planner portal announcement).
- `needs_review` may surface publicly only with a clear "?????????" badge so planners know to reconfirm before acting on the data.
- Missing operational fields keep the safe fallback copy from `lib/directory/formatting.ts` (`???? ??? ?????????? ????` / `?????????? ????` / `????????????????` / `?? ??? ?????`). Never render raw nulls.

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

PR-29 surfaces those fields in the protected admin create/edit forms with grouped sections (A. Basic Info / B. Access / C. Support / D. Claim / E. Policy or Disclosure / F. Payment / G. Governance), tri-state controls for nullable payment booleans, and the required Korean operator copy ("???? ??? ?????????? ????", "?????????? ????", "????????????????", "?? ??? ?????"). PR-29 does not change `prisma/schema.prisma`, does not add migrations, and does not change public `/directory` runtime behavior. The admin list view in PR-29 also flags records with three or more missing core operational fields under a "????? ??? ??? ?????" badge so operators can prioritize follow-up verification before public read-through ships.

PR-30 switches the public `/directory` page from static sample data to a DB read of published `Insurer` records via a new `lib/public/insurers.ts` helper. The helper restricts the query to `isPublished = true` AND `verificationStatus IN ('verified', 'needs_review')`, orders by `isFeatured desc, sortOrder asc, name asc`, and projects only public-safe columns (admin governance fields such as `notes`, `sourceNote`, `createdById`, and `updatedById` are excluded). The page is rendered as an async Server Component with `dynamic = "force-dynamic"` so admin publish toggles propagate immediately, and unexpected DB failures surface as the calm "????? ??????? ??????????? notice without exposing raw errors. PR-30 does not change `prisma/schema.prisma`, does not add migrations, and does not change the admin CRUD surface. The public insurer action card visual polish ships in PR-31. See [docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md) for the full expansion plan, including the data governance rules for empty, unavailable, conditional, and unknown states.

PR-34 plans the future correction request feature so the public directory can stay fresh without weakening the verification or publish guardrails. It is documentation only ??no runtime code, no schema, no migration, no admin form, no public form. The plan keeps user submissions in a queueing surface that requires manual admin review against an official source before any `Insurer` field is edited, and never collects customer or medical data. See [docs/CORRECTION_REQUEST_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) for the full plan.

PR-35 ships the smallest public correction-request entry point. It is a client-only, no-DB MVP: a dialog opened from each public `/directory` insurer card or from a footer panel below the card grid lets a user prepare a structured "?? ?? ??" payload (target insurer, request type, message, optional source URL, optional name/email) and copy it to the clipboard. PR-35 deliberately ships no Prisma model, no migration, no server action, no API route, no admin queue, no email notification, and no automatic update of any `Insurer` field. Inline Korean warnings instruct users not to enter personal, identification, policy, medical, or claim-document data, and the submission channel is documented as a future announcement. The DB-backed flow drafted in [docs/CORRECTION_REQUEST_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) Sections D?I remains a *plan* and now belongs to a separate, manually approved follow-up PR (provisionally PR-40). See [docs/CORRECTION_REQUEST_PLAN.md ?L](file:///c:/work/plannerdesk/plannerdesk-main/docs/CORRECTION_REQUEST_PLAN.md) for the shipped scope.

PR-37 lands the first persistent foundation for the future claim document library. It adds a single additive Prisma model `ClaimDocument`, a new closed enum `ClaimDocumentCategory` (`actual_expense`, `diagnosis`, `surgery`, `hospitalization`, `outpatient`, `fracture`, `driver`, `death`, `disability`, `other`), and an optional `insurerId` foreign key to `Insurer` with `ON DELETE SET NULL` so deleting an `Insurer` cannot cascade-destroy editorial records. The existing `VerificationStatus` enum is reused. The migration file is hand-written in Prisma's canonical format to keep the SQL fully auditable for the Antigravity review and to avoid requiring a live `DATABASE_URL` during the PR-37 commit (per AGENTS.md). PR-37 does **not** add admin CRUD, public DB read, API routes, file upload, OCR, AI claim judgment, or any field that implies payout judgment, coverage decision, or customer/medical data storage. The runtime surface (public `/claim-documents`, admin pages, `/directory`, favorites, and the correction-request MVP) is unchanged. See [docs/CLAIM_DOCUMENT_MODEL_PLAN.md](file:///c:/work/plannerdesk/plannerdesk-main/docs/CLAIM_DOCUMENT_MODEL_PLAN.md) Section L for the shipped scope, the canonical category enum, and the explicit list of fields that must remain absent until a future plan opens them.

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

