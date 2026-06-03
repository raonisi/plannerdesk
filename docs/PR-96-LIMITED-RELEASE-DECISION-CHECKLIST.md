# PR-96: Answer Assistant Limited Release Decision Checklist

PR-95 안전 검증 결과를 바탕으로 **제한 공개 여부**를 판단하는 운영·엔지니어링·QA 체크리스트.

**상세 정책:** [PR-96-ANSWER-ASSISTANT-LIMITED-RELEASE-POLICY-REVIEW.md](./PR-96-ANSWER-ASSISTANT-LIMITED-RELEASE-POLICY-REVIEW.md)  
**선행 검증:** [PR-95-PRE-RELEASE-GO-NOGO-CHECKLIST.md](./PR-95-PRE-RELEASE-GO-NOGO-CHECKLIST.md)  
**자동 테스트:** `npm run test`

---

## PR-96 판단 체크리스트

각 항목: `[x]` = PR-96 기준 충족 · `[ ]` = 미충족 · `[~]` = PARTIAL

### A. PR-95 핵심 안전 (자동)

- [x] PR-95 Safety Gate 자동 테스트 PASS (`safety-gate.test.ts`)
- [x] Output safety scan PASS (`output-safety.test.ts`)
- [x] Provider safety PASS — stub, no secret (`provider.test.ts`)
- [x] Retrieval whitelist PASS (`retrieval-policy.test.ts`)
- [x] 금지 UI·auto action 부재 PASS (`auth-and-forbidden-features.test.ts`)
- [~] PR-95 **전체** 핵심 항목 PASS — 자동 PASS, 수동 QA는 PR-95-QA

### B. 접근·입력·데이터

- [~] ADMIN 전용 접근 유지 (코드 PASS, E2E 수동)
- [~] 직접 요청 우회 차단 (server action PASS, live pentest 수동)
- [x] 개인정보 입력 차단 (자동)
- [x] 계약정보 입력 차단 (자동)
- [x] 의료정보 입력 차단 (자동)
- [x] 청구자료·업로드 요청 차단 (자동)
- [x] 보험금 판단 요청 차단 (자동)
- [x] 손해사정성 판단 차단 (자동)
- [x] 상품 추천·공포 조장 차단 (자동)
- [x] Prompt Injection 차단 (자동)
- [x] Retrieval whitelist 5도메인
- [x] MessageTemplate safeCopy only
- [x] CorrectionRequest 제외
- [x] adminMemo 제외
- [x] MessageTemplate body 제외
- [~] 미검수 데이터 제외 (WHERE PASS, DB spot-check 수동)
- [~] 근거 부족 시 생성 차단 (코드 PASS, E2E 수동)
- [x] output safety scan 작동
- [x] provider safety 검증 (stub)

### C. 운영·제한 공개 전제 (PR-96 신규)

- [ ] rate limit **구현** (계획만 §4.2 — PR-97-B)
- [x] rate limit **필요성·기준 정의** (PR-96 문서)
- [x] 로그·저장 **정책 정의** (PR-96 §4.3)
- [ ] usage/abuse monitoring **구현**
- [ ] PR-95-QA 수동 sign-off
- [ ] 법무·보안·운영 sign-off (VERIFIED 공개 시)

### D. 금지 기능·범위

- [x] 자동 발송 기능 없음
- [x] 자동 게시 기능 없음
- [x] 커뮤니티 자동 댓글 없음
- [x] 파일 업로드 없음
- [x] OCR 없음
- [x] public chatbot 없음
- [x] VERIFIED_PLANNER answer route **실제 구현 없음**
- [x] GENERAL_USER 공개 **보류** (PR-96 No-Go)

---

## 결론 체크

- [x] **ADMIN 내부 유지**가 필요한가 → **예 (권고)**
- [ ] VERIFIED_PLANNER 제한 공개 **지금** 가능한가 → **아니오**
- [~] VERIFIED_PLANNER 제한 공개 **준비** 가능한가 → **조건부 (PR-97-B, §5.1 후)**
- [x] PR-97 추가 작업 PR이 필요한가 → **예 (PR-97-A 권장)**
- [x] GENERAL_USER 공개는 보류되었는가 → **예**

---

## PR-96 권장 결론 (서명 전 기본값)

| 질문 | 답 |
|------|-----|
| ADMIN 내부 유지? | **Yes — Go** |
| VERIFIED_PLANNER 제한 공개? | **Not now — No-Go** |
| GENERAL_USER 공개? | **No — 로드맵 제외** |
| 다음 PR? | **PR-97-A** (ADMIN 고도화) |

---

## Sign-off (PR-96-QA)

| 역할 | 이름 | 날짜 | ADMIN 유지 | VERIFIED 준비 | GENERAL |
|------|------|------|------------|---------------|---------|
| Engineering | | | Go | Defer | No |
| QA | | | | | |
| Security/Privacy | | | | | |
| Product/Ops | | | | | |

---

## PR-97 분기 결정

PR-96-QA sign-off 후 아래 **하나** 선택:

- [ ] **PR-97-A** — ADMIN 내부 유지 고도화 (기본)
- [ ] **PR-97-B** — VERIFIED_PLANNER 제한 공개 준비 (§5.1 Go + sign-off 후)
- [ ] **PR-97-C** — GENERAL_USER (선택 금지)

**PR-96 기본값:** PR-97-A 체크
