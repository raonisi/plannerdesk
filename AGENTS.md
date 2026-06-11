# PlannerDesk Agent Operating System

PlannerDesk (플래너데스크) is a public B2B SaaS platform for Korean insurance planners. It is **completely separate from BOA CRM** and must not reuse BOA CRM infrastructure, databases, customer data, or product assumptions.

This file is the **single source of truth** for human and AI agents working in this repository. When instructions conflict, **safety rules and product boundaries in this file win**.

---

## 0. Non-Negotiable Agent Contract

Every agent must optimize for **verified product safety**, not speed or apparent completion.

Before meaningful work:

- Confirm the repository root is `C:\work\plannerdesk\plannerdesk-main` or explicitly report a mismatch.
- Check the current branch and dirty state before editing. Treat existing changes as user-owned unless proven otherwise.
- Read the nearest relevant files before proposing architecture or implementation.
- Distinguish `confirmed`, `not checked`, and `information unavailable`; do not fill gaps with guesses.
- Keep changes scoped to the user's request and PlannerDesk boundaries.

During work:

- Prefer small, reviewable diffs over broad rewrites.
- Preserve unrelated user edits.
- Stop on unexpected secrets, production-data requirements, destructive operations, or guard weakening.
- Use Korean user-facing copy carefully; insurance wording must be conservative and non-final.

Before reporting completion:

- State exactly what changed, what was validated, and what remains unverified.
- Include file references for behavioral, security, or release-impacting claims.
- Report skipped checks and the reason; never present a partial check as full release readiness.
- Do not mark public beta, billing, legal, support, or AI-provider readiness as `Go` without the explicit gates in this file being satisfied.

---

## CodeGraph

This project may have a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of symbols, calls, and files. Use it for structural questions whenever available.

### Prefer CodeGraph for structural work

| Question | Tool |
| --- | --- |
| Where is symbol `X` defined? | `codegraph_search` |
| What calls function `Y`? | `codegraph_callers` |
| What does `Y` call? | `codegraph_callees` |
| What breaks if `Z` changes? | `codegraph_impact` |
| Show signature/source/docstring | `codegraph_node` |
| Give focused task context | `codegraph_context` |
| Survey related symbols | `codegraph_explore` |
| List files under a directory | `codegraph_files` |
| Check index health | `codegraph_status` |

Rules:

- Use CodeGraph before native search for symbol, call graph, architecture, or impact questions.
- Use `rg` for literal strings, UI copy, comments, logs, and exact file text.
- Do not repeat CodeGraph's structural lookup with broad grep unless a specific detail needs confirmation.
- Prefer `codegraph_context` first for architecture or "how does this work" questions.
- If `.codegraph/` is missing and the task is read-only, do **not** initialize it. Report that CodeGraph is unavailable.
- If initialization is needed for implementation work, ask before running `codegraph init -i` because it creates files.

---

## 1. Agent Operating Model

### Default workflow

| Stage | Owner | Role |
| --- | --- | --- |
| Plan → implement → validate | **Cursor** | Primary implementer |
| Review before merge/release | **Antigravity** | QA / regression / UX review |
| Limited audit | **Codex** | High-risk paths only — **not default QA** |

Read before non-trivial work:

- `.cursor/skills/plannerdesk-cursor-implementation-protocol/SKILL.md` — plan → implement → validate → report
- `.cursor/skills/plannerdesk-agents/SKILL.md` — specialist agent lenses (38 roles)

### Agent responsibility split

- **Cursor** owns normal implementation flow and should apply the implementation protocol skill.
- **Antigravity** owns broad post-change QA, UX, and regression review where requested.
- **Codex** is best used for high-risk focused review, repo-grounded debugging, release-gate audits, and small scoped patches.
- **Specialist agents** are advisory unless the user explicitly asks for delegated work or the tool owner assigns them.
- No agent may convert a review task into an implementation task unless the user asks for fixes.

### Codex limited-review triggers

Stop and flag Codex review when **any** of these apply:

- Database migration or Prisma schema change
- Auth, session, or RBAC change
- PII / sensitive data handling
- Billing, payment, or subscription
- Production or operator data access
- Admin-only draft leaking to public surfaces
- 5+ screens or large shared-component refactor
- Pre-release critical path changes

### Never without explicit user approval

- `git commit`, `git push`, PR create/merge
- `.env` / secret / token changes or output
- `npm run release:migrate` or production DB operations
- Role, allowlist, or guard weakening
- New dependencies or lockfile changes (report reason first)
- Production/staging write actions, beta-user onboarding, or provider enablement
- External paid/provider API calls from local scripts unless the task explicitly requires them

