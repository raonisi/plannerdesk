# PR-97-A Answer Assistant ADMIN 내부 유지 고도화

## 1. ADMIN 내부 유지 사유

PR-96 제한 공개 정책 재검토 결과, 답변 보조 기능은 **ADMIN 내부 초안 도구**로 계속 유지한다. VERIFIED_PLANNER·GENERAL_USER 공개, public chatbot, 자동 발송·게시는 이번 PR 범위 밖이며 구현하지 않는다.

관리자 검수 전 초안만 제공하며, 고객 발송·커뮤니티 자동 댓글·Q&A 자동 답변은 금지한다.

## 2. Safety Gate 개선 내용

- `blockedReason` 분류를 명확히 분리: `PERSONAL_INFO`, `CONTRACT_INFO`, `MEDICAL_INFO`, `CLAIM_DOCUMENT`, `CLAIM_JUDGMENT`, `LOSS_ADJUSTMENT`, `PRODUCT_SOLICITATION`, `FEAR_MARKETING`, `PROMPT_INJECTION`, `INSUFFICIENT_EVIDENCE`, `PROVIDER_NOT_CONFIGURED`, `PROVIDER_ERROR`, `OUTPUT_SAFETY_BLOCKED`
- 차단 시 재작성 방향을 제시하는 안내 문구로 개선
- Prompt Injection 키워드 확장: 안전정책 무시, 권한 우회, 내부 지시, 비공개 문서, 검수 전 문서 등

## 3. Retrieval 근거 표시 개선 내용

근거 카드에 다음 항목을 표시한다.

- 자료 유형, 제목, 출처명
- 공식 링크 여부
- `reviewedAt`, `lastVerifiedAt`, `updatedAt`
- 사용된 텍스트 요약 (`safeTextSummary`)
- 공식 확인 필요 여부

금지 표시: `adminMemo`, MessageTemplate `body`, `forbiddenClaims`, `complianceNote`, `reviewedById`, User 개인정보, CorrectionRequest, CommunityReport, `fileUrl`, `ocrText`

## 4. Output Safety Scan 강화 내용

초안 생성 후 아래 금지 표현이 포함되면 `OUTPUT_SAFETY_BLOCKED`로 차단한다.

- 보험금 판단: 지급됩니다, 받을 수 있습니다, 보장됩니다, 청구 가능합니다, 면책/부지급, 지급 가능성이 높습니다 등
- 의료 해석: 진단서상 가능합니다, 이 진단이면 해당됩니다 등
- 손해사정: 손해사정 결과가 맞습니다, 부지급이 타당합니다 등
- 상품 강권: 무조건/반드시 가입, 100% 보장, 확정 지급, 지금 안 하면 손해, 해지하면 큰일

차단 시 raw output은 client에 전달하지 않으며 저장하지 않는다.

## 5. Prompt Injection 방어 강화 내용

- 입력 차단 패턴 확장 (이전 지시 무시, 시스템 프롬프트 노출 요청, adminMemo, 비공개/검수 전 문서, 권한 우회 등)
- Retrieval `where` 조건은 서버에서 고정
- select whitelist 방식 유지
- 사용자 입력으로 도메인·필드 우회 불가

## 6. Provider 미구성·오류 처리 기준

### Provider 미구성

- Safety Gate·Retrieval까지는 실행 가능
- provider 미구성 시 초안 생성 중단, `PROVIDER_NOT_CONFIGURED` 반환
- rules-based draft 조립 제거 (PR-94 대비 변경)
- API key/env 임의 추가 없음

### Provider 오류

- `PROVIDER_ERROR` 반환
- stack trace·민감정보 client 노출 금지
- raw output 저장 금지
- 자동 재시도 없음

## 7. 관리자 검수 체크리스트

초안 성공 시 하단에 검수 체크리스트를 표시한다 (표시 전용, 복사 버튼 없음).

- 공식 약관 또는 보험사 안내 기준 확인
- 보험금 지급 가능성 단정 금지
- 의료정보 해석 금지
- 손해사정성 판단 금지
- 특정 상품 가입 강권 금지
- 고객 개인정보 미포함
- 출처 없는 사실 단정 없음
- 고객 발송 전 문구 재검토

## 8. 금지 기능 유지 목록

이번 PR에서도 다음은 구현하지 않는다.

- VERIFIED_PLANNER / GENERAL_USER 공개
- public chatbot / public answer route
- 커뮤니티 자동 댓글, Q&A 자동 답변
- 고객·이메일·카카오톡 자동 발송
- 답변 자동 게시·자동 저장
- 파일/이미지 업로드, OCR
- vector search, embedding
- 보험금 지급·손해사정·의료 해석 판단
- 특정 상품 추천·가입 유도 자동화
- schema 변경, migration, provider secret 임의 추가

## 9. 제한 공개 보류 기준

PR-96 권고에 따라 제한 공개는 보류한다. PR-97-A는 ADMIN 내부 품질·안전성·운영성만 강화한다.

## 10. 후속 PR 제안

| PR | 내용 |
| --- | --- |
| PR-97-A-QA | 수동·자동 QA 시나리오 확장, provider mock 기반 E2E |
| PR-97-B | VERIFIED_PLANNER 제한 공개 준비 (정책·RBAC·감사 로그) |
| Answer Assistant safety test 고도화 | provider 연동 시 output safety 회귀, retrieval fixture DB 테스트 |

## 변경 파일 요약

| 영역 | 파일 |
| --- | --- |
| Safety / validation | `lib/answer-assistant/validation.ts`, `constants.ts`, `labels.ts`, `types.ts` |
| Retrieval | `lib/answer-assistant/retrieval.ts`, `insufficient-evidence.ts` |
| Output safety | `lib/answer-assistant/output-safety.ts` |
| Draft generation | `lib/answer-assistant/generate-draft.ts` |
| Admin UI | `app/admin/answer-assistant/answer-assistant-panel.tsx`, `actions.ts` |
| Tests | `tests/answer-assistant/*` |
| Docs | `docs/PR-97A-ANSWER-ASSISTANT-ADMIN-HARDENING.md` |

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

## 수동 검증 시나리오

1. **권한**: 비로그인·GENERAL_USER·VERIFIED_PLANNER 차단, ADMIN만 접근
2. **허용 요청**: 해지 안내, 공시 확인, 청구서류 항목 — 근거 표시, 검수 필요 표시
3. **차단 요청**: 보험금 판단, 진단서 해석, adminMemo, 계약번호 등 — provider 호출 전 차단
4. **Retrieval**: 내부 필드 미노출
5. **Output Safety**: 금지 표현 생성 시 `OUTPUT_SAFETY_BLOCKED`
6. **금지 기능 없음**: public chatbot, upload, vector 등 부재 확인
