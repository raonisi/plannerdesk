# PR-148 — Usage Audit (metadata-only)

## 원칙

- `usage-log.ts`: request/draft/rawOutput/rawPrompt **저장 안 함**
- `AnswerAssistantUsageAudit` schema: metadata 필드만 (PR-99-A)
- `FORBIDDEN_USAGE_AUDIT_FIELDS` — persist 시 금지 필드 목록

## 저장 가능

userId, audience, outcome, blockedReason, candidateCount, evidenceSourceIds, outputSafetyBlocked, rateLimitBlocked, isAdminTester, timestamps.

## public

usage audit dashboard — **admin only**, public 미노출.

schema 변경 필요 시 **중단** → 별도 Critical PR.
