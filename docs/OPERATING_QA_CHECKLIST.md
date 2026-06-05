# PlannerDesk Operating QA Checklist

This checklist is used before MVP release merges and Railway production smoke
tests. It verifies build health, public route behavior, admin route protection,
database readiness, and safety boundaries.

**Limited release (PR105~PR113 bundle):** use the dedicated operator pack
[PR-114-LIMITED-RELEASE-OPS.md](PR-114-LIMITED-RELEASE-OPS.md) for pre-deploy
checklist, release notes template, and rollback/Codex gates.

**Final smoke + rollback drill (PR115):** [PR-115-LIMITED-RELEASE-FINAL-OPS.md](PR-115-LIMITED-RELEASE-FINAL-OPS.md)

**Post-deploy smoke results (PR117):** [PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md](PR-117-POST-LIMITED-RELEASE-SMOKE-OPS.md)

**User 1st feedback (PR118):** [PR-118-USER-FEEDBACK-OPS.md](PR-118-USER-FEEDBACK-OPS.md)

**Operational data quality (PR119):** [PR-119-OPERATIONAL-DATA-QUALITY-OPS.md](PR-119-OPERATIONAL-DATA-QUALITY-OPS.md)

**Pre-launch final (PR120):** [PR-120-PRE-LAUNCH-FINAL-OPS.md](PR-120-PRE-LAUNCH-FINAL-OPS.md)

**User feedback ops (PR121):** [PR-121-USER-FEEDBACK-OPS.md](PR-121-USER-FEEDBACK-OPS.md)

**Data freshness routine (PR122):** [PR-122-DATA-FRESHNESS-OPS.md](PR-122-DATA-FRESHNESS-OPS.md)

**Admin operations manual (PR123):** [PR-123-ADMIN-OPERATIONS-MANUAL.md](PR-123-ADMIN-OPERATIONS-MANUAL.md)

**Data remediation (PR124):** [PR-124-DATA-REMEDIATION-OPS.md](PR-124-DATA-REMEDIATION-OPS.md)

**Knowledge quality (PR125):** [PR-125-KNOWLEDGE-QUALITY-OPS.md](PR-125-KNOWLEDGE-QUALITY-OPS.md)

**Answer Assistant beta observation (PR126):** [PR-126-ANSWER-ASSISTANT-BETA-OPS.md](PR-126-ANSWER-ASSISTANT-BETA-OPS.md)

**Search and browse UX (PR127):** [PR-127-SEARCH-UX-OPS.md](PR-127-SEARCH-UX-OPS.md)

**Work links and system shortcuts (PR128):** [PR-128-WORK-LINKS-OPS.md](PR-128-WORK-LINKS-OPS.md)

**Operational issue reporting (PR129):** [PR-129-OPERATIONAL-ISSUES-OPS.md](PR-129-OPERATIONAL-ISSUES-OPS.md)

**Monthly operations report and roadmap (PR130):** [PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md](PR-130-MONTHLY-OPERATIONS-REPORT-OPS.md)

**Integrated work dashboard (PR131):** [PR-131-DASHBOARD-OPS.md](PR-131-DASHBOARD-OPS.md)

**Advanced unified search (PR132):** [PR-132-ADVANCED-SEARCH-OPS.md](PR-132-ADVANCED-SEARCH-OPS.md)

**Data change history metadata (PR133):** [PR-133-CHANGE-HISTORY-OPS.md](PR-133-CHANGE-HISTORY-OPS.md)

**Link status manual check (PR134):** [PR-134-LINK-STATUS-OPS.md](PR-134-LINK-STATUS-OPS.md)

**Planner work favorites (PR135, client-only):** [PR-135-PLANNER-FAVORITES-OPS.md](PR-135-PLANNER-FAVORITES-OPS.md)

**Admin operations report (PR136, manual template):** [PR-136-ADMIN-OPS-REPORT-OPS.md](PR-136-ADMIN-OPS-REPORT-OPS.md)

**Answer Assistant restriction hardening (PR137):** [PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md](PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md)

**Operations reminders (PR138, manual admin only):** [PR-138-OPERATIONS-REMINDER-OPS.md](PR-138-OPERATIONS-REMINDER-OPS.md)

**Role access matrix (PR139, RBAC review only):** [PR-139-ROLE-ACCESS-OPS.md](PR-139-ROLE-ACCESS-OPS.md)

