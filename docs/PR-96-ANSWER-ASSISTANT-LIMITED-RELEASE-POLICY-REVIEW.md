# PR-96: Answer Assistant Limited Release Policy Review

**정책 재검토 전용 PR.** VERIFIED_PLANNER 실제 공개, GENERAL_USER 공개, public route, LLM provider, schema/migration, 자동 발송·게시 구현은 포함하지 않는다.

## 0. 개발 맥락·선행 PR

| 선행 PR | 내용 |
|---------|------|
| PR-92 | [Answer Assistant Safety Policy](./PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md) |
| PR-93 | [Retrieval Design](./PR-93-RETRIEVAL-DESIGN.md) |
| PR-94 | `/admin/answer-assistant` 관리자 내부 초안 MVP |
| PR-95 | [Safety Validation](./PR-95-ANSWER-ASSISTANT-SAFETY-VALIDATION.md) · [Go/No-Go](./PR-95-PRE-RELEASE-GO-NOGO-CHECKLIST.md) · `npm run test` (73 tests) |

| 후속 PR | 범위 |
|---------|------|
| PR-96-QA | 본 정책 문서 운영·법무·보안 sign-off |
| PR-97-A | ADMIN 내부 유지 고도화 (권장) |
| PR-97-B | VERIFIED_PLANNER 제한 공개 **준비** (조건부, 실제 공개 아님) |

**판단 체크리스트:** [PR-96-LIMITED-RELEASE-DECISION-CHECKLIST.md](./PR-96-LIMITED-RELEASE-DECISION-CHECKLIST.md)

PlannerDesk는 **손해사정 업무를 수행하지 않으며**, **의료 진단을 해석하지 않으며**, **보험금 지급 여부를 판단하지 않는다.**

---

## 1. Purpose (목적)

### 1.1 PR-96 목적

| 목적 | 설명 |
|------|------|
| PR-95 결과 종합 | PASS/PARTIAL/NOT_TESTED 매트릭스로 제한 공개 판단 재료 제공 |
| ADMIN 내부 유지 판단 | PR-94 MVP를 관리자 검수용 도구로 유지할지 확정 |
| VERIFIED_PLANNER 조건 검토 | 공개 **가능 조건**만 문서화 (PR-96에서 공개하지 않음) |
| GENERAL_USER 보류 | No-Go 근거 명문화 |
| 추가 안전장치 정의 | rate limit, 로그·저장, UI 고지, abuse monitoring |
| PR-97 분기 | ADMIN 고도화 vs verified-only 준비 PR 선택 기준 |

### 1.2 목적이 아닌 것

- public chatbot 오픈
- VERIFIED_PLANNER / GENERAL_USER 실제 답변 route
- 고객·커뮤니티 자동 액션
- 보험금·의료·손해사정·상품 추천 자동화
- schema/migration · provider secret

---

## 2. PR-95 safety validation summary (검증 결과 요약)

**범례:** PASS = 자동 테스트 또는 코드·문서로 충족 확인 · PARTIAL = 자동 PASS + 수동/운영 항목 미완 · FAIL = 미충족 · NOT_TESTED = 미실시

**자동 테스트 기준:** `npm run test` — 73 pass / 0 fail (PR-95)

