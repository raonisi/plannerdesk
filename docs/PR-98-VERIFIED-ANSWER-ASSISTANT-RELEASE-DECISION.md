# PR-98 Verified Answer Assistant Release Decision

## 1. 목적

PR-98의 목적은 verified-only 답변 보조 기능을 **즉시 전체 공개**하는 것이 아니라, **제한 공개 가능 여부를 운영 기준으로 판단**하고 **조건부 활성화 구조를 확정**하는 것이다.

### 목적 (Yes)

- verified-only 답변 보조 기능 활성화 가능 여부 판단
- feature gate 활성화 조건 정리 (`ANSWER_ASSISTANT_VERIFIED_PREVIEW`)
- allowlist 기반 제한 공개 기준 정리 (`ANSWER_ASSISTANT_VERIFIED_ALLOWLIST`)
- rate limit·usage log·Safety Gate 검증
- 운영자용 Go / No-Go 기준 확정
- 실제 공개 이후 rollback 기준 확정

### 목적이 아닌 것 (No)

- public chatbot 오픈
- GENERAL_USER / 비로그인 답변 기능
- 고객·이메일·카카오톡 자동 발송
- 커뮤니티 자동 댓글 / Q&A 자동 답변
- 보험금 판단 / 의료 해석 / 손해사정 / 상품 추천 자동화
- schema migration / provider secret 추가

---

## 2. PR-98 최종 판단 (Executive Summary)

| 항목 | 판단 |
| --- | --- |
| **전체 VERIFIED_PLANNER 공개** | **No-Go** |
| **allowlist 극소수 파일럿** | **조건부 Go** (gate ON + allowlist + sign-off) |
| **ADMIN 내부 유지** | **Go** (기존 `/admin/answer-assistant` 영향 없음) |
| **GENERAL_USER / public** | **No-Go** (변경 없음) |

**No-Go 근거 (핵심):**

1. **persistent rate limit store 부재** — in-memory only (PR-99 분리)
2. **persistent usage audit 부재** — in-process buffer only
3. **allowlist 미설정 시** verified planner 초안 생성 불가 (의도된 안전 기본값)
4. **provider 미구성** — LLM 실연동 전 초안 생성 불가

---

## 3. 항목별 검증 결과

| # | 항목 | 결과 | 근거 |
| --- | --- | --- | --- |
| 1 | PR-97-B feature gate 기본 OFF | **PASS** | `ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT = false`, env unset → OFF |
| 2 | verified route shell | **PASS** | `/planner/answer-assistant`, noindex |
| 3 | server action feature gate 차단 | **PASS** | `actions.ts` gate before generation |
| 4 | VERIFIED_PLANNER 권한 확인 | **PASS** | `verified-access.ts` + approved verification |
| 5 | SUSPENDED 차단 | **PASS** | blocking status + `suspendedAt` |
| 6 | REJECTED 차단 | **PASS** | blocking status |
| 7 | EXPIRED 차단 | **PASS** | blocking status |
| 8 | DELETED 차단 | **PASS** | blocking status + `deletedAt` |
| 9 | GENERAL_USER 차단 | **PASS** | role !== verified_planner |
| 10 | PENDING_PLANNER 차단 | **PASS** | pending / under_review |
| 11 | rate limit | **PARTIAL** | 3/분, 20/일, abuse cooldown — in-memory |
| 12 | persistent rate limit store | **FAIL** | `isVerifiedAnswerAssistantRateLimitDurable() === false` |
| 13 | usage log 최소화 | **PASS** | metadata only, no prompt/draft/raw |
| 14 | raw prompt 저장 금지 | **PASS** | usage log schema excludes query |
| 15 | raw output 저장 금지 | **PASS** | usage log schema excludes draft/raw |
| 16 | Safety Gate | **PASS** | PR-97-A tests 37+ blocked cases |
| 17 | Prompt Injection | **PASS** | expanded keywords + abuse cooldown |
| 18 | Retrieval whitelist | **PASS** | public WHERE + select whitelist |
| 19 | MessageTemplate safeCopy | **PASS** | retrieval uses safeCopy only |
| 20 | adminMemo 제외 | **PASS** | retrieval policy tests |
| 21 | CorrectionRequest 제외 | **PASS** | RETRIEVAL_EXCLUDED_DOMAINS |
| 22 | Output Safety Scan | **PASS** | 19+ blocked phrases |
| 23 | provider safety | **PARTIAL** | stub only, PROVIDER_NOT_CONFIGURED |
| 24 | UI 고지 | **PASS** | VERIFIED_ANSWER_ASSIST_PAGE_NOTICES 4종 |
| 25 | 자동 발송 부재 | **PASS** | UI + auth tests |
| 26 | 자동 게시 부재 | **PASS** | UI tests |
| 27 | 커뮤니티 자동 댓글 부재 | **PASS** | UI tests |
| 28 | file/OCR 부재 | **PASS** | UI + scope |
| 29 | vector/embedding 부재 | **PASS** | scope |
| 30 | schema/migration 부재 | **PASS** | no migration in PR-98 |

