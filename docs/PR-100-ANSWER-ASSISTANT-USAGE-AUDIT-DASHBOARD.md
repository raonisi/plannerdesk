# PR-100: Answer Assistant Usage Audit Admin Dashboard

**Branch:** `pr-100-answer-assistant-usage-audit-dashboard`  
**Route:** `/admin/answer-assistant/audit` (ADMIN-only, `noindex`)

## Purpose

관리자가 allowlist beta 운영 중 Answer Assistant **집계·차단 현황**을 점검합니다. 답변 기능 확장·공개가 아닌 **운영 관측성** PR입니다.

## Access

- `getAdminAccess()` — `super_admin` / `content_admin` only
- 비로그인·`GENERAL_USER`·`VERIFIED_PLANNER` 전용 dashboard 없음

## Displayed data (allowed)

| Category | Fields |
| --- | --- |
| Summary | total, success, blocked, rate limit, output safety, provider errors, prompt injection, admin tester |
| Breakdown | outcome, blockedReason, audience |
| Ops status | beta gate, allowlist count, beta status, audit/rate-limit backend |
| High-block users | truncated `userId` prefix, blocked count ≥ threshold |
| Recent events | timestamp, audience, outcome, blockedReason label, flags, truncated userId |

## Never displayed

- raw prompt / raw output / query text / draft text
- customer PII, medical info, contract numbers, file URLs, OCR
- full `userId` (truncated prefix only)
- allowlist raw env values
- CSV export (not implemented)

## Filters

- audience, outcome, blockedReason
- rateLimitBlocked, outputSafetyBlocked, providerError
- isAdminTester, createdFrom/createdTo, userIdPrefix
- pagination (20 per page)

## Modules

| Path | Role |
| --- | --- |
| `lib/answer-assistant/usage-audit-dashboard.ts` | Prisma aggregates + safe select |
| `app/admin/answer-assistant/audit/page.tsx` | Admin page |
| `components/admin/answer-assistant/UsageAuditDashboardView.tsx` | UI |

## Production note

`ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND=durable` (production default) required for rows to accumulate in `AnswerAssistantUsageAudit`.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm test
```
