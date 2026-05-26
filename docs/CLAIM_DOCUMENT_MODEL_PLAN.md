# PlannerDesk ClaimDocument Model Planning

This document is a plan, not an implementation.

Do not add a Prisma model, migration, admin CRUD, public DB read, file upload, OCR, AI claim judgment, customer claim submission, medical data handling, BOA CRM connection, or Aiven connection in this PR. PR-36 is documentation only.

PR-36 plans the future `ClaimDocument` data model so PlannerDesk can ship a calm, well-governed claim document library for Korean insurance planners. It must stay strictly inside the PlannerDesk product boundary: provide claim document **guidance and links**, not claim payout judgment, loss adjusting, final coverage interpretation, or medical document processing.

## A. Purpose

Korean insurance planners spend significant time answering the same recurring question for each new claim: *what documents does this carrier require for this claim type, and where do I send them?* The current MVP `/claim-documents` route is intentionally a static placeholder.

PlannerDesk needs a future `ClaimDocument` model because:

- Planners want quick, mobile-friendly access to claim document guidance during customer conversations.
- Claim document requirements differ by **claim type** (실손, 진단, 수술, 입원, 통원, 운전자, 사망, 후유장해, etc.) and by **insurer**, sometimes with subtle differences that are easy to miss in a phone call.
- A reviewed public library reduces repetitive customer-guidance work for the planner and gives the customer a consistent reference point.
- Verification and governance must be tight because outdated claim guidance can mislead planners about what to submit and where.
- Once the library exists in a structured form, the existing PR-30/PR-33 publish guard and the planned PR-34/PR-35 correction request flow can also protect this surface, so the editorial pipeline stays consistent across content hubs.

This PR documents only the data model and editorial workflow for the future library. Implementation, schema, and admin tooling happen in later, separately reviewed PRs (Section J).

## B. Current Boundary

As of the start of PR-36, the following are already in place:

- Public `/claim-documents` exists as a static placeholder route (no DB read, no claim form list, no customer submission).
- Public `/directory` reads published `Insurer` records via `lib/public/insurers.ts` (PR-30) with the canonical visibility rule centralized in PR-33 (`isPublished = true` AND `verificationStatus ∈ { verified, needs_review }`).
- Protected insurer admin CRUD exists under `/admin/insurers` (PR-26 / PR-29 / PR-33).
- PR-34 documented the future correction request feature (queueing surface for editorial review).
- PlannerDesk is independent of BOA CRM; Aiven is not used for the MVP.

The following do not exist yet and must not be added in PR-36:

- No `ClaimDocument` Prisma model.
- No claim document database table or migration.
- No claim document admin CRUD route or server actions.
- No public claim document DB read or filter UI.
- No file upload endpoint or storage bucket.
- No customer claim submission of any kind.
- No medical document handling, OCR, or AI claim judgment.
- No payout or coverage decision logic.

## C. Product Scope

PlannerDesk may provide, through the future claim document library:

- **Claim category guidance** — calm Korean descriptions of what each claim type generally covers (실손, 진단, 수술, 입원, 통원, 운전자, 사망, 후유장해 등). Plain-language, non-binding.
- **Required document checklist** — short, public, structured list of typical required documents for the claim type and (when known) the insurer.
- **Optional document checklist** — separately labeled list of optional or situational documents.
- **Insurer-specific claim form links** — verified deep links to the carrier's official claim form (`청구양식`) PDF or web form.
- **Customer-facing message templates** — short Korean message snippets the planner can reuse when guiding a customer through document preparation (no medical interpretation, no payout promises).
- **Official source links** — links to the carrier's published claim guidance, FAQ, or disclosure document used during verification.
- **Verification status + last verified date** — same governance signal already used for `Insurer` records.

PlannerDesk must **not** provide, through this library or any related feature:

- Claim payout guarantees ("이 청구는 받을 수 있습니다").
- Claim amount estimation.
- Final coverage judgment, policy interpretation, or "이 사례는 면책입니다 / 면책 아닙니다" rulings.
- Medical diagnosis interpretation, treatment recommendations, or disability rating advice.
- Loss-adjusting workflow or insurer-side claim adjudication.
- Customer claim document storage (no upload of customer-supplied PDFs, scans, photos).
- Personal medical data collection.
- Outcome prediction based on customer-specific facts.

These boundaries align with the AGENTS.md product boundary and the Phase 2 / Explicit Non-Goals sections of `docs/PRODUCT_ROADMAP.md`.

## D. Future ClaimDocument Model Concept

Conceptual field set. Do not implement in this PR. The actual Prisma identifiers will be finalized in PR-37 when the schema is added.

- `id` — primary key.
- `title` — short Korean title for the claim document entry (e.g., "실손 외래 진료 청구 안내").
- `slug` — URL-safe slug for stable cross-linking; unique.
- `category` — enum-like value from Section E.
- `insurerId` — **optional** foreign key to `Insurer`. Null when the entry is a general checklist that applies across carriers; set when the guidance is carrier-specific.
- `summary` — short Korean overview (1–3 sentences). Must avoid guarantee language (Section I).
- `requiredDocuments` — structured list of typical required documents (title + optional note). The MVP can store this as a JSON array of `{ name, note? }` or as a normalized child table; the final shape is decided in PR-37.
- `optionalDocuments` — structured list of optional or situational documents, same shape as `requiredDocuments`.
- `claimFormUrl` — optional URL to the carrier's official `청구양식` deep link. Validated as `http(s)://` only when stored.
- `officialSourceUrl` — optional URL to the carrier's published claim guidance or FAQ used for verification.
- `customerMessageTemplate` — optional Korean message template the planner can adapt for customer communication. No medical interpretation, no payout promises (Section I).
- `cautionNote` — optional Korean caveat shown alongside the public entry (e.g., "필요서류는 보험사 및 약관에 따라 달라질 수 있습니다.").
- `verificationStatus` — same enum used for `Insurer` (`draft`, `needs_review`, `verified`). Defaults to `draft`.
- `lastVerifiedAt` — nullable `DateTime`. Set only when an operator actually checks the record against the official source.
- `isPublished` — boolean. Defaults to `false`. The same publish guard documented in PR-33 applies: draft records are never publicly visible.
- `sortOrder` — integer for curated ordering on the public list, clamped to a sane range as `Insurer.sortOrder` already is.
- `createdAt` / `updatedAt` — timestamps.
- `createdById` / `updatedById` — admin user references. Internal-only, never projected into the public surface.

Indexes (planned, not implemented):

- `category` for category filters.
- `insurerId` for carrier-scoped lookup.
- `isPublished, sortOrder, title` for the public list ordering.

Public-safe projection (planned, not implemented):

A future `lib/public/claimDocuments.ts` helper should mirror the `lib/public/insurers.ts` pattern: explicit `select` clause, only the public-safe columns, and the canonical visibility rule (`isPublished = true` AND `verificationStatus ∈ PUBLIC_VERIFICATION_STATUSES`) imported from `lib/public/insurers.ts`. Admin governance fields (`createdById`, `updatedById`, any internal notes added later) must not be included in the projection.

## E. Category Planning

Initial categories. Names are working titles and may be refined before PR-37 lands. Avoid medical-conclusion language; avoid payout certainty.

- 실손 (`indemnity`)
- 진단 (`diagnosis`)
- 수술 (`surgery`)
- 입원 (`hospitalization`)
- 통원 (`outpatient`)
- 골절 (`fracture`)
- 운전자 (`driver`)
- 사망 (`death`)
- 후유장해 (`disability`)
- 기타 (`other`)

Notes:

- The category set should be a closed enum on the data model so admin entries cannot drift into ad-hoc strings. Adding a new category requires a separate, reviewed planning + migration step.
- Category copy must remain factual (e.g., "수술 청구에서 일반적으로 요구되는 서류 안내"), never speculative about outcome.
- The `기타` category is a safety valve and must not be the silent default.

## F. Public Visibility Rules

The same canonical rule documented in PR-30/PR-33 applies to claim documents:

- Only records where `isPublished = true` are visible.
- Draft records are **never** publicly visible, even if `isPublished` is somehow true (the publish guard in PR-37/PR-38 must mirror the PR-33 guard on the admin write path).
- `needs_review` may be visible only with a clearly labeled "검수 필요" badge, identical to the public insurer card. PR-39 may choose to exclude `needs_review` for the claim-document surface if reviewer policy requires stricter freshness; that decision is deferred.
- Missing official links must display `공식 확인 후 업데이트 예정`. Never render raw nulls.
- No unverified claim guidance is presented as final, definitive, or "확정". The card must always reference the official source link when present.
- The public surface must not display admin-only fields (`createdById`, `updatedById`, internal notes added later).

## G. Admin Workflow

Future admin workflow for `ClaimDocument` records. Implementation lands in PR-38; documentation only here.

1. **Create draft** — operator with content_admin role creates a `draft` record with `isPublished = false`.
2. **Add checklist** — operator fills `requiredDocuments` and `optionalDocuments` based on the official source.
3. **Add official source** — operator records `officialSourceUrl` and the precise PDF/notice in the future `sourceNote` (admin-only, internal).
4. **Set verification status** — operator transitions `draft` → `needs_review` once content is ready for peer review. Manual `verified` requires actual cross-check against the carrier's official channel.
5. **Publish after review** — only after verification, the operator toggles `isPublished` to true. The PR-33-style draft-publish guard rejects publishing a `draft` record server-side.
6. **Unpublish if outdated** — the operator can unpublish a record at any time. The public surface reflects the change on the next dynamic render.
7. **No hard delete in MVP** — destructive deletes are not allowed. Outdated records must be unpublished or moved to a future `archived` state.

RBAC continues to use the existing helpers (`requireInsurerContentManager`, `requireInsurerPublisher`) or carries a sibling `ClaimDocument*` equivalent when PR-38 lands. No new role tier is introduced by this planning PR.

## H. Data Governance

The `Insurer` model already follows the governance rules documented in `docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md` Section F. The same rules apply, with claim-document-specific extensions:

- **Official source review required**: every public record must have an `officialSourceUrl` or a documented internal `sourceNote` pointing at the carrier's official channel. Community-only sources are not sufficient for `verified` status.
- **`lastVerifiedAt` must not be faked**: the operator who clicks "verify" is responsible for the timestamp. Backdating, autofilling, or copying timestamps across records is prohibited.
- **Outdated records must be unpublished or marked `needs_review`**: when an operator notices that a `claimFormUrl` 404s, that a phone routing changed, or that the carrier's official PDF was reissued, the record must be unpublished or downgraded to `needs_review` until the next verification.
- **Insurer-specific requirements need careful source tracking**: when the same claim type has different documents for different carriers, each carrier-scoped record carries its own `officialSourceUrl` and `lastVerifiedAt`.
- **Public copy must avoid guarantee language**: see Section I.
- **No customer-specific data**: the record is a public reference, not a customer file. Never paste customer names, claim numbers, policy numbers, or medical details into any field.

## I. Compliance and Wording Rules

The claim document library carries higher reputational risk than the insurer directory because Korean planners and customers may treat the copy as instruction. The following wording rules are mandatory.

Prohibited (must not appear in `title`, `summary`, `requiredDocuments`, `optionalDocuments`, `cautionNote`, or `customerMessageTemplate`):

- "보험금 지급됩니다"
- "무조건 받을 수 있습니다"
- "청구하면 나옵니다"
- "확정"
- "100%"
- Fear-based marketing language (e.g., "지금 안 하면 못 받습니다")
- Any claim outcome judgment
- Any medical diagnosis interpretation
- Any policy interpretation framed as a final ruling

