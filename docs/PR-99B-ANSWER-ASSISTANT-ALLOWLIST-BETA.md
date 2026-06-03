# PR-99-B: Allowlist Beta 운영 (Verified Answer Assistant)

**Branch:** `pr-99b-answer-assistant-allowlist-beta`  
**Scope:** allowlist에 포함된 극소수 `VERIFIED_PLANNER`만 대상으로 beta 운영 통제. 전체 검증 설계사 공개·`GENERAL_USER` 공개·public chatbot·자동 발송·자동 게시 아님.

## Activation policy

Beta가 **실제로 동작**하려면 아래를 **모두** 만족해야 한다.

| # | Condition |
| --- | --- |
| 1 | `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=true` (또는 legacy `ANSWER_ASSISTANT_VERIFIED_PREVIEW=true`) |
| 2 | `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST`에 1개 이상 `User.id` |
| 3 | 로그인 |
| 4 | `User.role = verified_planner`, `status = active` |
| 5 | `PlannerVerification.status = approved`, `deletedAt = null`, `suspendedAt = null` |
| 6 | allowlist에 해당 `userId` 포함 (관리자 테스트는 allowlist 없이 가능 — gate+allowlist 설정 시) |
| 7 | durable rate limit 통과 (production) |
| 8 | Safety Gate → Prompt Injection → Retrieval whitelist → Output Safety (provider 호출 전) |

**금지:** gate ON + allowlist 비어 있음 → `beta_not_configured`, provider 호출 없음.

**코드 기본값:** `ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT = false` (env unset → OFF).

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED` | unset → **false** | Primary beta flag |
| `ANSWER_ASSISTANT_VERIFIED_PREVIEW` | unset → **false** | Legacy; allowlist still required |
| `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST` | unset → empty | Comma-separated `User.id` only |

## Rollback (즉시 중단)

1. `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=false`
2. `ANSWER_ASSISTANT_VERIFIED_PREVIEW=false`
3. `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST` 비우기 또는 파일럿 ID 제거
4. 재배포 / env reload
5. `/planner/answer-assistant` — 생성 비활성·`FEATURE_DISABLED` 응답 확인

코드 상수: `ALLOWLIST_BETA_ROLLBACK_STEPS` (`lib/answer-assistant/allowlist-beta.ts`).

## Operator checklist

`ALLOWLIST_BETA_OPERATOR_CHECKLIST` (`lib/answer-assistant/allowlist-beta.ts`) — PR-99-A-QA sign-off, durable backends, allowlist-only pilot, forbidden-feature absence, monitoring.

## Rollback triggers (문서화)

- Output Safety / Prompt Injection 차단 급증
- rate limit abuse cooldown 다수
- provider 오류 연속 (`PROVIDER_ERROR`)
- 운영자 sign-off 없는 gate ON
- allowlist 외 접근 시도 로그 이상

## Forbidden (재검증)

- 전체 `VERIFIED_PLANNER` 공개
- `GENERAL_USER` / 비로그인 / public answer route
- 고객·카카오·이메일 자동 발송, 커뮤니티 자동 댓글, 자동 게시·저장
- raw prompt/output 저장, 파일·OCR·vector·보험금/손해사정/의료 해석

## Key modules

| Module | Role |
| --- | --- |
| `lib/answer-assistant/feature-gate.ts` | Beta/preview env; effective gate requires allowlist |
| `lib/answer-assistant/allowlist-beta.ts` | Operational status, rollback, operator checklist |
| `lib/answer-assistant/verified-access.ts` | RBAC + allowlist + `beta_not_configured` |
| `app/planner/answer-assistant/actions.ts` | Gate order before provider |
| `components/answer-assistant/answer-assistant-panel.tsx` | Beta user notice banner |

## Tests

```bash
npm run typecheck
npm run lint
npm run build
node --import tsx --test tests/answer-assistant/**/*.test.ts
```
