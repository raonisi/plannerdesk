# PR-87: PlannerVerification Prisma Schema

Schema-only PR. No public apply form, admin verification UI, community, file upload, OCR, external lookup, auto-approve, or seed bulk insert in this change set.

Policy baseline: [PR-86 Planner Verification policy](./PR-86-PLANNER-VERIFICATION-POLICY.md) · [Checklist](./PR-86-PLANNER-VERIFICATION-CHECKLIST.md)

## 1. Purpose

Add a database-backed queue for **planner verification applications** — admin-reviewed records that grant **PlannerDesk internal RBAC only** (future community write access in PR-89). `approved` is **not** legal credential proof or external authority verification.

Rows do **not** auto-update `User.role`. Role promotion to `verified_planner` is a separate **super_admin** action in PR-88.

## 2. Model: `PlannerVerification`

| Field | Type | Notes |
|-------|------|--------|
| `id` | `String` @id cuid | Primary key |
| `userId` | `String` | Applicant `User.id` |
| `user` | `User` | `onDelete: Cascade` — see §5 |
| `status` | `PlannerVerificationStatus` | Workflow (default `pending`) |
| `displayName` | `String` | Community/admin display; nickname allowed — not legal name proof |
| `plannerType` | `PlannerType` | Life / non-life / GA / agency channel category |
| `affiliationName` | `String?` | Optional company or agency reference; no certificate upload |
| `activityRegion` | `String` | Broad region (e.g. province); **no** street address |
| `careerRange` | `PlannerCareerRange` | Range only — no hire date or birth year |
| `licenseScope` | `PlannerLicenseScope` | Reference category; default `not_disclosed` |
| `businessChannel` | `PlannerBusinessChannel` | Reference channel; default `not_disclosed` |
| `verificationNote` | `String?` @db.Text | Optional applicant note; PR-88+ server scan for sensitive patterns |
| `containsSensitiveData` | `Boolean` | Suspected PII/medical/contract (default false) |
| `requestedAt` | `DateTime` | Application timestamp (default now) |
| `reviewedAt` | `DateTime?` | Last admin decision timestamp |
| `reviewedById` | `String?` | Operator user id |
| `reviewedBy` | `User?` | `onDelete: SetNull` |
| `adminMemo` | `String?` @db.Text | **Admin-only** |
| `rejectionReason` | `String?` @db.Text | **Admin-only** internal reason |
| `userFacingRejectionSummary` | `String?` | Neutral summary safe to show applicant (PR-88) |
| `suspendedAt` | `DateTime?` | When verification was suspended |
| `deletedAt` | `DateTime?` | Soft delete |
| `retentionUntil` | `DateTime?` | Retention policy (dates TBD operationally) |
| `createdAt` / `updatedAt` | `DateTime` | Audit |

### Intentionally absent

- `licenseNumber`, `licenseNumberMasked`, `registrationHint` — no license number storage in PR-87; document-only if ever needed in a separate high-risk PR
- File / attachment / OCR columns
- Auto-verify / AI / external API result columns
- Customer, contract, medical, payout columns

## 3. Enums (snake_case, project convention)

Policy docs may use `PENDING` / `UNDER_REVIEW` labels; Prisma values follow existing enum style (`CorrectionRequestStatus`, `Role`).

### `PlannerVerificationStatus`

| Value | Meaning |
|-------|---------|
| `pending` | Application received |
| `under_review` | Admin reviewing |
| `approved` | Internal verification approved — **not** legal credential |
| `rejected` | Rejected |
| `suspended` | Verification suspended |
| `expired` | Reconfirmation or expiry needed |
| `deleted` | Soft-deleted / closed out |

### `PlannerType`

| Value | Meaning |
|-------|---------|
| `life` | Life insurance focused |
| `non_life` | Non-life (property/casualty) focused |
| `both` | Life and non-life |
| `ga` | GA affiliation |
| `agency` | Agency or similar channel |
| `other` | Other |

Aligns with `InsurerCategory` (`life`, `non_life`) where applicable.

### `PlannerCareerRange`

`under_1_year`, `one_to_three_years`, `three_to_five_years`, `five_to_ten_years`, `over_ten_years`, `not_disclosed`

No exact hire date, birth date, or career certificate files.

### `PlannerLicenseScope`

`life_only`, `non_life_only`, `life_and_non_life`, `third_insurance`, `unknown`, `not_disclosed`

Reference category for admin review — **not** legal scope certification.

### `PlannerBusinessChannel`

`face_to_face`, `online`, `telemarketing`, `corporate`, `mixed`, `other`, `not_disclosed`

Minimal context for community moderation — not a sales CRM.

## 4. Relations

### Applicant: `user` → `User`

```prisma
userId String
user   User @relation("PlannerVerificationUser", fields: [userId], references: [id], onDelete: Cascade)
```