**External release / monetization judgment (PR140, no billing):** [PR-140-EXTERNAL-RELEASE-READINESS-OPS.md](PR-140-EXTERNAL-RELEASE-READINESS-OPS.md)

**Limited external beta readiness (PR141, manual approval only):** [PR-141-LIMITED-BETA-OPS.md](PR-141-LIMITED-BETA-OPS.md)

**Terms & privacy drafting plan (PR142, no legal finalization):** [PR-142-TERMS-PRIVACY-PLAN-OPS.md](PR-142-TERMS-PRIVACY-PLAN-OPS.md)

**Support & incident playbook (PR143, no ticket form or outbound send):** [PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md](PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md)

**Public landing safety review (PR144, no launch or signup form):** [PR-144-PUBLIC-LANDING-SAFETY-OPS.md](PR-144-PUBLIC-LANDING-SAFETY-OPS.md)

**Payment feasibility plan (PR145, no PG or billing implementation):** [PR-145-PAYMENT-FEASIBILITY-OPS.md](PR-145-PAYMENT-FEASIBILITY-OPS.md)

**Beta access request flow design (PR146, no signup form or auto-approval):** [PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md](PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md)

**Data responsibility notice (PR147, no bulk data edit or source crawlers):** [PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md](PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md)

**AI limited beta policy (PR148, no AA access expansion or allowlist change):** [PR-148-AI-LIMITED-BETA-POLICY-OPS.md](PR-148-AI-LIMITED-BETA-POLICY-OPS.md)

**Security & access final audit (PR149, no Auth/RBAC or allowlist changes):** [PR-149-SECURITY-FINAL-AUDIT-OPS.md](PR-149-SECURITY-FINAL-AUDIT-OPS.md)

**Deploy execution readiness (PR116):** [PR-116-LIMITED-RELEASE-EXECUTION-READINESS.md](PR-116-LIMITED-RELEASE-EXECUTION-READINESS.md)

---

## A. Code And Build Integrity

Run these checks from the repository root before every release merge:

- [ ] **Prisma schema validation**
  ```bash
  npx prisma validate
  ```
  Expected: the schema is valid and the command exits successfully.

- [ ] **Prisma client generation**
  ```bash
  npx prisma generate
  ```
  Expected: Prisma Client generates successfully.

- [ ] **TypeScript typecheck**
  ```bash
  npm run typecheck
  ```
  Expected: route types generate successfully and TypeScript exits with no
  errors.

- [ ] **ESLint check**
  ```bash
  npm run lint
  ```
  Expected: ESLint exits with no errors.

- [ ] **Production build** (no migration deploy)
  ```bash
  npm run build
  ```
  Expected: Prisma Client generates and Next.js compiles successfully.
  This command does **not** run `prisma migrate deploy`. `/directory` and
  `/claim-documents` may appear as dynamic routes because they read published
  database records at runtime.

- [ ] **Optional: full non-DB verify**
  ```bash
  npm run verify
  ```
  Expected: lint, tests, typecheck, and build all pass without database migration.

- [ ] **Database migration deploy** (operator-only, separate release step)
  ```bash
  npm run release:migrate
  ```
  Expected: only run against the intended environment after migration PR
  review, backup confirmation, and rollback plan. Not part of CI or `npm run build`.

- [ ] **Dependency audit**
  ```bash
  npm audit --audit-level=moderate
  ```
  Expected: no moderate or higher vulnerabilities.

---

## B. Public Route Smoke Checklist

Run a local, staging, or production instance and verify the public routes return
`200` without login:

- [ ] `/`
- [ ] `/directory`
- [ ] `/claim-documents`
- [ ] `/disclosure-links`
- [ ] `/message-templates`
- [ ] `/knowledge`
- [ ] `/search`
- [ ] `/community` (placeholder)

See [PR-110-PUBLIC-ROUTE-SMOKE.md](PR-110-PUBLIC-ROUTE-SMOKE.md) for extended smoke targets.

You can run the dependency-free smoke script against a running server:

```bash
BASE_URL=http://localhost:3000 npm run smoke:public
```

If `BASE_URL` is omitted, the script defaults to `http://localhost:3000`.

### Public Route Criteria

- [ ] Public pages are accessible without authentication.
- [ ] `/directory` shows only published insurer records allowed by the public
  visibility rule.
