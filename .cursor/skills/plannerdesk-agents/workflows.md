# PlannerDesk agent workflows

Read the matching Cursor skill `.cursor/skills/codex-<name>/SKILL.md` (or `.codex/agents/<name>.toml`) before deep work.

## Feature implementation

1. **Scope** — `risk-manager`: confirm task stays inside MVP and forbidden areas.
2. **Build** — `nextjs-developer` + `typescript-pro`: App Router boundary, server/client split, cache/visibility.
3. **UI** — `ui-designer`: calm B2B hierarchy; `ui-fixer` only for minimal patches.
4. **Data** — if Prisma touched: `postgres-pro`; optimize only when query issue proven.
5. **Ship** — `accessibility-tester` spot-check; `security-auditor` if auth or public data paths change.

## PR review (parallel mental pass)

| Agent | Question |
| --- | --- |
| `reviewer` | Correctness, missing tests, regressions? |
| `code-reviewer` | Style, maintainability, obvious bugs? |
| `security-auditor` | AuthZ, injection, secrets, draft leakage? |
| `gdpr-ccpa-compliance` | New PII collection/storage/logging? |
| `architect-reviewer` | Fits simple app-router structure? |

Output: findings with file paths, severity, suggested fix.

## High-risk gate (stop — do not merge)

From `AGENTS.md`: migrations, auth, RBAC, admin roles, uploads, medical/sensitive data, secrets, BOA/Aiven, legal policy.

Use `risk-manager` to report: risk, decision needed, safer alternative, next step.

## Content & templates

1. `content-quality-editor` — clear, professional Korean copy; no hype.
2. `risk-manager` — no payout/medical/legal advice; disclaimers where needed.
3. `fintech-engineer` — prefer official insurer sources; note verification status.

## Future AI answer assist

1. `policy-guardrail-designer` — tool/prompt boundaries.
2. `responsible-ai-reviewer` — misuse, fairness, transparency.
3. `eval-engineer` + `hallucination-investigator` — regression suite for forbidden answers.

Only answers grounded in verified knowledge archive; show sources; block prohibited domains from product spec.

## Browser / smoke

1. `browser-debugger` — reproduce on `/directory`, `/claim-documents`, etc.
2. `test-automator` — extend `npm run smoke:public` when routes change.
3. `docs-researcher` — verify framework API claims before relying on memory.
