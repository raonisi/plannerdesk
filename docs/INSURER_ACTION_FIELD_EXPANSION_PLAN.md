# PlannerDesk Insurer Action Field Expansion Plan

This document started as the PR-27 plan. PR-28 implements only the approved Prisma schema and migration foundation for the action fields documented here.

Do not add admin form updates, public directory database reads, favorites, click tracking, PWA, real insurer data, customer data, medical data, BOA CRM connections, or Aiven connections in PR-28. PR-28 only adds the approved action-field schema and migration.

## A. Purpose

The current `Insurer` model (introduced in PR-25 and exposed through the protected admin CRUD in PR-26) gives PlannerDesk a clean directory record for each Korean insurer. That is enough to begin operational content management.

However, a basic directory is not the experience that makes a working planner come back every day. Korean insurance planners do not want to scroll through "links to insurer websites." They want a daily one-tap workdesk that turns each common task into a single button:

- "I need to call the carrier helpdesk for this case."
- "I need the claim fax number for this carrier right now."
- "I need to log in to the planner portal."
- "I need the claim form PDF for this insurer."
- "Does this carrier allow recurring credit-card premium payments?"

This is the gap PlannerDesk should close after PR-26.

PlannerDesk will therefore evolve the `Insurer` model from a basic contact/link record into a **standardized operational action card**. Each insurer will expose the same workflow-aligned action slots, and PlannerDesk will own the verification, governance, and premium presentation layer that planner-facing data deserves. The goal is to become the premium daily workdesk that Korean insurance planners trust, not another insurer link farm.

This document defines the conceptual surface. PR-28 adds the schema and migration foundation only; admin forms and public UI work happen in later, separately reviewed PRs.

## B. Current Insurer Model Boundary

PR-25 introduced the `Insurer` model with the following fields, and PR-26 exposed admin CRUD over them:

- `id`
- `name`
- `category` (`life`, `non_life`)
- `officialWebsiteUrl`
- `plannerPortalUrl`
- `claimPageUrl`
- `customerCenterPhone`
- `faxNumber`
- `mailingAddress`
- `notes`
- `verificationStatus`
- `lastVerifiedAt`
- `isPublished`
- `createdAt` / `updatedAt`
- `createdById` / `updatedById`

These fields are enough for:

- First admin CRUD lifecycle (create, edit, verify, publish).
- A clean baseline directory listing.
- A safe verification and publication workflow per record.

They are **not** enough for:

- A one-tap operational action card.
- Differentiating between "no card payment" and "unknown card payment."
- Differentiating between "fax exists" and "call center only."
- Exposing planner-system access vs. customer-facing pages clearly.
- Curated claim-form deep links.
- Per-card favorite, sorting, and featured controls.

PR-27 planned the field expansion that closes this gap. PR-28 adds the approved fields to the Prisma schema without changing admin forms or public runtime behavior.

## C. Benchmark Insight

PlannerDesk benchmarked a competing Korean planner workflow portal (community-curated, public, mobile-first PWA). That portal organizes each insurer card around a consistent set of action slots:

| Korean label | English meaning |
|---|---|
| 전산접속 | Planner system access (login to insurer back office) |
| 인콜모니터링 | Call monitoring phone (planner-side QA hotline) |
| 전산헬프데스크 | System helpdesk phone (IT/access support for planners) |
| 카드납 초회/계속분 | Card payment availability (first premium / recurring premium) |
| 고객센터 | Customer center phone |
| 청구팩스 | Claim fax number |
| 등기우편 주소 | Registered mail address |
| 약관 | Policy terms link |
| 청구양식 | Claim form link |
| 즐겨찾기 | Favorite toggle (per-user UI state) |

This is a **functional benchmark, not a copying plan.**

PlannerDesk will not mirror the benchmark site's exact layout, branding, or data set. PlannerDesk will reinterpret the benchmark as follows:

- **Stronger verification:** every public operational data point is reviewed against an official insurer source, not crowd-sourced.
- **Better data governance:** explicit `unknown`, `unavailable`, and `conditional` states, no silent blanks, and no fake "last verified" timestamps.
- **Premium UI:** a calm, professional financial workdesk tone, not a card-news/insurance-link-farm look.
- **SaaS-ready architecture:** action data lives in a typed, versioned schema with admin tooling, audit-friendly events, and a clear publish boundary.
- **Privacy-respecting personalization:** favorites and usage signals start as local-only, with opt-in click tracking only after a privacy review.