- [ ] `/claim-documents` shows only published claim document records allowed by
  the public visibility rule.
- [ ] Draft and unpublished records are not visible through search, filters, or
  stale client state.
- [ ] Empty states use calm Korean copy and do not expose technical details.
- [ ] Database error states use calm Korean fallback copy and do not expose raw
  errors.
- [ ] Missing public data uses `공식 확인 후 업데이트 예정` where relevant.
- [ ] Claim document guidance includes:
  - `보험금 지급 여부나 지급 금액을 판단하는 내용이 아닙니다.`
  - `필요서류는 보험사 및 약관에 따라 달라질 수 있습니다.`
  - `청구 전 보험사 또는 약관 확인이 필요합니다.`
- [ ] Public copy does not imply 지급 가능성 보장, 지급 금액 산정,
  보장 여부 판단, 의학적 해석, 또는 손해사정 업무.
- [ ] External links that open new tabs use
  `target="_blank" rel="noopener noreferrer"`.
- [ ] Correction request wording and operation follow
  `docs/CORRECTION_REQUEST_POLICY.md` (no PII/medical data intake, admin review before reflection).
- [ ] Correction request DB follow-up work follows
  `docs/CORRECTION_REQUEST_DB_PLAN.md` and remains separated into explicit high-risk PR scopes.
- [ ] Knowledge archive expansion follows
  `docs/KNOWLEDGE_ARCHIVE_IA.md`, and unreviewed/community content is not treated as verified knowledge.
- [ ] Knowledge content drafting/review follows
  `docs/KNOWLEDGE_CONTENT_POLICY.md` (no payout judgment, no medical interpretation, no PII/medical data handling).
- [ ] No file upload, OCR flow, customer claim submission, or customer medical
  data field is present.

---

## C. Admin Route Protection Checklist

Verify that admin routes remain protected by Auth.js and server-side RBAC:

- [ ] `/admin`
- [ ] `/admin/insurers`
- [ ] `/admin/insurers/new`
- [ ] `/admin/insurers/[id]/edit`
- [ ] `/admin/claim-documents`
- [ ] `/admin/claim-documents/new`
- [ ] `/admin/claim-documents/[id]/edit`

### Admin Protection Criteria

- [ ] Unauthenticated users are redirected or denied before admin content is
  rendered.
- [ ] `super_admin` and approved `content_admin` flows work according to the
  current RBAC helpers.
- [ ] `verified_planner` is denied for MVP admin CRUD.
- [ ] `moderator` is denied for MVP admin CRUD.
- [ ] Missing, unknown, inactive, or resigned roles are denied.
- [ ] Admin server actions call server-side auth/RBAC helpers before any write.
- [ ] Client-side hidden buttons are treated as UX only, not as the security
  boundary.
- [ ] No hard delete affordance is present.

---

## D. Database And Environment Readiness

- [ ] `DATABASE_URL` is set in Railway Variables for runtime Prisma reads and
  writes.
- [ ] `DIRECT_URL` is set in Railway Variables only if migration tooling needs a
  direct connection.
- [ ] `AUTH_SECRET` is set in Railway Variables.
- [ ] `AUTH_URL` matches the production auth callback base URL.
- [ ] Real values are never printed in PRs, docs, logs, screenshots, or issue
  comments.
- [ ] `.env` and `.env.*` files remain untracked.
- [ ] `.env.example` contains placeholders only.
- [ ] No seed/import script adds real insurer, customer, medical, billing, or
  upload data.

---

## E. Security And Privacy Boundaries

- [ ] No secrets are committed.
- [ ] No customer data is committed.
- [ ] No customer medical data is stored or processed.
- [ ] No file upload, OCR, or AI claim judgment feature is present.
- [ ] No billing or subscription data is introduced.
- [ ] No BOA CRM database, secret, data, or integration is referenced.
- [ ] No Aiven connection is introduced.
- [ ] No analytics, click tracking, or tracking cookies are introduced.

---

## F. Railway Release Notes

- Merging to `main` may trigger Railway auto-deploy.
- Do not change Railway Variables from a pull request.
- Do not paste Railway, Neon, or Auth.js secrets into pull request comments.
- Do not run manual production migrations as part of a documentation or QA PR.
- Build command: `npm run build`
- Start command: `npm run start`