---

## 2. Architecture Map

### Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS
- Prisma 6 + Neon PostgreSQL (runtime; not required for static CI tests)
- Auth.js (NextAuth v5) for admin sessions
- Railway deployment target

### Route surfaces

| Surface | Paths | Server guard |
| --- | --- | --- |
| Public | `/`, `/directory`, `/claim-documents`, `/disclosure-links`, `/message-templates`, `/knowledge`, `/search` | `lib/public/*`, `isPublishedContentPubliclyVisible` |
| Planner | `/planner/answer-assistant` | `getVerifiedAnswerAssistantAccess` |
| Work tools | `/work-tools`, `/api/work-tools/*` | `getWorkToolsAccess` / `workToolsRouteGuard` — **verified planner + admin only** |
| Admin | `/admin/**` | `getAdminAccess` in `app/admin/layout.tsx` |
| Future / gated | `/community/**` | Placeholder; do not expand without reviewed PR |

Any new route must be classified as `public`, `planner`, `admin`, or `blocked/future` before implementation. The classification must be enforced in server code, not only navigation.

### Key directories

| Path | Purpose |
| --- | --- |
| `app/` | Routes, layouts, server actions |
| `components/` | UI; `components/admin/` for ops panels |
| `lib/auth/` | RBAC (`rbac.ts`), access guards (`access.ts`) |
| `lib/public/` | Public-safe projections and visibility |
| `lib/ops/` | Ops SSOT modules (PR157–174 standards) |
| `lib/answer-assistant/` | Verified AA feature gate, usage audit (metadata-only) |
| `lib/work-tools/` | Planner work-tools copy and boundaries |
| `tests/public`, `tests/admin`, `tests/ops`, `tests/regression` | Regression gates |
| `docs/` | PR ops hubs, security, QA checklists |

### Access control (do not weaken)

Roles (`lib/auth/rbac.ts`): `super_admin`, `content_admin`, `moderator`, `verified_planner`, `anonymous_public`.

| Capability | Roles |
| --- | --- |
| Admin desk | `super_admin`, `content_admin` |
| Work tools page + API | `verified_planner`, admin roles |
| Answer Assistant | Verified planner + feature gate + allowlist |
| Public content | Published + verified/allowed status only |

UI hiding is **not** authorization. Always enforce guards on server layouts, route handlers, and server actions.

When touching auth:

- Add or update regression tests for unauthenticated, authenticated non-admin, `verified_planner`, and admin paths.
- Check direct route-handler/server-action access, not only rendered UI.
- Do not add role aliases, temporary bypasses, or test-only backdoors in application code.

---

## 3. Product Boundary

### In scope (current MVP)

- Public landing and premium B2B portal UX
- Insurer directory, claim document library, disclosure links, message templates
- Knowledge archive (published content only on public)
- Admin content verification and ops documentation panels
- Verified Answer Assistant (draft assist, metadata-only audit, no auto-send)
- Work-tools (planner-gated; reference-only, no payout estimation)
- Ops PR standards, regression tests, legal-readiness **documentation**

### Out of scope (blocked unless explicit reviewed PR)

- Community launch, billing, subscriptions, checkout, PG/webhooks
- Customer medical document upload or PII storage expansion
- Claim payout judgment, claim amount estimation, loss adjusting
- Real file upload to production storage without reviewed design
- Public beta execution, beta user onboarding, allowlist expansion
- Terms/privacy/refund **finalization** (draft/review docs only)
- BOA CRM or Aiven integration

### Insurance copy rules (always)

Never ship user-facing text that:

- Confirms insurance payout (`보험금이 지급됩니다`, `예상 보험금`, `환급 예상`)
- Simplifies claims (`이 서류만 내면 됩니다`, `무조건 지급/부지급`)
- Urges purchase or cancellation or fear (`반드시 가입`, `해지하는 게 맞`, `지금 안 하면 손해`)
- Presents AI as final authority (`AI가 최종 판단`)

Use official insurer sources; label internal references as non-final. See `lib/work-tools/claim-boundary-copy.ts` and `docs/PR-174-TERMS-LEGAL-REVIEW-PREP.md`.

Allowed tone:

- "확인 필요", "보험사/약관 기준으로 최종 확인", "참고용", "검토 대상"
- "지급/부지급 판단이 아닙니다", "손해사정 또는 법률 판단을 대체하지 않습니다"

Blocked implementation pattern:

- A calculator or AI feature that returns an exact claim payout, refund, eligibility, or loss-adjusting conclusion to a public user.

---

## 4. Data, Privacy, and Security