Preferred (calm, non-binding, source-anchored):

- "필요서류는 보험사 및 약관에 따라 달라질 수 있습니다."
- "공식 확인 후 업데이트 예정"
- "청구 전 보험사 또는 약관 확인이 필요합니다."
- "본 안내는 일반적인 절차를 정리한 것으로, 개별 청구 결과를 보장하지 않습니다."
- "정확한 안내는 해당 보험사 공식 채널을 통해 확인하시기 바랍니다."

The future admin form (PR-38) should reject the prohibited phrases server-side via a simple deny-list and present an admin warning before saving. The deny-list is illustrative, not exhaustive; legal/compliance review may extend it before PR-39 ships the public surface.

## J. Future Implementation Order

Recommended PR sequence after PR-36. Each step keeps scope narrow, carries its own security review, and requires explicit approval where applicable.

- **PR-37 ClaimDocument model + migration** — *shipped per Section L below.* Adds the Prisma model and a single additive migration. No admin form, no public read-through, no API route, no runtime behavior change. Antigravity high-risk schema review required.
- **PR-38 ClaimDocument admin CRUD** — *shipped per Section M below.* Protected admin CRUD under `/admin/claim-documents` with the publish guard, slug uniqueness check, and the Section I prohibited-phrase deny-list. Hard delete is intentionally not supported. Antigravity high-risk review required.
- **PR-39 ClaimDocument public DB read** — switch `/claim-documents` from static placeholder to a published-only DB read via a new `lib/public/claimDocuments.ts` helper. Consume `PUBLIC_VERIFICATION_STATUSES` from `lib/public/insurers.ts` so the visibility rule cannot drift across content hubs. Manual approval required.
- **PR-40 MVP operating QA / Railway hardening** — operating-readiness pass once the claim document hub is live (publish QA, content audit, Railway deploy hardening, observability defaults). Documentation + small ops changes only; the manual-approval scope is decided when this PR opens.

The audit log foundation, correction request MVP (planned in PR-34), and any popularity/click-tracking work continue to be sequenced separately from this list.

## K. Out of Scope

PR-36 does not implement, and does not require approval for, any of the following:

- Prisma model (no edits under `prisma/`)
- Database migration
- Admin CRUD (no edits under `app/admin/*`)
- Public DB read (no edits under `app/claim-documents/*`, `lib/public/*`)
- API route (no edits under `app/api/*`)
- File upload, attachment, or storage
- OCR or any document parsing
- AI claim advice, payout estimation, or coverage prediction
- Customer claim submission
- Medical data storage or processing
- Billing or subscription
- BOA CRM connection
- Aiven connection
- Auth / RBAC redesign
- Public visibility rule changes
- Favorites or telemetry changes

If any of these are required during review, stop and report:

- Risk
- Required decision
- Safer alternative
- Recommended next step

## L. PR-37 Shipped (Model + Migration Foundation)

PR-37 lands the first persistent foundation for the future claim document library: the `ClaimDocument` Prisma model and a single additive migration. It deliberately ships **no admin CRUD, no public DB read, no API route, no file upload, no OCR, no AI claim judgment, and no customer/medical data field**. The runtime surface — both public `/claim-documents` and admin — is unchanged.

### Schema added

`prisma/schema.prisma` adds the following pieces:

