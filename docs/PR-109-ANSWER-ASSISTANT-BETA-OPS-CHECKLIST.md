# PR-109 — Answer Assistant Beta 운영 체크리스트

**목적:** 베타 **확대 PR이 아님**. allowlist 기반 제한 운영·rollback·retention·audit·rate limit·output safety를 운영자가 수동으로 점검할 기준을 한 문서로 통합한다.

**금지 (본 PR):** 실제 allowlist 변경, 운영 DB 조회/수정, gate 자동 ON, 베타 대상 자동 확대, `package.json` 변경.

**관련 코드·문서:** `lib/answer-assistant/*`, `app/planner/answer-assistant/actions.ts`, `tests/answer-assistant/*`, `docs/PR-99B-*`, `docs/PR-103-*`, `docs/PR-104C-*`, `docs/PR-102-*`, `docs/PR-92-*`, `docs/PR-99A-*`, **[PR-126-ANSWER-ASSISTANT-BETA-OPS.md](./PR-126-ANSWER-ASSISTANT-BETA-OPS.md)** (베타 관찰 리포트).

---

## Answer Assistant Beta 운영 체크리스트 (필수 항목)

### 접근 제한

| 확인 항목 | 기준 | 코드/검증 |
| --- | --- | --- |
| verified planner만 | `User.role = verified_planner`, `status = active`, `PlannerVerification` approved·미정지 | `lib/answer-assistant/verified-access.ts` |
| allowlist만 생성 가능 | `isUserOnVerifiedAnswerAssistantAllowlist(userId)` | `lib/answer-assistant/allowlist.ts` |
| gate 기본 OFF | env unset → `ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT = false` | `feature-gate.ts` |
| gate ON + 빈 allowlist | `beta_not_configured`, provider 미호출 | `allowlist-beta.ts`, planner `actions.ts` |
| allowlist 자동 확대 금지 | PR-104-C plan only, env 수동 변경만 | `allowlist-expansion-plan.ts` 주석·`rollbackTriggers` |
| 신규 대상 추가 | 운영자가 `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST`에 userId **수동** 추가 후 재배포 | — |
| 서버 권한 | UI가 아닌 `getVerifiedAnswerAssistantAccess` → action 단계 차단 | `app/planner/answer-assistant/actions.ts` |
| 비관리자 public route 없음 | `/answer-assistant` public 경로 없음 | `tests/answer-assistant/allowlist-beta.test.ts` |

**수동 확인:** allowlist에 없는 verified planner → `NOT_ALLOWLISTED`. 비 verified → `denied`.

### 사용량 제한

| 확인 항목 | 기준 | 코드/검증 |
| --- | --- | --- |
| rate limit 존재 | 분당·일당·abuse cooldown | `rate-limit-config.ts` (기본 3/분, 20/일) |
| production backend | `ANSWER_ASSISTANT_RATE_LIMIT_BACKEND=durable` 권장 | `rate-limit-config.ts` |
| 초과 시 | `RATE_LIMIT_EXCEEDED` + retry 메시지, usage audit `rateLimitBlocked` | planner `actions.ts` |
| abuse | blocked/promptInjection/providerError 일일 한도 초과 시 cooldown | `rate-limit.ts`, `durable-rate-limit-audit.test.ts` |

**수동 확인:** 동일 userId 연속 요청 시 분당 차단 메시지 표시.

### 출력 안전

| 확인 항목 | 기준 | 코드/검증 |
| --- | --- | --- |
| 입력 Safety Gate | 금지 질문·목적 차단 | `validation.ts`, `safety-gate.test.ts` |
| 출력 스캔 | 지급 단정·의료·손해사정·과장 권유·PII 패턴 | `output-safety.ts`, `output-safety.test.ts` |
| 파이프라인 순서 | access → rate limit → `generateInternalAnswerDraft` (gate·retrieval·output) | `generate-draft.ts`, planner `actions.ts` |
| 고객 발송 UI 없음 | 카카오·이메일·자동 게시 패턴 부재 | `auth-and-forbidden-features.test.ts` |

### 감사 로그 (metadata-only)

| 확인 항목 | 기준 | 코드/검증 |
| --- | --- | --- |
| 기록 필드 | userId, outcome, blockedReason, evidenceSourceIds, flags | `usage-log.ts` |
| 금지 필드 | query, draft, rawOutput, phone, email 등 | `FORBIDDEN_USAGE_AUDIT_FIELDS` |
| production backend | `ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND=durable` | `rate-limit-config.ts` |
| 운영자 뷰 | `/admin/answer-assistant/audit` (집계·대시보드) | `usage-audit-dashboard.ts` |

**수동 확인:** audit row에 질문/초안 원문이 없음.

### 보존/삭제 (retention cleanup)