- Do **not** connect to Aiven or BOA CRM.
- Do **not** use BOA CRM customer data.
- Do **not** hardcode credentials, tokens, connection strings, or API keys.
- Do **not** commit `.env` files; keep `.env.example` placeholder-only.
- Do **not** log or persist prompt/response/consultation raw text for Answer Assistant.
- Usage audit: metadata-only (`FORBIDDEN_USAGE_AUDIT_FIELDS` in `lib/answer-assistant/usage-log.ts`).
- Work-tools storage: env-only config (`lib/api/work-tools-storage-config.ts`); no hardcoded Supabase keys.
- External links: `rel="noopener noreferrer"` with `target="_blank"`.

Full model: `docs/SECURITY_MODEL.md`.

Sensitive-data handling:

- Public correction requests must reject file uploads and avoid collecting raw medical/contract details.
- Admin views may display operational metadata, but raw user text needs explicit minimization or redaction rules.
- If a change introduces a free-text field, define validation, retention, redaction, and display rules in the same PR.
- If a provider, storage bucket, webhook, or external API is introduced, use env-only configuration and add tests proving no hardcoded key exists.

---

## 5. Engineering Standards

### Code

- TypeScript for application code; avoid `any` without justification.
- Prefer simple App Router structure until complexity warrants layers.
- Match existing naming, imports, and patterns in surrounding files.
- Minimize diff scope — do not refactor unrelated code in the same PR.
- Comments only for non-obvious business or security logic.
- Keep server-only logic out of client components.
- Prefer shared policy helpers for public visibility, route guards, copy boundaries, and ops verdicts.
- Avoid duplicate policy constants in UI components; import from the SSOT module.

### UI / UX

- Premium, calm, mobile-first, professional B2B tone.
- Navy/ivory design system (`lib/design-system`).
- Avoid link-farm density, sales-flyer hype, or fear-based marketing.
- Admin panels: scannable tables, clear status labels, ops SSOT constants.
- Public pages should feel like a trusted professional portal, not a directory dump.
- When adding status badges, use explicit states such as `draft`, `reviewed`, `published`, `blocked`, `info_missing`.

### Database and migrations

- Prisma schema exists; **migrations are high-risk**.
- `npm run build` = `prisma generate && next build` — **does not** run `migrate deploy`.
- Operator-only: `npm run release:migrate` against intended environment after reviewed migration PR.
- CI must not run migrate deploy or seed against production.
- Do not add migrations, seeds, or bulk data scripts in the same PR as unrelated UI changes.
- For schema changes, include rollback considerations, data classification, and access-control impact.

---

## 6. Validation and CI

Run from repository root before release-impacting changes:

```bash
npm run typecheck
npm run lint
npm run test
npm run build          # optional locally if DB risk understood; CI runs it
npx prisma validate    # when schema touched
```

`npm run test` includes:

| Script | Scope |
| --- | --- |
| `test:answer-assistant` | AA guards, audit, beta policy |
| `test:public` | Public routes, visibility |
| `test:admin` | Admin access regression |
| `test:ops:gate` | Security, legal prep, beta review ops |
| `test:work-tools` | Work-tools access, storage config, claim boundary |
| `test:regression:manifest` | Pre-beta gate wiring |

Full pipeline: `npm run verify` (lint + test + typecheck + build).

Public route smoke (manual): `npm run smoke:public`.

Ops QA index: `docs/OPERATING_QA_CHECKLIST.md`.

Validation tiers:

| Change type | Minimum checks |
| --- | --- |
| Copy/docs only | `npm run lint` when code-adjacent; otherwise report not run |
| Public route/content visibility | `npm run test:public` + relevant lint/typecheck |
| Admin/RBAC | `npm run test:admin` + targeted route/action tests |
| Answer Assistant | `npm run test:answer-assistant` + relevant ops gate |
| Work-tools | `npm run test:work-tools` + copy-boundary review |
| Release gate | `npm run verify` + manual `smoke:public` in a safe non-production environment |

Do not run `npm run release:migrate`, seed scripts, import `--apply`, or production smoke checks unless the user explicitly approves the environment and operation.

---

## 7. Specialist Agents (Codex + Cursor)

Subagent definitions: `.codex/agents/` (from [awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents)).

- **Codex**: does not auto-spawn; delegate explicitly in prompt.
- **Cursor**: use `.cursor/skills/plannerdesk-agents/` then matching `.cursor/skills/codex-<name>/`.
- Sync skills after agent updates: `npm run skills:sync`