- `enum ClaimDocumentCategory` — closed enum with the canonical category set finalized in PR-37: `actual_expense`, `diagnosis`, `surgery`, `hospitalization`, `outpatient`, `fracture`, `driver`, `death`, `disability`, `other`. The `other` value is the safety valve and must not become a silent default in admin UI (PR-38). The Korean label "실손" maps to `actual_expense` (the planning doc used the working title `indemnity`; PR-37 chooses the more operator-friendly `actual_expense`).
- `model ClaimDocument` — the editorial record. Fields, defaults, and indexes match Sections D and F of this plan:
  - `id String @id @default(cuid())`
  - `title String`, `slug String @unique`
  - `category ClaimDocumentCategory`
  - `insurerId String?` with optional `insurer Insurer? @relation(... onDelete: SetNull)`
  - `summary String?`, `requiredDocuments String?`, `optionalDocuments String?` — plain text in the MVP. A future PR may normalize the document checklists into a child table; the current `String?` shape keeps the foundation small and reviewable.
  - `claimFormUrl String?`, `officialSourceUrl String?` — link fields; URL validation lives at the admin write path that will land in PR-38.
  - `customerMessageTemplate String?`, `cautionNote String?`
  - `verificationStatus VerificationStatus @default(draft)` — **reuses** the existing enum, no new visibility states.
  - `lastVerifiedAt DateTime?`, `isPublished Boolean @default(false)`, `sortOrder Int @default(0)`
  - `createdAt`, `updatedAt`, `createdById`, `updatedById` for governance.
  - Indexes: `category`, `insurerId`, `verificationStatus`, `isPublished`, `sortOrder`, plus the unique index on `slug`.
- `Insurer.claimDocuments ClaimDocument[]` back-relation — required by Prisma for the optional FK; no behavioral change to `Insurer` itself.

### Fields deliberately excluded

Per Section C, this PR must not introduce fields that imply payout judgment or store customer/medical data. The following are explicitly not added in PR-37 and must remain absent unless a future plan + approval explicitly opens them:

- `expectedPayoutAmount`, `payoutProbability`, `coverageDecision`
- `medicalDiagnosis`, `customerMedicalRecord`, `patientData`
- `claimApprovalPrediction`, `lossAdjustmentStatus`
- `uploadedFileUrl` or any attachment/upload field

### Migration

`prisma/migrations/20260526190000_add_claim_document_model/migration.sql` is **additive only**. It contains:

1. `CREATE TYPE "ClaimDocumentCategory"` for the new enum.
2. `CREATE TABLE "ClaimDocument"` with the columns and defaults described above.
3. The six indexes (`slug` unique + five secondary indexes).
4. A single `ADD CONSTRAINT ... FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE`.

The migration file does **not** contain:

- Any `DROP`, `TRUNCATE`, or `DELETE`.
- Any change to the existing `User`, `Account`, `Session`, `VerificationToken`, or `Insurer` tables (the `Insurer.claimDocuments` back-relation is Prisma-only and does not emit SQL).
- Any change to `VerificationStatus` or other existing enums.
- Any `Customer`, `Policy`, `Claim`, `MedicalDocument`, `Upload`, `Payment`, `Subscription`, BOA CRM, or Aiven tables.

The migration was generated by inspection (hand-written in the Prisma migration format) to avoid requiring a live database connection during the PR-37 commit, consistent with AGENTS.md ("Do not require `DATABASE_URL` for the initial public build"). The Antigravity reviewer should compare the SQL to the schema model line-by-line.

### Runtime status (unchanged)

- Public `/claim-documents` remains the static placeholder. No DB read is wired up.
- No admin route under `/admin/claim-documents` exists. PR-38 is responsible for adding it with the publish guard and deny-list described in Sections G and I.
- No API route, no server action, no file upload, no OCR.
- The `Insurer` admin surface, public `/directory`, favorites, and correction-request MVP are untouched.

### Next steps

- **PR-38 ClaimDocument admin CRUD** — *shipped, see Section M below.*
- **PR-39 ClaimDocument public DB read** — switch `/claim-documents` from static placeholder to a published-only DB read via `lib/public/claimDocuments.ts`, consuming `PUBLIC_VERIFICATION_STATUSES` from `lib/public/insurers.ts` so the visibility rule stays canonical.
- The DB-backed correction request flow remains a separate track (provisionally PR-40) and is unaffected by PR-37.

