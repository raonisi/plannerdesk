# PR-162 — 구조 분석

## 제보 관련 코드 (참조만, DB 미접근)

| 영역 | 경로 |
| --- | --- |
| public visibility | `lib/public/visibility.ts` |
| auth | `lib/auth/` |
| AA route | `app/planner/answer-assistant/` |
| AA usage audit | `lib/answer-assistant/usage-log.ts` |
| AA feedback validation | `lib/answer-assistant/beta-feedback-validation.ts` |
| public search | `lib/search/public.ts` |
| admin search | `lib/search/admin.ts` |

## SSOT · UI · Test

- SSOT: `lib/ops/user-support-inbox-plan.ts`
- Panel: `AdminUserSupportInboxPlanPanel`
- Test: `tests/ops/pr162-user-support-inbox-plan.test.ts`

## PR158 연계

PR158 `FEEDBACK_LOOP_CHECKLIST`의 `inbox` 항목(pending) → PR162-A에서 운영 계획 충족, 실제 채널은 후속

## 영향 없음

schema · migration · inbox UI · webhook · email/SMS · role · allowlist · provider