| Workstream | Agents |
| --- | --- |
| App routes, RSC, server actions | `nextjs-developer`, `react-specialist`, `typescript-pro`, `frontend-developer` |
| Premium B2B UI | `ui-designer`, `ui-fixer`, `frontend-developer` |
| Prisma / PostgreSQL / admin data | `postgres-pro`, `database-optimizer`, `backend-developer`, `api-designer` |
| PR review / architecture | `reviewer`, `code-reviewer`, `architect-reviewer`, `security-auditor` |
| Privacy, RBAC, draft exposure | `gdpr-ccpa-compliance`, `security-auditor` |
| Insurance product boundaries | `fintech-engineer`, `risk-manager` |
| Templates, knowledge, docs | `content-quality-editor`, `technical-writer`, `documentation-engineer` |
| Answer Assistant / AI safety | `policy-guardrail-designer`, `responsible-ai-reviewer`, `eval-engineer`, `hallucination-investigator` |
| Tests and smoke | `test-automator`, `browser-debugger`, `accessibility-tester` |
| Framework verification | `docs-researcher` |
| Git / PR hygiene | `git-workflow-manager` |

Example delegation:

```text
Review this PR: reviewer (correctness), security-auditor (RBAC + draft leak), gdpr-ccpa-compliance (PII). File references required.
```

```text
Implement /directory filter UX: nextjs-developer (routing), ui-designer (B2B tone), accessibility-tester (keyboard/contrast).
```

Always combine **`risk-manager`** with user-facing insurance content changes.

Specialist output must include:

- Scope reviewed
- Findings by severity
- Evidence file references
- Tests run or skipped
- Remaining unknowns
- Concrete next step

---

## 8. Git and PR Workflow

For PR-scoped tasks unless the user says otherwise:

1. Branch from latest `main` with a clear scope name.
2. Implement **only** requested scope.
3. Run checks: `typecheck`, `lint`, `test` (and `build` when appropriate).
4. Commit with a clear message; push; open PR to `main`.
5. PR body: Summary, Changed files, Tests, Risk level, Security/privacy impact, User-facing changes, Admin-facing changes, Follow-up.

**Low-risk** PRs: may merge after checks pass.  
**High-risk** PRs: do **not** merge — stop and report Risk, Required decision, Safer alternative, Next step.

If the user asks for a review or audit:

- Do not edit files.
- Lead with findings, not a summary.
- Use severity labels and evidence.
- Mark unverified production, GitHub, env, database, or live-service facts as `information unavailable`.

### High-risk (non-exhaustive)

- Database migrations / schema changes
- Auth, RBAC, admin role, allowlist changes
- Billing, payment, PG, webhooks
- File upload, medical data, sensitive processing
- Secrets, env vars, API keys
- BOA CRM / Aiven connection
- Destructive ops or production data access
- Legal terms/privacy/refund **finalization**

---

## 9. Stop Conditions

**Stop and report** before continuing if a task requires:

- Production secrets, Railway credentials, Neon credentials
- Unreviewed database migration or seed against non-local DB
- BOA CRM access or customer sensitive data
- Weakening public/admin/planner/work-tools guards
- Installing LazyCodex, OmO, or unapproved global tooling into this repo
- Publishing public beta, enabling payment, or enabling an AI provider without gate evidence
- Changing legal terms, privacy, refund, or support policy from draft to final
- Introducing exact claim payout/eligibility/amount outputs

---

## 10. Ops Documentation Index

Recent critical ops hubs (documentation only — not execution approval):

| PR | Topic | Hub |
| --- | --- | --- |
| PR172 | Beta review summary | `docs/PR-172-BETA-REVIEW-SUMMARY-OPS.md` |
| PR173 | Public release readiness | work-tools gate, storage env, regression tests |
| PR174 | Legal review prep | `docs/PR-174-TERMS-LEGAL-REVIEW-PREP.md` |
| PR169 | Terms/privacy draft plan | `docs/PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md` |
| PR170 | Payment architecture plan | `docs/PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md` |
| PR171 | Refund/support policy plan | `docs/PR-171-REFUND-SUPPORT-POLICY-PLAN-OPS.md` |

Deferred roadmap: `docs/PR-140-DEFERRED-PR-ROADMAP.md`.

---

## 11. Agent Quick Checklist

Before marking work done:

- [ ] Scope matches user request; unrelated files untouched
- [ ] Server-side guards intact for affected routes
- [ ] No payout/PII/forbidden insurance copy introduced
- [ ] No secrets, `.env`, or hardcoded keys
- [ ] `npm run lint`, `typecheck`, `test` pass (report if pre-existing failures)
- [ ] High-risk items flagged; no silent merge
- [ ] Commit/push only when user explicitly asked
- [ ] Unknowns and skipped checks reported plainly
- [ ] Evidence links included for release/security claims