## M. PR-38 Shipped (Admin CRUD Foundation)

PR-38 lands the protected admin CRUD surface for `ClaimDocument` records. It deliberately ships **no public DB read, no API route, no file upload, no OCR, no AI claim judgment, no customer or medical data collection, and no hard delete**. The public `/claim-documents` route remains the static placeholder.

### What shipped

- `app/admin/claim-documents/access.ts` — module-local RBAC wrappers (`getClaimDocumentAdminAccess`, `requireClaimDocumentContentManager`, `requireClaimDocumentPublisher`, `getSessionUserId`) that delegate to `lib/auth/rbac.ts` (`canAccessAdmin`, `canManageContent`, `canPublishContent`). Mirrors the Insurer admin pattern.
- `app/admin/claim-documents/visibility.ts` — Korean copy (`ADMIN_CLAIM_DOC_COPY`), the mandated guidance and sensitive-data notices, exhaustive Korean labels for `ClaimDocumentCategory` and `VerificationStatus`, plus `wouldPublishDraft` and `isClaimDocumentPubliclyVisible` helpers. The public-visibility helper imports `PUBLIC_VERIFICATION_STATUSES` from `lib/public/insurers.ts` so admin badges cannot drift from the canonical rule centralized in PR-33.
- `lib/validators/claim-document.ts` — dependency-free helpers shared by the form and the server actions: `PROHIBITED_PHRASES` (the Section I deny-list, NFKC-normalized), `findProhibitedPhrase`, `scanFieldsForProhibitedPhrases`, plus the kebab-case `SLUG_PATTERN` and `isValidSlug`.
- `app/admin/claim-documents/actions.ts` — `"use server"` actions: `createClaimDocument`, `updateClaimDocument`, `setClaimDocumentPublished`. Each action re-checks RBAC server-side, parses the form with strict text caps, scans the public-facing payload (title, summary, requiredDocuments, optionalDocuments, customerMessageTemplate, cautionNote) against the deny-list, enforces the draft+publish guard, validates the optional Insurer relation, validates the slug, parses `lastVerifiedAt` from `YYYY-MM-DD`, and clamps `sortOrder` to `[-10000, 10000]`. `setClaimDocumentPublished` re-reads the current `verificationStatus` before allowing a publish, so a stale list page (or hand-crafted POST) cannot smuggle a draft to the public surface. **No `prisma.claimDocument.delete` call exists anywhere in this PR.**
- `app/admin/claim-documents/form.tsx` — sectioned form (A. 기본 정보 / B. 보험사 연결 / C. 안내 본문 / D. 공식 링크 / E. 고객용 안내 템플릿 / F. 운영 메타데이터) with the mandated guidance and sensitive-data notices at the top, a visibility policy panel around `isPublished`, and a calm visible list of the prohibited phrases so operators see the deny-list before they save.
- `app/admin/claim-documents/page.tsx` — admin list view with title-search, category / verification / publication filters, status badges (검수 완료 / 검수 필요 / 초안 / 게시 중 / 비게시 / 공개 화면 표시 / 공개 조건 미충족), and an inline `setClaimDocumentPublished` toggle. Draft records show a disabled publish button with the `draftPublishBlocked` reason exposed via `title=`. **No delete affordance.**
- `app/admin/claim-documents/new/page.tsx`, `app/admin/claim-documents/[id]/edit/page.tsx` — create / edit shell pages that gate on `getClaimDocumentAdminAccess`, render the visibility-policy panel, and feed the form with the published list of insurers (only `id` + `name` projected for the dropdown).

### Validation rules (server-authoritative)

