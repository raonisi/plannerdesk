# PR-148 — Rate Limit · Retention

## Rate limit

- `rate-limit-config.ts` — `VERIFIED_ANSWER_ASSIST_RATE_LIMIT`
- durable: `AnswerAssistantRateLimitState` (schema)
- abuse · allowlist 밖 · public 시도 차단

**PR148은 limit 완화·로직 무단 변경 없음.**

## Retention

- `retention-config.ts` — 기본 usage audit 180일 등
- `retention-cleanup.ts` — 운영자 cleanup (metadata counts)
- 원문 payload cleanup 대상 아님 (저장 자체 없음)

장기 보관·법무 기준 — **미확정 (정보 gap)**.
