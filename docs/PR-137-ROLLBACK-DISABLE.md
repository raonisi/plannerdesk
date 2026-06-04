# PR-137 — Rollback / Disable 기준

코드 상수: `lib/answer-assistant/rollback-disable.ts`

| 상황 | 처리 |
| --- | --- |
| allowlist 우회 | gate OFF · allowlist 재확인 |
| verified 우회 | 배포 보류 · `verified-access.ts` |
| output safety 우회 | 생성 중단 · 긴급 수정 |
| audit 원문 저장 | 즉시 중단 · persist 점검 |
| rate limit 우회 | 확대 보류 |
| retention cleanup 실패 | 수동 cleanup |
| public 실행 동선 | rollback |

## Disable (운영자)

- `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=false`
- allowlist 비움 (생성 불가)

**금지:** 코드에서 gate 기본값을 true로 변경.
