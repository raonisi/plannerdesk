# PlannerDesk Operating Rules

PlannerDesk is a public B2B SaaS platform for Korean insurance planners. It is completely separate from BOA CRM and must not reuse BOA CRM infrastructure, databases, customer data, or product assumptions.

## Product Boundary

Current MVP includes:

- Public landing page
- Placeholder insurer directory
- Placeholder claim document library
- Placeholder customer message templates
- Placeholder future verified planner community
- Placeholder future AI tools

Current MVP excludes:

- Community implementation
- Billing or subscriptions
- Customer medical document upload
- Claim payout judgment
- Claim amount estimation
- Loss-adjusting workflow
- Real file upload
- Real database schema migration

## Data And Privacy Rules

- Do not connect to Aiven.
- Do not connect to the BOA CRM database.
- Do not use BOA CRM customer data.
- Do not hardcode credentials, tokens, connection strings, or secrets.
- Do not commit `.env` files.
- Keep `.env.example` limited to placeholder values.
- Do not require `DATABASE_URL` for the initial public build.
- Neon PostgreSQL may be introduced later through a separate, reviewed change.

## Engineering Rules

- Use TypeScript for application code.
- Prefer simple app-router Next.js structure until product needs justify more layers.
- Keep the landing experience premium, calm, mobile-first, and professional.
- Avoid patterns that make the product feel like an insurance link farm or sales flyer.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before release changes.

## Specialist Agents (Codex + Cursor)

Project-specific subagents live in `.codex/agents/` (from [awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents)).

- **Codex**: does not auto-spawn them; delegate explicitly in the prompt.
- **Cursor**: use `.cursor/skills/plannerdesk-agents/` to pick lenses, then apply matching `.cursor/skills/codex-<name>/` skills (38 agents; sync via `node scripts/codex-agents-to-cursor-skills.mjs`).

| Workstream | Agents |
| --- | --- |
| App routes, RSC, server actions | `nextjs-developer`, `react-specialist`, `typescript-pro`, `frontend-developer` |
| Premium B2B UI (not link-farm tone) | `ui-designer`, `ui-fixer`, `frontend-developer` |
| Prisma / PostgreSQL / admin data | `postgres-pro`, `database-optimizer`, `backend-developer`, `api-designer` |
| PR review and architecture | `reviewer`, `code-reviewer`, `architect-reviewer`, `security-auditor` |
| Privacy, RBAC, draft exposure | `gdpr-ccpa-compliance`, `security-auditor` |
| Insurance product boundaries | `fintech-engineer`, `risk-manager` |
| Templates, knowledge copy, docs | `content-quality-editor`, `technical-writer`, `documentation-engineer` |
| Future AI answer assist (stage 5+) | `policy-guardrail-designer`, `responsible-ai-reviewer`, `eval-engineer`, `hallucination-investigator` |
| Tests and route smoke | `test-automator`, `browser-debugger`, `accessibility-tester` |
| Framework API verification | `docs-researcher` |
| Branching and small PRs | `git-workflow-manager` |

Example delegation:

```text
Review this PR in parallel: reviewer for correctness/regressions, security-auditor for RBAC and draft leakage, gdpr-ccpa-compliance for PII handling. Summarize with file references.
```

```text
Implement /directory filter UX: nextjs-developer owns routing/data boundaries, ui-designer keeps premium B2B SaaS tone, accessibility-tester checks keyboard and contrast.
```

## Codex Git Workflow

For PR-scoped PlannerDesk tasks, Codex should handle the full low-risk Git workflow unless the user asks otherwise.

Default workflow:

- Start from the latest `main`.
- Create a feature branch for every PR-scoped task.
- Use clear branch names that describe the scope.
- Implement only the requested scope.
- Run available checks before commit, including `npm run typecheck`, `npm run lint`, and `npm run build` when available.
- Commit with a clear message.
- Push the branch to GitHub.
- Open a pull request into `main`.
- Include `Summary`, `Changed files`, `Tests`, `Risk level`, `Security/privacy impact`, `User-facing changes`, `Admin-facing changes`, and `Follow-up` in the PR body.
- Codex may merge low-risk PRs after checks pass.
- Codex must not auto-merge high-risk work.

High-risk work includes:

- Database migrations
- Auth changes
- RBAC changes
- Admin role changes
- Billing or payment changes
- File upload
- Customer medical data
- Sensitive data processing
- Secrets, environment variables, or API keys
- BOA CRM connection
- Aiven connection
- Destructive changes
- Production data access
- Legal, privacy, terms, or refund policy decisions

For high-risk work, do not merge. Stop and report:

- Risk
- Required decision
- Safer alternative
- Recommended next step

## Stop Conditions

Stop and report before continuing if a task requires:

- Production secrets
- Railway credentials
- Neon credentials
- Database migrations
- BOA CRM access
- Customer sensitive data