**`onDelete: Cascade` rationale:** Privacy minimization — when a `User` account is removed, verification rows are removed with it. No separate PII columns require orphan retention. Operational audit needs are met by admin logs (future) and soft-deleted rows before user deletion.

Alternative `Restrict` was rejected for MVP: would block user deletion or require manual purge first.

### Reviewer: `reviewedBy` → `User`

```prisma
reviewedById String?
reviewedBy   User? @relation("PlannerVerificationReviewer", fields: [reviewedById], references: [id], onDelete: SetNull)
```

Matches `CorrectionRequest.resolvedBy` — reviewer account deletion does **not** delete verification records.

### User back-relations

```prisma
plannerVerifications         PlannerVerification[] @relation("PlannerVerificationUser")
reviewedPlannerVerifications PlannerVerification[] @relation("PlannerVerificationReviewer")
```

## 5. Unique policy: `userId`

**Decision: no `@unique` on `userId`.**

| Option | Pros | Cons |
|--------|------|------|
| `userId @unique` | Simple; one row per user | Re-application history lost unless same row is overwritten |
| Index only (chosen) | Preserves rejected → re-apply history | PR-88 must enforce at most one `pending` / `under_review` per user |

Composite index `[userId, status]` supports inbox queries and active-application checks.

## 6. Indexes

Single-column: `userId`, `status`, `plannerType`, `careerRange`, `requestedAt`, `reviewedAt`, `deletedAt`, `containsSensitiveData`

Composite (admin inbox):

- `[status, requestedAt]`
- `[userId, status]`

`activityRegion` is not indexed — filter volume expected low; add in a later PR if admin search requires it.

## 7. Forbidden fields (not in schema)

See PR-86 §4 and user spec §E. Summary:

- PII: RRN, ID numbers, phone, email, address, bank account, full birth date
- Customer / contract: names, policy numbers, premiums, claim amounts, medical history
- Files: `fileUrl`, certificate images, OCR text
- Automation: `autoVerified`, `verificationScore`, `externalCheckResult`, `aiDecision`
- Payout / loss adjustment: `claimPayable`, `payoutDecision`, `medicalJudgment`

## 8. Sensitive-data flag

| Field | Use |
|-------|-----|
| `containsSensitiveData` | Future submit scan (PR-88+) or admin manual flag |
| `deletedAt` | Soft delete / dispose |
| `retentionUntil` | Future retention job (not implemented in PR-87) |

**Logging:** Do not log full `verificationNote` on rejection paths.

## 9. Rejection reason split

| Field | Audience |
|-------|----------|
| `adminMemo` | Admin only |
| `rejectionReason` | Admin only — detailed internal reason |
| `userFacingRejectionSummary` | Applicant — neutral, minimal; no sensitive replay |

## 10. Status flow

```text
pending → under_review → approved | rejected
approved → suspended | expired
expired → under_review (reconfirmation)
rejected → (new row) pending  — re-application in PR-88
any → deleted (soft)
```

No automatic transitions. `approved` does **not** imply `User.role = verified_planner` until PR-88 super_admin action.

## 11. PR-88 connection (admin verification UI)

- Route candidate: `/admin/planner-verifications`
- RBAC: `requireAdminAccess` for queue; `requireSuperAdminAccess` for `User.role` changes
- Filter/sort: `status`, `containsSensitiveData`, `requestedAt`
- Transitions: set `reviewedAt`, `reviewedById`, `adminMemo`, `suspendedAt`, `deletedAt`
- Pattern: PR-81 CorrectionRequest inbox

## 12. PR-89 connection (community permissions)

Community write requires:

- `User.role = verified_planner`
- `PlannerVerification.status = approved`
- `PlannerVerification.deletedAt` is null
- `PlannerVerification.suspendedAt` is null (or status not `suspended`)

`CommunityPost` author FK will reference `User.id`; verification check via join or helper in PR-89.

## 13. Migration safety

| Item | PR-87 |
|------|--------|
| `prisma/schema.prisma` | Updated — enums + model + User relations |
| `prisma/migrations/20260602100000_add_planner_verification/` | **Additive** CREATE only |
| Destructive changes | **None** |
| Existing tables | Unchanged (User gains relation fields only) |
| Existing enums | No values removed |
| `User.role` | Unchanged |
| Seed data | None |

Migration SQL: new enums, new table, FKs, indexes only. No `DROP`, `ALTER COLUMN` destructive, or enum value removal.

Do **not** run `prisma migrate deploy` against production until this PR is reviewed and merged.

## 14. Verification commands

```bash
npx prisma format
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

## 15. Out of scope (PR-87)

- Public verification apply form / server action
- Admin verification UI / server actions
- Community / Q&A / `CommunityPost`
- File upload, OCR, external API, auto-approve
- `User.role` auto-sync on approve
- Automatic retention purge
- Bulk seed