| # | 항목 | 결과 | 근거 |
|---|------|------|------|
| 1 | ADMIN 전용 접근 | **PARTIAL** | `getAdminAccess` + admin layout (`auth-and-forbidden-features.test.ts`); 역할별 E2E는 PR-95-QA 수동 |
| 2 | 직접 요청 우회 차단 | **PARTIAL** | `requireAdminAccess` in server action (정적); live bypass pentest는 PR-95-QA |
| 3 | 개인정보 입력 차단 | **PASS** | `safety-gate.test.ts` |
| 4 | 계약정보 입력 차단 | **PASS** | `safety-gate.test.ts` |
| 5 | 의료정보 입력 차단 | **PASS** | `safety-gate.test.ts` |
| 6 | 청구자료 입력 차단 | **PASS** | `safety-gate.test.ts` (의료·청구 키워드) |
| 7 | 보험금 판단 요청 차단 | **PASS** | `safety-gate.test.ts` |
| 8 | 손해사정성 판단 요청 차단 | **PASS** | `safety-gate.test.ts` |
| 9 | 상품 추천·공포 조장 차단 | **PASS** | `safety-gate.test.ts` |
| 10 | Prompt Injection 차단 | **PASS** | `safety-gate.test.ts` (PR-95 gap 패턴 보강 포함) |
| 11 | Retrieval whitelist | **PASS** | `retrieval-policy.test.ts` + `lib/public/*` WHERE 재사용 |
| 12 | MessageTemplate safeCopy | **PASS** | retrieval select + prohibited phrase filter |
| 13 | CorrectionRequest 제외 | **PASS** | `RETRIEVAL_EXCLUDED_DOMAINS` |
| 14 | adminMemo 제외 | **PASS** | retrieval 소스 정적 검사 |
| 15 | MessageTemplate body 제외 | **PASS** | retrieval 소스 정적 검사 |
| 16 | 미검수 데이터 제외 | **PARTIAL** | WHERE 설계·코드 PASS; DB 샘플 spot-check는 PR-95-QA |
| 17 | 근거 부족 시 생성 차단 | **PARTIAL** | `assessEvidencePolicy` 구현; E2E insufficient 케이스는 수동 |
| 18 | output safety scan | **PASS** | `output-safety.test.ts` |
| 19 | provider safety | **PASS** | stub 미구성·no secret·no raw save (`provider.test.ts`) |
| 20 | 자동 발송 부재 | **PASS** | UI 정적 검사 |
| 21 | 자동 게시 부재 | **PASS** | UI 정적 검사 |
| 22 | 커뮤니티 자동 댓글 부재 | **PASS** | route·UI 부재 |
| 23 | 파일 업로드 부재 | **PASS** | UI·answer-assistant 경로 부재 |
| 24 | OCR 부재 | **PASS** | answer-assistant 경로 부재 |
| 25 | vector/embedding 부재 | **PASS** | 코드베이스 부재 |

### 2.1 PARTIAL / NOT_TESTED 요약

| 구분 | 항목 |
|------|------|
| **PARTIAL (3)** | ADMIN 접근 E2E, 직접 요청 live 우회, 미검수 DB 샘플·insufficient E2E |
| **NOT_TESTED (운영, PR-96 신규)** | rate limit 구현, usage/abuse log, VERIFIED_PLANNER route, LLM provider 실연동 안정성, 법무·운영 sign-off |

**PR-96 판단 규칙:** FAIL 또는 핵심 NOT_TESTED( rate limit·로그 정책 미확정)가 있으면 **VERIFIED_PLANNER 제한 공개는 보류**. ADMIN 내부 유지는 PARTIAL만으로 **Go** 가능.

---

## 3. Operating scope options (운영 범위 선택지)

### 3.1 선택지 A — ADMIN 내부 전용 유지 ✅ **최종 권고**

| | |
|---|---|
| **판단** | 기본 권장안 · 가장 안전 · PR-94 MVP 범위 유지 |
| **허용** | ADMIN만 `/admin/answer-assistant` · 초안·근거·검수 문구 · 규칙 기반 초안(LLM 미구성) |
| **금지** | VERIFIED_PLANNER / GENERAL_USER · 자동 발송·게시·댓글 |
| **추천 조건** | PR-95 PARTIAL(수동 QA) 존재 · provider 미구성 · rate limit·audit 미구현 |

**PR-96 결론:** 현 단계 **선택지 A 채택**.

---

### 3.2 선택지 B — VERIFIED_PLANNER 제한 공개 검토 ⏸ **조건부 보류**

| | |
|---|---|
| **판단** | 고위험 · **PR-96에서 공개하지 않음** · PR-97-B에서 준비만 검토 |
| **최소 조건** | §5 전항 + PR-95 핵심 PASS + PR-95-QA sign-off + PR-97-B 산출물 |

**허용 후보 (PR-97-B 이후에만):**

- 검증 설계사 전용 **비 public** 보조 화면 (예: `/planner/answer-assistant` — **미구현**)
- 고객 발송 **전** 초안 참고 (복사 시 confirm)
- 공식 확인 필요 항목·근거 목록

**계속 금지:** 자동 발송·댓글·판단형 답변·파일/OCR·CorrectionRequest retrieval

**PlannerVerification 매핑** ([PR-92 §3.2](./PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md), schema `approved`):

- `User.role = verified_planner`
- `PlannerVerification.status = approved`
- `PlannerVerification.deletedAt = null`
- `status ∉ { suspended, rejected, expired, deleted }`
- `User.status = active`
- Community MVP [access.ts](../app/community/access.ts)와 **동일 최소 기준**

---