## D. Proposed Future Insurer Action Fields

These are conceptual future fields. Do not treat this section as a schema or migration plan. Field names below are working names; the actual Prisma identifiers will be finalized in the PR that adds them.

### D-1. New operational fields

- `systemUrl` — planner-side system / back-office login URL. Distinct from the existing `plannerPortalUrl` if PlannerDesk later wants to keep `plannerPortalUrl` for a public planner landing and `systemUrl` for the protected work entry point.
- `callMonitoringPhone` — 인콜모니터링 hotline for planner-side QA.
- `helpdeskPhone` — 전산헬프데스크 phone for system access support.
- `cardPaymentInitialAvailable` — boolean-ish marker for first premium (초회).
- `cardPaymentRecurringAvailable` — boolean-ish marker for recurring premium (계속분).
- `cardPaymentNote` — free-text caveat (eg. card brand restrictions, channel restrictions).
- `claimFaxNumber` — claim-side fax (distinct from generic `faxNumber`, which may stay as a general administrative fax).
- `registeredMailAddress` — claim-related registered mail address (distinct from generic `mailingAddress` if those start to diverge by use case).
- `termsUrl` — policy terms (약관) deep link.
- `claimFormUrl` — claim form (청구양식) deep link.
- `sourceNote` — provenance note (eg. "Pulled from official 2025-12 claim notice PDF, verified by content_admin").
- `sortOrder` — manual ordering for curated directory layouts.
- `isFeatured` — manual highlight flag for the public directory.

### D-2. Status fields with explicit unknown handling

Operational data is frequently incomplete, channel-specific, or in transition. Boolean fields silently treat "not yet checked" as "false," which is exactly the failure mode that produces broken planner workflows. PR-27 therefore plans **explicit enum-style status fields** alongside booleans where ambiguity is common.

`claimFaxHandlingType`:

- `fax` — a real claim fax number is published.
- `call_center_individual` — the insurer routes claim submissions through the call center on a per-case basis ("콜센터 개별접수").
- `unavailable` — the insurer does not accept claim faxes at all.
- `unknown` — not yet verified by an operator.

`cardPaymentStatus`:

- `available` — both first and recurring premium card payment confirmed available.
- `unavailable` — confirmed not available.
- `conditional` — available with constraints (specific card brands, specific products, online-only, etc.). Use with `cardPaymentNote`.
- `unknown` — not yet verified.

`cardPaymentInitialAvailable` and `cardPaymentRecurringAvailable` may still exist as fine-grained booleans, but the user-facing summary should be derived from `cardPaymentStatus` and the note.

### D-3. Not in this PR

PR-28 adds the approved fields, enums, and practical indexes in `prisma/schema.prisma` and the accompanying migration. It does not wire those fields into admin forms or public pages.

## E. Field Grouping

The future field set should be grouped by **practical workflow**, not by alphabetic field order, both in the admin form and on the public card.

1. **Access**
   - `plannerPortalUrl`
   - `systemUrl` (future)
   - `officialWebsiteUrl`

2. **Support**
   - `helpdeskPhone` (future)
   - `customerCenterPhone`
   - `callMonitoringPhone` (future)

3. **Claim**
   - `claimPageUrl`
   - `claimFaxNumber` (future, alongside or replacing existing generic `faxNumber` for the claim use case)
   - `claimFormUrl` (future)
   - `registeredMailAddress` (future, alongside the existing generic `mailingAddress` if their semantics diverge)

4. **Policy / Disclosure**
   - `termsUrl` (future)
   - Disclosure URL — only if a separate `DisclosureLink` model later proves insufficient and an insurer-scoped disclosure link is required.

5. **Payment**
   - `cardPaymentStatus` (future)
   - `cardPaymentInitialAvailable` (future)
   - `cardPaymentRecurringAvailable` (future)
   - `cardPaymentNote` (future)

