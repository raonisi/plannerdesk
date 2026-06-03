# PR-97-B Answer Assistant VERIFIED_PLANNER 제한 공개 준비

## 1. 목적

PR-97-B는 답변 보조 기능을 **즉시 VERIFIED_PLANNER에게 공개하지 않고**, 제한 공개가 가능하도록 권한·feature gate·rate limit·usage log·UI 고지·자동 액션 금지 구조를 준비한다.

**기본값: 제한 공개 준비 완료, 실제 공개 비활성화 (`ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED = false`)**

## 2. Feature Gate

| 항목 | 내용 |
| --- | --- |
| 상수 | `ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED` (기본 `false`) |
| 헬퍼 | `isAnswerAssistantVerifiedPreviewEnabled()` |
| OFF 동작 | verified route 안내 화면, form 비활성, server action `FEATURE_DISABLED`, Retrieval/provider 미실행 |
| ON 동작 | VERIFIED_PLANNER(+ approved verification) 또는 ADMIN 테스트 접근 후 Safety Gate·Retrieval·Output Safety 재사용 |

ADMIN 테스트: `ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST = true` (gate ON 시에만)

## 3. Verified Route

| 항목 | 내용 |
| --- | --- |
| 경로 | `/planner/answer-assistant` |
| robots | `noindex, nofollow` |
| UI | `components/answer-assistant/answer-assistant-panel.tsx` (`variant="verified"`) |
| server action | `generateVerifiedAnswerAssistantDraftAction` |

## 4. 권한 검증

`lib/answer-assistant/verified-access.ts` — Community MVP와 동일 최소 기준:

- 로그인 필수
- `User.role = verified_planner` + `PlannerVerification.status = approved`
- `deletedAt = null`, `suspendedAt = null`
- 차단: `pending`, `under_review`, `rejected`, `suspended`, `expired`, `deleted`
- `User.status = active`
- GENERAL_USER / PENDING / 비검증 설계사 → denied
- UI + server action 양쪽 gate

## 5. Rate Limit (in-process 준비)

| 한도 | 값 |
| --- | --- |
| 분당 | 5 requests / user |
| 일일 | 20 requests / user |

`lib/answer-assistant/rate-limit.ts` — Redis/DB 전환은 후속 PR.

## 6. Usage Log (최소 메타데이터)

`lib/answer-assistant/usage-log.ts`

**저장 허용:** userId, audience, outcome, blockedReason enum, candidateCount, evidence source id+type, provider error enum, rateLimitHit, timestamp

**저장 금지:** 요청 원문, raw provider output, 생성 초안 본문

## 7. UI 고지 (PR-96 §4.4)

`VERIFIED_ANSWER_ASSIST_PAGE_NOTICES`:

1. 검증 설계사 업무 참고용 초안 보조
2. 보험금·손해사정·의료·상품 추천 미제공
3. 개인정보·의료정보·청구자료 입력 금지
4. 고객 발송 전 공식 기준 확인 필요

복사 버튼 없음. 자동 발송·자동 게시·커뮤니티 자동 댓글 없음.

## 8. Safety 재사용

PR-94/97-A Safety Gate, Retrieval whitelist, Output Safety Scan, Provider 정책을 `generateInternalAnswerDraft(..., { audience: "verified_planner" })`로 재사용.

## 9. 금지 기능 (변경 없음)

- GENERAL_USER / public chatbot / 비로그인 답변
- 자동 발송·게시·댓글·저장
- file upload / OCR / vector / embedding
- schema migration / provider secret 추가

## 10. Traffic Open 조건 (후속)

1. `ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED = true` (운영 sign-off)
2. PR-97-B-QA 수동·E2E PASS
3. rate limit Redis/DB 이전 (운영 인프라 검토)
4. 법무·운영 sign-off

## 변경 파일

| 영역 | 파일 |
| --- | --- |
| Feature gate | `lib/answer-assistant/feature-gate.ts` |
| Access | `lib/answer-assistant/verified-access.ts` |
| Rate limit | `lib/answer-assistant/rate-limit.ts` |
| Usage log | `lib/answer-assistant/usage-log.ts` |
| Draft / retrieval | `lib/answer-assistant/generate-draft.ts`, `retrieval.ts`, `types.ts`, `constants.ts`, `labels.ts` |
| UI | `components/answer-assistant/answer-assistant-panel.tsx`, `app/planner/answer-assistant/*` |
| Admin panel | `app/admin/answer-assistant/answer-assistant-panel.tsx` (thin wrapper) |
| Tests | `tests/answer-assistant/verified-prep.test.ts`, `auth-and-forbidden-features.test.ts` |

## 검증

```bash
npx prisma format
npx prisma validate
npx prisma generate
npm run typecheck
npm run lint
npm run build
npm run test
```