**판단 규칙 적용:** 핵심 항목 중 **persistent rate limit = FAIL** → **전체 제한 공개 No-Go**. allowlist 파일럿만 조건부 검토.

---

## 4. Feature Gate 활성화 정책

### 4.1 기본값

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| `ANSWER_ASSISTANT_VERIFIED_PREVIEW` | **unset → OFF** | public boolean, secret 아님 |
| 코드 상수 | `false` | env 미설정 시 절대 ON 되지 않음 |

**금지:**

- 코드 상수 `true` 고정
- production 기본 ON
- env 미설정 시 ON
- gate 없이 route/action 동작

**허용:**

- `ANSWER_ASSISTANT_VERIFIED_PREVIEW=true` 명시적 설정 + 운영 sign-off
- allowlist 충족 시에만 verified planner 사용
- ADMIN 테스트 (`ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST`) — gate ON 시 UX 검증용

### 4.2 Gate 처리 순서 (verified server action)

1. 로그인 확인
2. feature gate 확인
3. allowlist 확인
4. `PlannerVerification.status = approved` 확인
5. SUSPENDED / REJECTED / EXPIRED / DELETED 차단
6. rate limit 확인 (분/일/abuse cooldown)
7. Safety Gate
8. Retrieval whitelist
9. insufficientEvidence 확인
10. provider configured 확인
11. 초안 생성
12. Output Safety Scan
13. 최소 usage log
14. 결과 반환

**provider 호출 없음 조건:** gate OFF, allowlist 미포함, 권한 실패, rate limit, Safety Gate, insufficient evidence, output safety 차단.

---

## 5. Allowlist 기반 제한 공개

### 5.1 정책

- 초기 공개는 **allowlist 기반** — 전체 verified planner 일괄 공개 아님
- `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST` — comma-separated **User.id** only
- allowlist raw 값 **client 노출 금지**
- 이메일·전화번호 등 PII allowlist 저장 금지

### 5.2 allowlist 없을 때

| 동작 | |
| --- | --- |
| route | shell + 고지 표시 |
| form | 비활성 |
| server action | `NOT_ALLOWLISTED` 차단 |
| provider | 호출 없음 |
| UI | "현재 제한 공개 대상이 아닙니다." |

ADMIN tester는 allowlist bypass (gate ON + admin test policy).

---

## 6. Rate Limit 최종 조건

| 한도 | 값 |
| --- | --- |
| 분당 | 3회 |
| 일일 | 20회 |
| Safety Gate 차단 누적 | 5회 → 24h cooldown |
| Prompt Injection 누적 | 3회 → 24h cooldown |

| Store | PR-98 상태 | Production 판단 |
| --- | --- | --- |
| in-memory | ✅ 구현 | dev/staging·allowlist 파일럿만 |
| durable (Redis/DB) | ❌ 미구현 | **전체 공개 No-Go** → PR-99 |

---

## 7. Usage Log 최소화

### 저장 금지 (유지)

raw prompt, raw output, 고객/계약/의료/청구 정보, file/OCR, provider raw response

