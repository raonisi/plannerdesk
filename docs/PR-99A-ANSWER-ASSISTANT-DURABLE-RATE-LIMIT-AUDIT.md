# PR-99-A Answer Assistant Durable Rate Limit / Usage Audit

## 1. 목적

verified-only 답변 보조의 **운영 제한 장치**를 구현한다. 기능 공개·allowlist beta 시작·GENERAL_USER 공개는 이번 PR 범위가 아니다.

- durable rate limit (Prisma/PostgreSQL)
- 최소 usage audit (메타데이터만)
- raw prompt/output/민감정보 저장 금지 유지

## 2. Schema (additive migration)

| 모델 | 용도 |
| --- | --- |
| `AnswerAssistantRateLimitState` | userId별 분/일 카운터, abuse 카운터, cooldown |
| `AnswerAssistantUsageAudit` | outcome, blockedReason, purpose 등 최소 audit |

Migration: `20260603120000_add_answer_assistant_rate_limit_audit` — **DROP 없음**

## 3. Rate Limit 정책

| Config env | 기본값 |
| --- | --- |
| `ANSWER_ASSISTANT_RATE_LIMIT_PER_MINUTE` | 3 |
| `ANSWER_ASSISTANT_RATE_LIMIT_PER_DAY` | 20 |
| `ANSWER_ASSISTANT_BLOCKED_REQUEST_LIMIT_PER_DAY` | 5 |
| `ANSWER_ASSISTANT_PROMPT_INJECTION_LIMIT_PER_DAY` | 3 |
| `ANSWER_ASSISTANT_PROVIDER_ERROR_LIMIT_PER_DAY` | 5 |

Backend:

| Env | 값 |
| --- | --- |
| `ANSWER_ASSISTANT_RATE_LIMIT_BACKEND` | `durable` (default non-test) / `memory` |
| `ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND` | `durable` (default non-test) / `memory` |

`NODE_ENV=test` → memory (단위 테스트)

Non-production (dev/CI): **memory** default unless `ANSWER_ASSISTANT_*_BACKEND=durable`

Production (`NODE_ENV=production`): **durable** default

## 4. Gate 순서 (verified action)

provider 호출 전 rate limit 검증. 차단·injection·provider error 누적 시 24h cooldown.

## 5. Usage Audit 저장

**저장:** userId, audience, outcome, requestPurpose, blockedReason, candidateCount, evidenceSourceIds (id+type), outputSafetyBlocked, providerConfigured, providerErrorCode, rateLimitBlocked, isAdminTester, createdAt

**금지:** query, draft, rawPrompt, rawOutput, PII, medical, contract, file/OCR

## 6. Release Readiness (PR-98 연동)

Production (durable backend):

- `isVerifiedAnswerAssistantRateLimitDurable()` → **true**
- `isVerifiedAnswerAssistantUsageAuditPersistent()` → **true**

allowlist beta는 여전히 gate OFF + allowlist + sign-off 필요. **이번 PR은 beta 시작하지 않음.**

## 7. Rollback

- `ANSWER_ASSISTANT_RATE_LIMIT_BACKEND=memory` — in-memory fallback
- `ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND=memory` — audit DB write 중단
- schema rollback은 별도 reviewed migration 필요

## 8. 변경 파일

| 파일 | 내용 |
| --- | --- |
| `prisma/schema.prisma` | 2 models + enums |
| `prisma/migrations/20260603120000_*` | additive migration |
| `lib/answer-assistant/rate-limit-config.ts` | config + backend selection |
| `lib/answer-assistant/rate-limit-memory.ts` | in-memory backend |
| `lib/answer-assistant/rate-limit-durable.ts` | Prisma backend |
| `lib/answer-assistant/rate-limit.ts` | async facade |
| `lib/answer-assistant/usage-audit-durable.ts` | audit persist |
| `lib/answer-assistant/usage-log.ts` | durable audit integration |
| `lib/answer-assistant/release-readiness.ts` | durable detection |
| `app/planner/answer-assistant/actions.ts` | await rate limit + provider error |
| `tests/answer-assistant/durable-rate-limit-audit.test.ts` | **신규** |

## 9. 검증

```bash
npx prisma format
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run build
npm run test
```

## 10. 후속

- PR-99-B: admin audit 조회 UI (optional)
- PR-98-QA: durable backend E2E with real DB
- allowlist beta: gate ON + operator sign-off (별도 PR)