| 확인 항목 | 기준 | 코드/검증 |
| --- | --- | --- |
| 기본 보존 | usage audit 180일, feedback 365일, critical 730일 | `retention-config.ts` |
| 실행 스위치 | `ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED` 기본 **false** | `retention-config.ts` |
| 운영 UI | `/admin/answer-assistant/cleanup` preview → confirm phrase | `PR-102`, `ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE` |
| 실패 시 | cleanup 로그·overdue 플래그 → beta decision `PAUSE` 후보 | `beta-expansion-decision.ts`, `retention-cleanup.test.ts` |

**수동 확인:** preview만 실행 후 candidate count 확인; execute는 운영 승인 후.

### rollback (즉시 중단)

| 조건 | 조치 |
| --- | --- |
| Output Safety / Prompt Injection 급증 | `ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=false`, allowlist 비우기, 재배포 |
| rate limit abuse 다수 | 동일 + abuse userId 검토 |
| provider 연속 오류 | gate OFF + provider 설정 점검 |
| sign-off 없는 gate ON | 즉시 OFF |
| allowlist 외 접근 로그 이상 | OFF + allowlist 감사 |

**절차 (코드 상수):** `ALLOWLIST_BETA_ROLLBACK_STEPS` (`allowlist-beta.ts`).

**사용자 안내:** `FEATURE_DISABLED`, `BETA_NOT_CONFIGURED`, `NOT_ALLOWLISTED` 메시지 (`constants.ts`).

**복구 전:** PR-99-A-QA·Antigravity 재검수, metrics 정상화, allowlist 재등록은 **수동 승인**만.

### 베타 확대 판단 (수동만)

| 구분 | 기준 |
| --- | --- |
| **확대 금지** | `EXPANSION_BLOCKED`, `PAUSE_AND_FIX_REQUIRED`, critical feedback, cleanup overdue, output safety miss 급증 |
| **제한 확대만** | PR-103 `LIMITED_EXPANSION_CANDIDATE` + PR-104-C wave plan — **env allowlist 수동 반영**, 코드 자동 apply 없음 |
| **확대 전 필수** | `evaluateAllowlistBetaLaunchReadiness().ready`, durable rate limit/audit, 99-A sign-off |
| **승인자** | super_admin 운영자 (allowlist·env 변경 권한 보유자) |
| **확대 후 모니터링** | usage audit dashboard, beta feedback review, expansion plan monitoring checklist |

**자동화 금지 확인:** `beta-expansion-decision.ts` · `allowlist-expansion-plan.ts` 헤더 주석, 테스트 `beta-ops-checklist.test.ts`.

---

## 운영자 수동 점검 순서 (권장)

1. env: beta OFF인지 확인 → 필요 시만 ON + allowlist pilot IDs  
2. `npm run test` (answer-assistant 162건) + PR109 보조 테스트  
3. 스테이징: allowlist 내/외 verified planner 각 1회 생성 시도  
4. audit dashboard: metadata-only, forbidden field 없음  
5. cleanup: preview counts, execute는 승인 후  
6. beta-decision / expansion-plan admin 페이지: **권고만** 확인, allowlist 자동 변경 없음  
7. rollback 절차 문서 공유 (`ALLOWLIST_BETA_ROLLBACK_STEPS`)

---

## 구조 참조 (PR109 분석)

| 영역 | 경로 |
| --- | --- |
| Planner action | `app/planner/answer-assistant/actions.ts` |
| Allowlist / beta | `allowlist.ts`, `allowlist-beta.ts`, `feature-gate.ts` |
| Verified access | `verified-access.ts` |
| Rate limit | `rate-limit.ts`, `rate-limit-durable.ts` |
| Usage audit | `usage-log.ts`, `usage-audit-durable.ts` |
| Output safety | `output-safety.ts` |
| Retention | `retention-cleanup.ts`, `retention-config.ts` |
| Expansion (advisory) | `beta-expansion-decision.ts`, `allowlist-expansion-plan.ts` |
| Tests | `tests/answer-assistant/*.test.ts` (16 files) |

---

## Antigravity 검수 포인트

- allowlist 밖·비 verified 차단 (서버 action)  
- beta 자동 확대·allowlist auto-apply 코드 부재  
- rate limit / output safety / metadata-only audit 유지  
- retention execute 기본 OFF  
- rollback·pause 기준 문서화  
- **운영 DB·실제 allowlist 미변경** (본 PR)

## Codex 제한검수

기본 **생략** (Antigravity). allowlist·권한·output safety 코드 변경 시에만 제한검수 후보.

---

## 검증 명령

```bash
npm run lint
npm run typecheck
npm run test
npx tsx --test tests/answer-assistant/beta-ops-checklist.test.ts
npm run build
```

`npm run test`는 `tests/answer-assistant/*.test.ts` glob — `beta-ops-checklist.test.ts` 포함.