### 3.3 선택지 C — GENERAL_USER 공개 ❌ **No-Go**

| 보류 사유 |
|-----------|
| 고객별 계약·보험금 판단 요청 유입 |
| 의료정보·진단서 입력 유입 |
| 자동 상담·상품 추천 서비스 오인 |
| 운영·법무 책임 범위 과도 확대 |

**PR-96 명확한 결론:** GENERAL_USER 공개 **진행하지 않음**. 별도 법무·컴플라이언스·보안·운영 검토 전까지 로드맵 **제외**.

---

## 4. Additional safeguards before limited release (제한 공개 전 추가 안전장치)

VERIFIED_PLANNER 공개 **검토** 시 PR-97-B에서 구현·문서화할 항목.

### 4.1 권한 안전장치

| 필수 | |
|------|---|
| 로그인 필수 | NextAuth session |
| 검증 설계사 | `PlannerVerification.status = approved`, `deletedAt = null` |
| 차단 | `suspended`, `rejected`, `expired`, `deleted`, `User.status ≠ active` |
| 서버 검증 | UI 숨김만으로 불충분 — server action/route handler gate |
| 우회 차단 | 비인증·타 역할 direct action → blocked |

### 4.2 사용량 제한 (rate limit)

| 필수 | 권장 초안 (운영 확정 전 placeholder) |
|------|-------------------------------------|
| 사용자별 일일 상한 | 예: 20 requests / user / day |
| 분당 상한 | 예: 5 requests / user / minute |
| 차단 누적 감시 | blockedReason 카운트 (저장 정책 §4.3) |
| abuse 대응 | 일일 상한 초과·반복 injection → 24h cooldown |

**구현:** PR-97-B 별도 PR. Redis/DB 카운터 선택은 인프라 검토 후.

### 4.3 로그·감사·저장 정책

| 데이터 | PR-96 권장 정책 |
|--------|----------------|
| 요청 원문 | **기본 저장 금지** (PII 유입 리스크) |
| raw provider output | **저장 금지** |
| 생성 초안 | **기본 저장 금지** (화면 표시만, PR-94와 동일) |
| 차단 사유 (`blockedReason`) | **허용** — redacted enum + timestamp + userId (민감 본문 없음) |
| Retrieval source IDs | **허용** — candidate id + type only |
| provider error code | **허용** — `PROVIDER_NOT_CONFIGURED` 등 enum |
| IP / user agent | **최소** — abuse monitoring 시에만, retention 30일 이하 검토 |

**원칙:** 운영 진단용 **최소 메타데이터**만. 본문·고객 identifiable text 저장 금지.

### 4.4 UI 고지 (VERIFIED_PLANNER 제한 공개 시)

화면 상단 **필수** 문구 (PR-96 확정):

1. “이 기능은 검증 설계사의 업무 참고용 초안 보조 도구입니다.”
2. “보험금 지급 가능 여부, 손해사정성 판단, 의료정보 해석, 특정 상품 추천은 제공하지 않습니다.”
3. “고객명, 연락처, 계약번호, 병명, 진단명, 진단서 내용, 청구자료는 입력하지 마세요.”
4. “생성된 초안은 고객에게 바로 발송하지 말고, 공식 약관과 보험사 안내 기준을 확인한 뒤 사용해야 합니다.”

ADMIN 화면([PR-94 constants](../lib/answer-assistant/constants.ts))과 톤을 맞추되, 대상을 “검증 설계사”로 조정.

### 4.5 자동 액션 금지 (제한 공개 후에도 유지)

고객·카카오·이메일 발송 · 커뮤니티 자동 댓글 · Q&A 자동 답변 · 자동 게시 · 자동 저장 · 자동 신고/블라인드 — **전부 금지**.

---

## 5. Go / No-Go criteria (PR-96)

### 5.1 VERIFIED_PLANNER 제한 공개 **검토** Go 조건

아래 **전부** 충족 시 PR-97-B 착수 가능 (공개 자체는 sign-off 후):

- PR-95 Safety Gate·Output·Provider·Retrieval whitelist **PASS**
- PR-95-QA 수동 (E2E·field exposure) **PASS**
- ADMIN 우회 **없음** 확인
- §4.1–4.5 정책 **문서·운영 sign-off**
- rate limit **설계 + 구현 PR** 계획
- 로그·저장 정책 **확정**
- GENERAL_USER 공개 **금지 유지**
- 자동 발송·게시 **부재 유지**

