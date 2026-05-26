# PlannerDesk Correction Request Planning

This document is a plan, not an implementation.

Do not add a public correction form, API route, database model, schema migration, file upload, email notification, admin correction dashboard, runtime spam protection, or any customer or medical data handling in this PR. PR-34 is documentation only.

PR-34 plans a future correction request feature that lets users suggest updates to insurer operational information (links, phone numbers, fax numbers, claim forms, card payment rules, etc.) without weakening the verification and publish guardrails PlannerDesk already enforces.

## A. Purpose

PlannerDesk publishes operational information for Korean insurers. Even when the directory ships with verified data, the underlying data is perishable:

- Insurer URLs change without notice, including the planner system entry point and the claim form deep link.
- Customer center, helpdesk, and call monitoring phone numbers rotate seasonally for some carriers.
- Claim fax numbers and registered mail addresses can be retired or merged into call-center individual handling.
- Card payment rules change as carriers add or remove brand or channel restrictions.
- Policy terms (약관) and claim form (청구양식) deep links are republished under different paths each time the carrier updates them.

Planners and public users frequently notice these regressions before an admin operator does. A correction request feature should:

- Capture the freshness signal early, before stale data drives a wrong call or a misrouted fax.
- Route the suggestion through admin review, never through a direct write to the public record.
- Preserve the verification model from PR-25 / PR-26 / PR-29 / PR-33: nothing becomes publicly visible until an operator has reviewed the change against an official source.
- Keep the public surface calm — no community wall of unverified suggestions, no public ranking of insurers, no implied endorsement of any carrier.

The correction request layer is therefore a *queueing surface for editorial review*, not a public editing tool.

## B. Current Boundary

As of the start of PR-34, the following are already in place:

- Public `/directory` reads published `Insurer` data via `lib/public/insurers.ts` (`isPublished = true` AND `verificationStatus` ∈ `{ verified, needs_review }`).
- Protected admin CRUD exists under `/admin/insurers` (created in PR-26, expanded in PR-29, polished in PR-33).
- PR-33 centralized the canonical visibility rule and added server-side draft-publish guards in both `parseInsurerForm` and `setInsurerPublished`.
- Public users cannot edit records. There is no public form anywhere in the app.
- Local-only favorites exist via `hooks/useFavorites.ts` (PR-32) and never write to the server.

The following do not exist yet and must not be added in PR-34:

- No correction request feature.
- No public form of any kind.
- No `CorrectionRequest` database model.
- No correction request API route.
- No customer or medical data is collected anywhere in the app.
- No file upload endpoint.
- No notification system (email, SMS, push, in-app).

PR-34 plans the future correction request surface against this boundary. The MVP scope arrives in PR-35; later DB-backed work arrives only after explicit approval.

## C. Future User Flow

The intended end-to-end flow (no implementation in this PR):

1. User clicks a calm `수정 요청` button on a public insurer card on `/directory`. The button must not imply that the data is wrong — it is an offer to help keep the directory fresh.
2. The user selects a request type from the list in Section D (radio buttons or a short pull-down menu, never free-form category text).
3. The user enters a short suggested correction in a single `message` text area with a strict character cap (target 1000 characters; final number set in PR-35).
4. The user optionally provides a source URL pointing to the official insurer page, PDF, or notice that supports the correction. Source URL is encouraged but never required.
5. The request is submitted as `pending`. The public surface shows a calm Korean confirmation: "수정 요청이 접수되었습니다. 검수 후 반영 여부가 결정됩니다." The public record is unchanged. No new public content is rendered from the request payload.
6. An admin operator reviews the pending queue in a future protected admin route (planned for PR-35 / PR-36). The admin compares the suggestion against the cited source or the carrier's official channel.
7. The admin applies the change manually through the existing `app/admin/insurers/*` editor. The correction record is then marked `accepted` (or `rejected` with an internal admin note). The publish guard from PR-33 still applies — a record cannot move from `draft` to publicly visible without verification.
8. The public record changes only after the admin's edit + publish action. The correction request remains in the admin queue for audit reference; the public surface never displays the original suggestion text verbatim.

No step in this flow allows a public submission to mutate a published record directly.

## D. Request Types

Possible request categories. The PR-35 form should expose these as a closed set; arbitrary user-defined categories must not be accepted.