6. **Governance**
   - `verificationStatus`
   - `sourceNote` (future)
   - `lastVerifiedAt`
   - `isPublished`
   - `sortOrder` (future)
   - `isFeatured` (future)
   - `createdBy` / `updatedBy`
   - `notes` (internal operator notes)

This grouping should drive both the admin form section layout (Section H) and the public action card layout (Section G).

## F. Data Governance Rules

The benchmark site shows that the hardest part of an insurer action directory is **labeling missing or non-applicable data honestly**. PlannerDesk must do this better than the benchmark.

Required labeling rules for the public surface:

- Empty operational fields (still being verified): show **"공식 확인 후 업데이트 예정"**.
- Confirmed non-applicable fields (e.g., insurer does not offer card payment, no claim fax): show **"해당사항 없음"**.
- Claim fax handled per case by call center: show **"콜센터 개별접수"**.
- Conditional data (e.g., card payment only with certain brands or channels): show **"조건 확인 필요"** plus `cardPaymentNote` content.

Verification integrity rules:

- Do not fake `lastVerifiedAt`. The operator who clicks "verify" is responsible for the timestamp.
- Do not publish unverified operational links as `verified`. Publication should remain decoupled from verification status, but the public UI must clearly distinguish them.
- All public-facing operational data must have a documented source. `sourceNote` should reference the official insurer page, PDF, or notice used to populate the field.
- Operational phone, fax, and link information must be checked against the insurer's official channel (insurer website, official disclosure, planner portal announcement) when possible. Community-only sources are not sufficient for "verified" status.
- Operator changes to operational fields should later flow through the audit log (planned separately).

These rules apply to the **future** field set. The existing fields shipped in PR-25/PR-26 already follow the verification model defined in `docs/ADMIN_CRUD_ARCHITECTURE.md`.

## G. UI Direction

Future public insurer action card direction (no implementation in this PR):

- One-tap action layout: every workflow-relevant field is a button or link, not a paragraph.
- Mobile-first: the card layout must work cleanly on a phone before it is allowed to look good on desktop.
- Large touch targets: planner usage is often on the move; buttons should be sized for thumbs, not cursors.
- Clear badges: category (`life` / `non_life`), verification status, and published state should be visible at a glance.
- Missing data clearly labeled: see governance rules in Section F. Never hide an empty field silently.
- No link-farm aesthetic: avoid flashy color blocks, oversized logos, banners, or insurance-style sales decoration.
- Premium financial workdesk tone: calm, typographic, professional. The card should feel like a planner's terminal, not a campaign landing.
- Quick actions grouped by workflow: Access / Support / Claim / Policy / Payment groupings from Section E should be visually distinguishable inside the card.
- Card structure should degrade gracefully on smaller screens (stacked groups, expandable detail rows where appropriate).

## H. Admin CRUD Impact

The current PR-26 admin form is intentionally minimal. The future field set requires a longer form that stays usable by grouping fields into sections that mirror Section E:

- Basic Info — `name`, `category`, `notes`
- Access — `plannerPortalUrl`, `systemUrl`, `officialWebsiteUrl`
- Support — `helpdeskPhone`, `customerCenterPhone`, `callMonitoringPhone`
- Claim — `claimPageUrl`, `claimFaxNumber`, `claimFormUrl`, `claimFaxHandlingType`, `registeredMailAddress`
- Policy / Disclosure — `termsUrl`
- Payment — `cardPaymentStatus`, `cardPaymentInitialAvailable`, `cardPaymentRecurringAvailable`, `cardPaymentNote`
- Verification — `verificationStatus`, `lastVerifiedAt`, `sourceNote`
- Publication — `isPublished`, `sortOrder`, `isFeatured`

The PR that implements these forms should also:

- Keep the existing PR-26 server-side authorization model.
- Preserve the existing draft / needs_review / verified workflow.
- Accept partial updates without flipping `verificationStatus` automatically.
- Validate URLs and phone formats only at the input layer; the database should accept rough text and let admins clean it.

Do not implement these forms in this PR.

## I. Public Directory Impact

Future public `/directory` direction (no implementation in this PR):