### 5.2 No-Go 조건

[PR-95-PRE-RELEASE-GO-NOGO-CHECKLIST.md §B](./PR-95-PRE-RELEASE-GO-NOGO-CHECKLIST.md) 와 동일. 추가:

- rate limit 계획 없음
- 로그·저장 정책 미확정
- LLM provider secret 무단 추가
- PR-95-QA sign-off 없음

### 5.3 PR-96 현 상태 판단

| 범위 | 판단 |
|------|------|
| ADMIN 내부 유지 | **Go** |
| VERIFIED_PLANNER 제한 공개 | **No-Go** (조건부 — §5.1 미충족) |
| GENERAL_USER | **No-Go** |

---

## 6. PR-97 follow-up candidates

### PR-97-A — ADMIN 내부 유지 고도화 ✅ **권장 다음 PR**

**조건:** PR-96 선택지 A · VERIFIED_PLANNER No-Go

| 작업 후보 |
|-----------|
| PR-95-QA 수동 검증 완료 및 gap close |
| 차단·output safety 테스트 확대 |
| Retrieval 품질·insufficient E2E |
| 근거 UI·관리자 검수 워크플로우 |
| 승인 LLM provider adapter (별도 보안 PR) |
| provider fallback·품질 eval |

### PR-97-B — VERIFIED_PLANNER 제한 공개 **준비**

**조건:** §5.1 Go + 운영·법무·보안 sign-off

| 작업 후보 |
|-----------|
| verified-only route 설계 (non-public, noindex) |
| rate limit 구현 |
| minimal usage log (§4.3) |
| 권한·우회 테스트 |
| §4.4 UI 고지 |
| 복사 confirm · 자동 발송 금지 유지 |

**주의:** PR-97-B도 “준비”이며 **traffic open은 PR-97-B-QA + 재Go 이후**.

### PR-97-C — GENERAL_USER 공개

**진행하지 않음** — 장기 보류.

---

## 7. Final recommendation (최종 권고)

| 항목 | 내용 |
|------|------|
| **최종 권고** | **ADMIN 내부 유지** |
| **판단 근거** | PR-95 자동 73/73 PASS; 핵심 Safety·Retrieval·Output·Provider PASS; rate limit·audit·verified route·LLM 실연동·QA sign-off 미완 |
| **PR-95 PASS** | Safety Gate(10), Retrieval(6), Output, Provider, 금지 기능 부재(5) — §2 표 참조 |
| **PR-95 PARTIAL** | ADMIN E2E, live bypass, DB spot-check / insufficient E2E |
| **PR-95 FAIL** | 없음 |
| **NOT_TESTED (운영)** | rate limit, usage log, VERIFIED route, 법무 sign-off |
| **공개 전 추가 작업** | PR-95-QA 완료 · PR-97-A 고도화 · (선택) PR-97-B 전 §5.1 충족 |
| **다음 PR 권장** | **PR-97-A** (ADMIN 내부 유지 고도화) |
| **제한 공개 가능 여부** | **보류** (ADMIN only **가능** · VERIFIED **조건부 가능** · GENERAL **불가**) |

---

## 8. Explicit non-implementation (PR-96)

- VERIFIED_PLANNER / GENERAL_USER answer route
- public chatbot
- 자동 발송·게시·댓글
- 답변 DB 저장
- file upload / OCR / vector / embedding
- schema/migration / provider env
- 코드 변경 (본 PR는 **문서만**)

---

## 9. Related documents

| 문서 | 관계 |
|------|------|
| [PR-96-LIMITED-RELEASE-DECISION-CHECKLIST.md](./PR-96-LIMITED-RELEASE-DECISION-CHECKLIST.md) | 판단 체크리스트 |
| [PR-95-ANSWER-ASSISTANT-SAFETY-VALIDATION.md](./PR-95-ANSWER-ASSISTANT-SAFETY-VALIDATION.md) | 선행 검증 |
| [PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md](./PR-92-ANSWER-ASSISTANT-SAFETY-POLICY.md) | 상위 정책 |

---

## 10. Completion criteria (PR-96)

1. PR-95 결과 종합 ✓
2. ADMIN / VERIFIED / GENERAL 판단 ✓
3. 추가 안전장치·rate limit·로그·UI 고지 ✓
4. Go/No-Go · PR-97 분기 ✓
5. 실제 공개 구현 없음 ✓
6. typecheck/lint/build/test ✓
