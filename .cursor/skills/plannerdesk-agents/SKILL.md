---
name: plannerdesk-agents
description: Applies PlannerDesk specialist subagent roles (mirrored from .codex/agents) when implementing, reviewing, or planning the Korean insurance-planner B2B portal. Use for PlannerDesk routes (/directory, /claim-documents, /disclosure-links, /message-templates, /admin, /knowledge), Prisma, RBAC, content verification, premium UI, security/privacy, or future AI/community features.
---

# PlannerDesk Agent Orchestra

When working on PlannerDesk in Cursor, **apply the matching Cursor skills** under `.cursor/skills/codex-<agent-name>/` (generated from `.codex/agents/*.toml`). Read the skill body when the task is non-trivial; use the summaries below for quick routing.

Regenerate all codex skills after updating agents: `node scripts/codex-agents-to-cursor-skills.mjs`

## How to apply

1. **Classify** the request (feature, bug, review, content, DB, AI, docs).
2. **Pick 1–3 agent lenses** from the workstream table (combine when needed).
3. **Read** `.codex/agents/<name>.toml` for full checklists before implementing or merging.
4. **Always run** `risk-manager` + product-boundary checks on user-facing insurance content.
5. **Finish** with the validation line for each lens used (see [workflows.md](workflows.md)).

Do not weaken PlannerDesk safety rules in `AGENTS.md` (no BOA CRM, no Aiven, no claim payout judgment, no medical uploads, no secrets in repo).

## Workstream → agents

| Workstream | Agents | PlannerDesk examples |
| --- | --- | --- |
| App Router / RSC / server actions | `nextjs-developer`, `react-specialist`, `typescript-pro`, `frontend-developer` | `/directory` filters, layout, data fetching, `isPublished` visibility |
| Premium B2B UI | `ui-designer`, `ui-fixer`, `frontend-developer` | Navy/ivory tone, card hierarchy, mobile-first; avoid link-farm density |
| Prisma / PostgreSQL / admin APIs | `postgres-pro`, `database-optimizer`, `backend-developer`, `api-designer` | Insurer, ClaimDocument, admin CRUD |
| PR / architecture review | `reviewer`, `code-reviewer`, `architect-reviewer`, `security-auditor` | Small PRs, regression + auth boundaries |
| Privacy / RBAC / draft leak | `gdpr-ccpa-compliance`, `security-auditor` | No PII storage, draft/unpublished guards, Content Admin roles |
| Insurance domain & scope | `fintech-engineer`, `risk-manager` | Official links only, no payout/amount advice, auditability |
| Copy / templates / docs | `content-quality-editor`, `technical-writer`, `documentation-engineer` | Message templates, README, policy docs |
| AI assist (future) | `policy-guardrail-designer`, `responsible-ai-reviewer`, `eval-engineer`, `hallucination-investigator` | Grounded answers, citations, blocked prohibited advice |
| Tests / browser | `test-automator`, `browser-debugger`, `accessibility-tester` | `smoke:public`, route repro, a11y |
| API/framework truth | `docs-researcher` | Next.js 16, Prisma 6, next-auth v5 behavior |
| Git / PR hygiene | `git-workflow-manager` | Feature branches, high-risk stop per `AGENTS.md` |

## Product boundaries (always on)

PlannerDesk **must not** implement or imply:

- Claim payout yes/no, claim amount calculation, loss adjusting, medical diagnosis interpretation
- Customer medical document upload or PII storage
- BOA CRM or Aiven integration
- Fear-based marketing or guaranteed claim outcomes

For insurance-facing copy and features, use `fintech-engineer` (accuracy, traceability) and `risk-manager` (residual risk, escalation).

## Default combinations

| Task type | Agents (read `.toml` for each) |
| --- | --- |
| New public page or route | `nextjs-developer` + `ui-designer` + `accessibility-tester` |
| Admin / RBAC change | `backend-developer` + `security-auditor` + `risk-manager` → **high-risk**: stop before merge |
| DB / migration | `postgres-pro` + `architect-reviewer` → **high-risk** |
| PR review | `reviewer` + `code-reviewer` + `security-auditor` (+ `gdpr-ccpa-compliance` if data paths change) |
| Message / knowledge content | `content-quality-editor` + `risk-manager` |
| UI bug with repro | `browser-debugger` + `ui-fixer` |
| Future AI feature | `policy-guardrail-designer` + `responsible-ai-reviewer` + `eval-engineer` → **high-risk** |

Detailed step-by-step flows: [workflows.md](workflows.md).

## Response convention

When this skill applies, briefly state which agent lens(es) you used, then deliver the work. Example:

> Lenses: `nextjs-developer`, `ui-designer`, `security-auditor` — implemented filter persistence; verified draft rows are not returned on public queries.

## Checks before done

- `npm run typecheck`, `npm run lint`, `npm run build` when code changed (per `AGENTS.md`)
- External links: `rel="noopener noreferrer"` with `target="_blank"`
- No secrets, `.env`, or BOA/Aiven references in commits