- `/directory` should eventually read **published** insurer records from the database (planned as PR-30 in this document's migration plan; this supersedes the older PR-27 placement of "Public directory DB read integration" recorded in `docs/ADMIN_CRUD_ARCHITECTURE.md`).
- Only `isPublished = true` records should be visible publicly.
- Unverified or missing data must be labeled per Section F. Public callers must never see admin-only metadata (`createdById`, `updatedById`, internal `notes`, etc.).
- The public page must not require login.
- The public page must not block or regress current MVP routes; the migration to a DB-backed read should ship behind a clear cutover and keep the existing static fallback until ready.
- The public action card should be safe to crawl by search engines but should not expose operator identities or audit fields.

## J. Favorites and Usage Signals

The benchmark relies heavily on per-user favorites and "today's popular insurer" social signals. PlannerDesk should plan a privacy-respecting equivalent:

- **MVP: localStorage favorites only.** A "star" toggle on each card, stored client-side. No login required, no server write.
- **Recent insurers:** a small, local-only list of recently used insurer cards.
- **Popular insurer action cards:** server-side aggregate counts of public card views or button taps, displayed as a "today's popular" section.
- **Click tracking:** any per-button click metrics require a privacy review first. Use anonymous aggregate counters, not per-user trails. No IP, device fingerprint, or session-level behavioral profile in the early MVP.
- **No personal sensitive tracking:** never associate insurer action usage with a logged-in planner identity, customer identifier, or any medical or claim context.

Favorites, recents, and popularity should be planned in a later, separately reviewed PR.

## K. Migration Plan

Recommended future PR sequence after PR-27. Each PR should keep scope narrow and include its own security review, migration plan, test plan, and rollback notes where applicable.

- **PR-28 Insurer action fields migration** — add the new fields and enums from Section D under a Prisma migration. Manual approval required. **Done.**
- **PR-29 Admin form update for action fields** — extend the protected admin CRUD UI to the grouped sections from Section H. Manual approval required. **Done.**
- **PR-30 Public directory DB read integration** — switch `/directory` to read published insurer records from the database via `lib/public/insurers.ts` (where `isPublished = true` AND `verificationStatus IN ('verified', 'needs_review')`, ordered by `isFeatured desc, sortOrder asc, name asc`), projecting only public-safe fields. The page becomes an async Server Component with `dynamic = "force-dynamic"`, falls back to a calm "잠시 후 다시 확인해 주세요" notice on DB failure, and never exposes raw errors. Manual approval required. **Done.** This replaces the older PR-27 placement of public DB read integration that appeared in `docs/ADMIN_CRUD_ARCHITECTURE.md`.
- **PR-31 Public insurer action card UI** — implement the one-tap action card per Section G, replacing the placeholder directory layout. Manual approval required. **Done.** Polishes the public `/directory` card with grouped sections (Access / Support / Claim / Policy / Payment), a featured top-bar accent, larger touch targets, `tel:` phone affordances with normalized hrefs, a calm payment status pill, and the data-governance fallback copy ("공식 확인 후 업데이트 예정" / "해당사항 없음" / "콜센터 개별접수" / "조건 확인 필요"). UI polish only — no schema change, no migration, no admin write change, no change to the published-only visibility rules from PR-30.
- **PR-32 Favorites localStorage MVP** — ship local-only favorites for public `/directory` insurer cards per Section J. Manual approval optional depending on telemetry choices. **Done.** Adds a `hooks/useFavorites.ts` client hook that persists insurer ids only to the `plannerdesk:favoriteInsurers` localStorage key (versioned JSON envelope, defensive parsing, silent fallback when storage is unavailable), a star toggle on each card with "즐겨찾기 추가" / "즐겨찾기 해제" aria labels, and a top-level "전체 / 즐겨찾기" tab strip on `/directory`. The favorites view filters the already-loaded published insurer list, so any cached favorite id pointing to an unpublished or removed record is silently skipped — never reveals unpublished data. No server persistence, no account linkage, no analytics, no click tracking, no cookies for tracking, and no change to PR-30 visibility rules.
- **PR-33 Verification/publish workflow polish** — refine the operator workflow so the verification + publish lifecycle is clear, safe, and hard to misuse. Manual approval required. **In flight.** Centralizes the canonical visibility rule in `lib/public/insurers.ts` (`PUBLIC_VERIFICATION_STATUSES`, `isPublicVerificationStatus`, `isInsurerPubliclyVisible`) so the public read path and the admin publish guard share one source of truth. Adds `app/admin/insurers/visibility.ts` with the Korean admin copy and a `wouldPublishDraft` helper. Wires a server-side draft-publish guard into both `parseInsurerForm` (form save) and `setInsurerPublished` (list toggle), so `isPublished=true + verificationStatus=draft` is rejected with the calm Korean error "초안 상태의 보험사는 공개할 수 없습니다. 검수 필요 또는 검수 완료 상태로 변경한 뒤 공개해 주세요." Polishes the admin list and form with Korean badges ("초안" / "검수 필요" / "검수 완료" / "게시 중" / "비게시"), a combined visibility badge ("공개 화면 표시" / "공개 조건 미충족"), a prominent visibility-policy notice, a disabled publish affordance for draft rows, and Korean filter/action labels. Adds a small public-side verification-status explainer to `/directory`. No schema change, no migration, no public visibility widening, no RBAC change.

### Public visibility policy (canonical)

A record is visible on `/directory` if and only if both conditions hold:

- `isPublished === true`
- `verificationStatus ∈ { verified, needs_review }`

`draft` and unpublished rows are never publicly visible. The rule is defined once in `lib/public/insurers.ts` (`PUBLIC_VERIFICATION_STATUSES`, `isInsurerPubliclyVisible`) and consumed by both the public Prisma read in `getPublicInsurers` and the admin-side guard in `app/admin/insurers/visibility.ts`. PR-33 enforces this server-side at both write paths (form save and publish toggle). The favorites feature from PR-32 layers on top of this published-only list, so stale favorited ids cannot reveal hidden records.

Audit logging, popularity aggregates, and click tracking should each get their own dedicated planning before implementation.

## L. Risk and Compliance

The action-card surface increases PlannerDesk's exposure to a few specific risks. Documenting them now makes later PRs easier to scope safely:

- **Broken external links.** Insurer URLs change without notice. Stale links degrade trust quickly; the verification workflow must reach the action fields, not only the basic fields.
- **Unofficial contact data.** Phone, fax, and address values that were correct once may be retired or routed differently. The `sourceNote` + `lastVerifiedAt` pair must accompany every operational field on the public surface.
- **Outdated phone/fax numbers.** Some carriers rotate numbers seasonally. PlannerDesk should treat operational data as perishable and plan re-verification cadence (out of scope for this PR).
- **Trademark and company name usage.** Insurer names and category labels are factual references and should be presented neutrally. Do not display insurer logos as marketing endorsements. Avoid implying any partnership.
- **Planner-oriented operational info exposed to general public.** Some action fields (e.g., 인콜모니터링, 전산헬프데스크) are planner-side hotlines, not customer hotlines. Public copy must label them clearly so that retail customers do not misroute calls. Where appropriate, consider gating planner-only hotlines behind verified-planner access in a later phase.
- **Disclaimers.** The public page must show an "official source" disclaimer near operational data and link out to the insurer's official channel for binding information.
- **Revision request workflow.** Planners and operators should have a clear way to report stale or incorrect operational fields. A lightweight "request revision" link planned for a later PR should feed into the admin queue rather than directly mutating data.

## M. Out of Scope

PR-28 does not implement, and does not require approval for, any of the following:

- Admin form updates (no edits under `app/admin/insurers`)
- Public directory database reads (no edits under `app/directory`)
- API route changes (no edits under `app/api`)
- Favorites or recent insurers UI
- Click tracking, popularity counters, or any new analytics events
- PWA shell, manifest, or service worker
- Real insurer data import or seeding
- Any customer data, medical data, or claim payout judgment
- BOA CRM connection
- Aiven connection
- Payment, billing, or subscription work
- File upload or storage

PR-33 polishes the verification/publish workflow on top of the PR-30/31/32 stack. It does not add a schema or migration, does not widen public visibility, does not change Auth/RBAC, and does not introduce destructive operations. The next implementation work after PR-33 is PR-34 (Correction request planning, documentation only).
