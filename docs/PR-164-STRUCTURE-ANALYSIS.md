# PR-164 — Answer Assistant 구조 분석

| 영역 | 경로 |
| --- | --- |
| route/action | `app/planner/answer-assistant/` · `actions.ts` |
| access guard | `lib/answer-assistant/verified-access.ts` |
| output safety | `lib/answer-assistant/output-safety.ts` |
| input validation | `lib/answer-assistant/validation.ts` |
| usage audit | `lib/answer-assistant/usage-log.ts` |
| rate limit | `lib/answer-assistant/rate-limit-config.ts` |
| retention | `lib/answer-assistant/retention-config.ts` |
| disable | `lib/answer-assistant/rollback-disable.ts` |
| 테스트 | `tests/answer-assistant/*` · `tests/ops/pr164-*` |

**verified planner + allowlist** 유지. provider는 stub. prompt/response 원문 저장 구조 없음.
