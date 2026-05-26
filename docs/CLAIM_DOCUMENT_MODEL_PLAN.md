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

- **PR-37 ClaimDocument model + migration** — add the Prisma model and migration for `ClaimDocument` per this plan. Manual approval required. No admin form, no public read-through, no API route. Mirrors the PR-25 / PR-28 pattern for the `Insurer` track.
- **PR-38 ClaimDocument admin CRUD** — protected admin CRUD under `/admin/claim-documents`. Reuses the publish guard and Korean copy patterns established in PR-33. Includes the deny-list described in Section I. Manual approval required.
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