- `title` — required, ≤ 200 characters.
- `slug` — required, matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`, ≤ 80 characters, lowercased before persistence. Prisma's unique constraint (PR-37) provides the second line of defense; the action catches `P2002` and returns a Korean "duplicate slug" message instead of leaking a Prisma error.
- `category` — required, must be a member of the `ClaimDocumentCategory` enum from PR-37.
- `insurerId` — optional. When provided, the action verifies the record exists; on absence it returns the "보험사를 찾을 수 없습니다." copy. Deleting the insurer at the DB level continues to set this column to NULL (PR-37 `ON DELETE SET NULL`).
- `summary` — optional, ≤ 1,000 characters.
- `requiredDocuments`, `optionalDocuments` — optional, ≤ 4,000 characters each.
- `claimFormUrl`, `officialSourceUrl` — optional, must parse as `http(s)://`.
- `customerMessageTemplate` — optional, ≤ 2,000 characters.
- `cautionNote` — optional, ≤ 1,000 characters.
- `verificationStatus` — must be one of `draft` / `needs_review` / `verified`. `unverified` and `pending` (which exist on the shared enum because of the User model) are deliberately excluded from the writable set.
- `lastVerifiedAt` — optional. Format is strictly `YYYY-MM-DD`. The form hint reminds operators not to fake the timestamp; the action does not autofill it on save.
- `isPublished` — boolean. Combined with `verificationStatus === draft` rejects server-side via `wouldPublishDraft`.
- `sortOrder` — optional integer, clamped to `[-10000, 10000]`.

### Prohibited-phrase deny-list

`lib/validators/claim-document.ts` exports the canonical deny-list. Server actions scan the public-facing payload before any write. If any field contains a prohibited phrase the action redirects back with a Korean explanation that names the phrase. The current list (NFKC-normalized comparison):

- "보험금 지급됩니다"
- "무조건 받을 수 있습니다"
- "청구하면 나옵니다"
- "확정"
- "100%"
- "지금 안 하면 못 받습니다"

This list is illustrative, not exhaustive (per Section I). Legal/compliance review may extend it before PR-39 ships the public surface.

### What PR-38 does NOT do

- **No Prisma schema change.** `prisma/schema.prisma` is untouched.
- **No migration.** No new `prisma/migrations/*` directory.
- **No hard delete.** Neither `prisma.claimDocument.delete` nor a `deleteClaimDocument` action exists in the diff. Outdated records must be unpublished or downgraded to `needs_review` (per Section G #7).
- **No public DB read.** `/claim-documents` continues to render the existing static placeholder.
- **No API route.** No new files under `app/api/*`.
- **No file upload.** No `<input type="file">` in any new component.
- **No customer or medical data collection.** The form actively warns the operator not to enter 주민등록번호, 증권번호, 진료기록, 보험금 청구서류, or customer-specific 의료정보.
- **No auth/RBAC redesign.** `auth.ts`, `middleware.ts`, and `lib/auth/rbac.ts` are unchanged. PR-38 reuses the existing `canAccessAdmin`/`canManageContent`/`canPublishContent` helpers.

### Sensitive-data wording (canonical)

The two notices below are surfaced verbatim on both the list page and the form. Future PRs editing the admin surface must keep them in place.

- 안내 성격 한정: "청구서류 안내는 보험금 지급 여부나 지급 금액을 판단하는 내용이 아닙니다. 공식 약관과 보험사 기준 확인 후 공개해 주세요."
- 민감정보 입력 금지: "주민등록번호, 증권번호, 진료기록, 보험금 청구서류, 고객별 의료정보는 입력하거나 저장하지 마세요."

### Future PR boundary

- **PR-39 ClaimDocument public DB read** must switch `/claim-documents` from static to a published-only DB read via a new `lib/public/claimDocuments.ts`, consuming `PUBLIC_VERIFICATION_STATUSES` from `lib/public/insurers.ts`. PR-39 must not bring back the prohibited phrases via "draft preview" or similar; the public surface only ever renders records whose admin write went through PR-38's deny-list.
- **PR-40 Correction request DB-backed flow** remains an independent track. ClaimDocument admin CRUD does not depend on it.