- 잘못된 링크 — `link_incorrect`
- 전화번호 변경 — `phone_outdated`
- 팩스 번호 변경 — `fax_outdated`
- 우편 주소 변경 — `mailing_address_outdated`
- 청구 양식 링크 업데이트 — `claim_form_update`
- 약관 링크 업데이트 — `terms_update`
- 카드납 정보 변경 — `card_payment_update`
- 보험사 분류 오류 — `insurer_category_issue`
- 기타 — `other`

Each request type maps onto an operational field that already exists on the `Insurer` model so admin follow-up is unambiguous. The `other` category exists as a safety valve and must never be the silent default.

## E. Data Collection Rules

Future minimal field set on the correction request payload. Each field is described conceptually; the Prisma names will be finalized in PR-35.

- `targetType` — string enum constrained to `insurer` for the MVP. Adding more target types (e.g., claim documents, disclosure links) requires a separate planning PR.
- `targetId` — the id of the `Insurer` record the user is commenting on.
- `requestType` — one of the values in Section D.
- `message` — a short free-text suggestion (admin-facing only). Hard character cap.
- `sourceUrl` — optional URL supporting the suggestion. Validated as `http(s)://` only.
- `requesterName` — **optional**. Default to anonymous. The form should explain that providing a name is not required.
- `requesterEmail` — **optional**. Default to anonymous. Used only for a possible follow-up question from an admin, never for marketing, newsletters, or account creation.
- `status` — one of the values in Section G.
- `adminNote` — internal-only review note. Never rendered publicly.
- `createdAt` — submission timestamp.
- `reviewedAt` — admin decision timestamp (nullable until reviewed).

The following data must never be collected through the correction request surface:

- Resident registration numbers (주민등록번호) — strictly forbidden.
- Insurance policy numbers — strictly forbidden.
- Claim documents (PDF, JPG, scan, photo, prescription, hospital paperwork) — no file upload in the MVP.
- Medical information (diagnoses, treatment history, hospital names, medication, disability ratings) — strictly forbidden.
- Customer-specific contract or claim status — strictly forbidden.
- Operator credentials or session tokens — strictly forbidden.

The submission form must include calm Korean warning copy ("개인정보·진료정보·보험증권번호는 입력하지 마세요.") before the `message` text area, and the server-side handler in PR-35 should aggressively reject obvious PII patterns where possible.

## F. Privacy and Safety Rules

- No customer data flows through this feature. The correction request is an *editorial* signal about public reference data, not a customer service intake.
- No medical data is accepted, displayed, or stored.
- No file upload in the MVP. Adding file upload requires a separate, manually approved PR with its own security review.
- No automatic public changes. A correction request never mutates the public record.
- No direct DB update from a public request. Public submissions only create rows in the future `CorrectionRequest` table; they never touch the `Insurer` table.
- All requests require admin review. The accepted decision drives a manual admin edit, not a programmatic write to `Insurer`.
- Requester contact information, if collected later, must be optional and protected:
  - Treated as PII-grade data with restricted admin access.
  - Never exposed publicly.
  - Never reused for marketing, newsletters, or account creation.
  - Subject to retention limits (final retention policy chosen in PR-35).
  - Excluded from any public-safe projection or API response.

The feature must not weaken any guarantee already enforced by PR-30, PR-31, PR-32, or PR-33.

## G. Admin Review Workflow

Future statuses for a correction request record:

- `pending` — newly submitted; awaiting admin review.
- `reviewed` — an admin has looked at the request but has not yet decided.
- `accepted` — the admin agrees with the suggestion and intends to (or has) updated the `Insurer` record manually.
- `rejected` — the admin has reviewed and chosen not to apply the suggestion; reason captured in `adminNote`.
- `archived` — older closed requests rolled out of the active queue.

Rules:

- A public correction request **never** changes an `Insurer` record automatically.
- Admins must manually verify the suggestion against the insurer's official source (website, official disclosure, planner portal announcement) before applying any change. Community-only sources are not sufficient.
- An `accepted` request guides the admin's manual edit through the existing `app/admin/insurers/*` form. The PR-33 draft-publish guard still applies — a draft record cannot become publicly visible just because a correction was accepted.
- A `rejected` request preserves the admin's reasoning in `adminNote` for future audit. The original submission text is not republished anywhere on the public surface.
- `archived` records remain queryable by admins for retrospective audit but are removed from the default pending view.

The admin review surface itself is out of scope for PR-34; PR-35 (MVP) and PR-36+ (planning for the next data model) will define how the queue is rendered and protected.

## H. Abuse Prevention

