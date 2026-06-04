# PR-137 — Answer Assistant 구조 분석

| 영역 | 위치 |
| --- | --- |
| planner actions | `app/planner/answer-assistant/actions.ts` |
| verified access | `lib/answer-assistant/verified-access.ts` |
| allowlist | `lib/answer-assistant/allowlist.ts` |
| feature gate | `lib/answer-assistant/feature-gate.ts` |
| input safety | `lib/answer-assistant/validation.ts` |
| output safety | `lib/answer-assistant/output-safety.ts` |
| generate | `lib/answer-assistant/generate-draft.ts` |
| usage audit | `usage-log.ts`, `usage-audit-durable.ts` |
| rate limit | `rate-limit.ts`, `rate-limit-config.ts`, `rate-limit-durable.ts` |
| retention | `retention-config.ts`, `retention-cleanup.ts` |
| UI | `components/answer-assistant/answer-assistant-panel.tsx` |
| admin | `app/admin/answer-assistant/*` |
| tests | `tests/answer-assistant/*` |

## PR137 미변경

- `allowlist.ts` 로직 (목록 자체)
- `rate-limit-config` 기본 한도
- Prisma schema
- Auth/RBAC
