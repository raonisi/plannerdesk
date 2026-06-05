# PR-148 — 구조 분석

## 기존 (유지)

| 영역 | 경로 |
| --- | --- |
| route | `app/planner/answer-assistant/` |
| access | `verified-access.ts`, `allowlist.ts`, `feature-gate.ts` |
| safety | `output-safety.ts`, `validation.ts` |
| audit | `usage-log.ts`, `usage-audit-durable.ts` |
| limit | `rate-limit.ts`, `rate-limit-durable.ts` |
| retention | `retention-config.ts`, `retention-cleanup.ts` |
| disable | `rollback-disable.ts` |
| tests | `tests/answer-assistant/*` |
| prior ops | PR-126, PR-137 |

## PR148 추가

- `lib/ops/ai-limited-beta-policy.ts`
- `AdminAiLimitedBetaPolicyPanel`
- docs/PR-148-*

## 미변경

- Prisma schema · allowlist env · Auth · provider