The MVP must keep the public form unauthenticated to remain useful for planners and public users, which means PlannerDesk should plan abuse prevention from day one:

- **Rate limiting**: future PR-35 should rate-limit submissions per IP and per session. Final thresholds are deferred to PR-35.
- **Spam protection**: simple denylists for obvious spam patterns; admin-configurable allowlists where appropriate. No third-party tracking SDKs.
- **Honeypot or captcha**: a honeypot field is the lowest-impact first step. A captcha (Cloudflare Turnstile or similar) may be added later if spam volume justifies it; a captcha decision requires its own privacy review because it usually loads third-party JS.
- **No public display of submitted requests**: the public surface never lists pending or processed corrections. Only the resulting admin edit (filtered through the visibility policy) becomes visible.
- **No user-generated links rendered publicly without review**: even when a `sourceUrl` is provided, it stays in the admin-only queue. The public `/directory` only renders URLs that have been entered into the `Insurer` editor by an admin.
- **No external integrations from the public form** (Slack, Discord, email, webhook) without a separate planning PR.

## I. Future DB Planning

Conceptual `CorrectionRequest` model. Do not implement in this PR.

- `id` — primary key.
- `targetType` — string enum (`insurer` for MVP).
- `targetId` — id of the `Insurer` record.
- `requestType` — string enum from Section D.
- `message` — `Text`. Hard character cap enforced by Zod (or equivalent) at the action layer in PR-35.
- `sourceUrl` — optional `String?` with `http(s)://` validation.
- `requesterName` — optional `String?`. Defaults to anonymous.
- `requesterEmail` — optional `String?`. Stored only when explicitly provided. PII-grade.
- `status` — string enum from Section G. Defaults to `pending`.
- `adminNote` — optional `Text`. Internal only. Never returned through a public-safe projection.
- `createdAt` — `DateTime @default(now())`.
- `reviewedAt` — optional `DateTime`. Set when the admin transitions out of `pending` or `reviewed`.
- `reviewedById` — optional foreign key to the admin user who reviewed the request. Useful for audit; never exposed publicly.

Indexes (planned, not implemented):

- `status` — admin queue listing.
- `targetType, targetId` — fast lookup of corrections for a given insurer.
- `createdAt` — admin queue ordering.

Migration considerations for PR-35 (when the model is actually added):

- The migration must default `status` to `pending`.
- The migration must not create `email`-related uniqueness constraints — multiple anonymous requests are normal.
- The migration must not touch the existing `Insurer` model, schema, or migration sequence.

## J. Future Implementation Order

Recommended follow-up sequence after PR-34. Each step should keep scope narrow, document its own security review, and require its own approval where applicable.

- **PR-35 Correction request MVP** — implement the smallest public-safe correction request flow. New `CorrectionRequest` Prisma model + migration (manual approval required), a protected admin queue under `/admin/correction-requests`, and a public submission action under `/directory` that creates `pending` rows only. Server-side validation, rate limiting, and PII scrubbing per Sections E, F, and H. No public listing of requests.
- **PR-36 ClaimDocument model planning** — documentation only. Plan the data model for the Claim Document Library content hub (referenced in `docs/PRODUCT_ROADMAP.md`). No schema, no migration, no runtime change.
- **PR-37 ClaimDocument model + migration** — manual approval required. Adds the Prisma model and migration for `ClaimDocument` per PR-36. No admin form, no public read-through.
- **PR-38 ClaimDocument admin CRUD** — manual approval required. Adds the protected admin CRUD surface for `ClaimDocument` following the same publish guard pattern PR-33 documented for the `Insurer` model.

PR sequencing for the audit log foundation, popularity aggregates, and click tracking continues to be planned separately and is not coupled to the correction request feature.

## K. Out of Scope

PR-34 does not implement, and does not require approval for, any of the following:

- Public correction form (no edits under `app/directory/*`)
- API route (no edits under `app/api/*`)
- Database model or migration (no edits under `prisma/`)
- Admin correction dashboard (no edits under `app/admin/*`)
- File upload, attachment, or storage
- Email, SMS, push, or in-app notification
- Runtime spam protection (rate limiter, captcha, honeypot)
- Customer or medical data handling of any kind
- BOA CRM connection
- Aiven connection
- Authentication or RBAC changes
- Public visibility rule changes
- Favorites or telemetry changes

If any of these are required during review, stop and report:

- Risk
- Required decision
- Safer alternative
- Recommended next step