### 저장 가능 (최소 메타데이터)

userId, requestPurpose, blockedReason, candidateCount, evidenceSourceIds, outputSafetyBlocked, providerConfigured, providerErrorCode, rateLimitBlocked, timestamp

**리스크:** persistent audit 없음 → allowlist 파일럿만 권장 (PR-99).

---

## 8. Verified UI 고지 (재확인)

`VERIFIED_ANSWER_ASSIST_PAGE_NOTICES` — PR-96 §4.4 4종:

1. 검증 설계사 업무 참고용 초안 보조
2. 보험금·손해사정·의료·상품 추천 미제공
3. 개인정보·의료정보·청구자료 입력 금지
4. 고객 발송 전 공식 기준 확인 필요

복사 버튼 없음. 자동 발송·게시·댓글 UI 없음.

---

## 9. 운영자 활성화 체크리스트

활성화 전 **전부** 확인:

- [ ] PR-95/97-A/97-B-QA sign-off 완료
- [ ] 법무·운영·보안 sign-off
- [ ] `ANSWER_ASSISTANT_VERIFIED_PREVIEW=true` Railway/운영 env에만 설정 (로컬 기본 OFF)
- [ ] `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST`에 파일럿 userId만 등록
- [ ] allowlist에 PII 없음 (userId only)
- [ ] GENERAL_USER / public route 미추가 확인
- [ ] 자동 발송·게시·댓글 UI 부재 확인
- [ ] provider 정책 확인 (미구성 시 PROVIDER_NOT_CONFIGURED)
- [ ] rollback: env `false` + allowlist 비우기 → 즉시 차단
- [ ] PR-99 durable rate limit / audit 일정 확정

---

## 10. Rollback 기준

즉시 rollback (env OFF):

- Output Safety 대량 차단
- Prompt Injection abuse 급증
- provider 오류율 급증
- 운영·법무 이슈
- allowlist 오설정

Rollback 절차:

1. `ANSWER_ASSISTANT_VERIFIED_PREVIEW=false`
2. `ANSWER_ASSISTANT_VERIFIED_ALLOWLIST` 비우기 (optional)
3. redeploy / env reload
4. verified route → 준비 중 / NOT_ALLOWLISTED 안내

---

## 11. Go / No-Go 최종 결정

| 범위 | PR-98 결정 |
| --- | --- |
| ADMIN 내부 | **Go** |
| VERIFIED 전체 공개 | **No-Go** |
| VERIFIED allowlist 파일럿 | **조건부 Go** |
| GENERAL_USER | **No-Go** |
| public chatbot | **No-Go** |

---

## 12. 후속 PR

| PR | 내용 |
| --- | --- |
| PR-99 | durable rate limit + persistent usage audit |
| PR-98-QA | gate ON + allowlist E2E, operator runbook |
| PR-100 | provider 실연동 + output safety 회귀 (별도 보안 PR) |
| PR-101 | allowlist 확대 / 전체 verified 검토 (durable store + audit 후) |

---

## 13. 변경 파일 (PR-98)

| 파일 | 변경 |
| --- | --- |
| `lib/answer-assistant/feature-gate.ts` | env 기반 gate, 코드 default OFF |
| `lib/answer-assistant/allowlist.ts` | **신규** — allowlist env |
| `lib/answer-assistant/release-readiness.ts` | **신규** — No-Go 판단 헬퍼 |
| `lib/answer-assistant/rate-limit.ts` | 3/분, abuse cooldown |
| `lib/answer-assistant/usage-log.ts` | requestPurpose 등 메타 확장 |
| `lib/answer-assistant/verified-access.ts` | allowlist 상태 |
| `app/planner/answer-assistant/actions.ts` | gate 순서 + abuse log |
| `app/planner/answer-assistant/page.tsx` | not_allowlisted UI |
| `.env.example` | placeholder config |
| `tests/answer-assistant/release-decision.test.ts` | **신규** |

---

## 14. 검증 명령어

```bash
npx prisma format
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run build
npm run test
```
