# PR-BS-09 Code Search Boundary Review

## 1. 목적

상병코드(KCD), 질병코드, 수술코드, 청구 관련 코드 조회는 설계사 실무 **참고**에 도움이 될 수 있다. 다만 코드만으로 **보험금 지급·청구 가능성·약관상 보장 여부**를 확정하면 안 되며, 진단서·병력·상담 원문과 결합될 때 민감정보·오해 위험이 커진다.

이번 PR의 목적:

- 코드 검색 기능의 **위험도·노출·출처·판단 금지** 경계를 문서로 고정한다.
- **public 노출 금지 또는 강한 제한** 원칙을 정리한다.
- **planner-only(Work Tools) 후보** 범위와 Answer Assistant 연결 No-Go를 정리한다.
- **실제 코드 데이터 추가·검색 UI 신규 구현·schema 변경은 하지 않는다.**

선행·관련: [PR-BS-01 Feature Benchmark Report](./PR-BS-01-FEATURE-BENCHMARK-REPORT.md), [PR-BS-08 Card Payment Info Model Review](./PR-BS-08-CARD-PAYMENT-INFO-MODEL-REVIEW.md), `lib/work-tools/claim-boundary-copy.ts` (PR-173-C), `lib/answer-assistant/output-safety.ts`. 후속 구현: [PR-BS-18 Code Search Safety Gate](./PR-BS-18-CODE-SEARCH-SAFETY-GATE.md).

---

## 2. 이번 PR의 범위

| 포함 | 비포함 |
| --- | --- |
| 코드 검색 경계·위험도·출처·No-Go 문서화 | 상병/수술 **코드 데이터 추가** |
| public / planner / admin 노출 기준 | **public** 코드 검색 페이지·API |
| PII·민감정보 입력 금지 기준 | 보험금·청구 **판단** 기능 |
| AA·Work Tools 연결 경계 (문서) | AA에 코드 검색 **자동 연결** |
| 후속 PR 후보·테스트 기준 (문서) | DB schema·migration |
| **현행 코드 조사** (변경 없음) | 외부 코드표 **무단 복제·신규 proxy** |

---

## 3. 이번 PR에서 하지 않는 것

- 상병·수술·질병 **코드 DB/데이터 추가**
- 코드 검색 **UI·API 신규 구현** (public)
- public 코드 검색 **개방**
- 보험금 지급 여부·청구 가능성·약관 보장 **확정**
- 진단서/병력/상담 **원문 입력** 유도·저장
- Answer Assistant **자동 연결**·prompt/response 원문 저장
- Work Tools **public 노출** 또는 guard 약화
- Auth/RBAC·public visibility guard 변경
- DB schema·Prisma·migration·package.json 변경
- 외부 사이트 코드표 **복제·이전**

---

## 4. 코드 검색 기능의 위험도

| 기능/정보 | 위험도 | 이유 |
| --- | --- | --- |
| 상병코드 단순 조회 | **Medium~High** | 진단·청구·지급 **판단 오해** |
| 수술코드 단순 조회 | **High** | 약관 수술분류표·지급 기준과 **혼동** |
| 질병명→코드 매핑 참고 | **Medium~High** | 상품·약관·심사별 상이 |
| 코드 기반 **보장 여부** 판단 | **Critical** | 보험금 지급 **확정 오해** |
| 코드 기반 **청구 가능성** 판단 | **Critical** | 심사 결과 **확정 오해** |
| `coverages` 등 담보 연동 표시 | **High~Critical** | “보장됨”으로 **오독** 가능 — 강한 disclaimer 필수 |
| 진단서·병력·상담 원문 입력 | **Critical** | 민감정보 |
| **public** 코드 검색 | **High~Critical** | 비전문가·고객 **오해** |
| **planner-only** 참고 검색 | **Medium~High** | 출처·약관·심사 확인 **안내 필수** |

---

## 5. 공식 출처 기준

### 5-1. 공식 출처 후보

| 정보 유형 | 우선 공식 출처 |
| --- | --- |
| 질병분류 코드 | 통계청 KCD, 건강보험심사평가원(HIRA) 등 **공식 분류** |
| 수술분류 기준 | 보험사 약관·공시, 약관 **수술분류표** |
| 청구서류 | 보험사 공식 청구 안내 |
| 심사·지급 기준 | 보험사 약관·공식 심사 기준 (PlannerDesk **확정 아님**) |
| 공시·약관 | 생명·손해보험협회, 보험사 공시 |
| 코드 개정 | 공식 고시·공지, Admin 재확인 |

### 5-2. 공식 출처로 인정하지 않는 것

- 블로그, 카페, 커뮤니티, 단톡방 캡처
- 출처 없는 PDF, 외부 아카이브 요약표
- **AI 답변 단독**
- BohumSchool 등 **외부 아카이ve API를 공식 출처로 간주하지 않음** (조사·proxy 단서만 — 후속 PR-BS-09A에서 정책화)

비공식 자료는 **조사 단서**만. public/planner 노출·보험금 판단 근거로 사용하지 않는다.

---

## 6. Public / Planner / Admin 노출 기준

| 정보 유형 | Public | Planner | Admin |
| --- | --- | --- | --- |
| 상병코드 단순 참고 | **금지 또는 보류** | 가능 후보 (Work Tools) | 관리 |
| 수술코드 단순 참고 | **금지 또는 보류** | 가능 후보 | 관리 |
| 질병/인수예외 검색 | **금지** | 가능 후보 | 관리 |
| 코드 기반 보장 판단 | **금지** | **금지** | **금지** |
| 코드 기반 청구 가능성 판단 | **금지** | **금지** | **금지** |
| 공식 출처 링크 | 가능 후보 | 가능 | 관리 |
| 약관·심사 확인 안내 | 가능 | 가능 | 관리 |
| 진단서·상담 원문 | **금지** | **금지** | **금지** |
| 내부 검수 메모 | **금지** | **금지** | 가능 |
| 검수 전 데이터 | **금지** | **금지** | 가능 |

### 원칙

1. **Public:** 통합 검색·디렉터리·랜딩에 **코드 검색 UI/API 없음** (현행 유지). Work Tools 카드는 **로그인·planner gate** 안내 수준만.
2. **Planner:** Work Tools 내부 **참고용**. “공식 약관·보험사 심사 확인 필요” copy 필수 (PR-173-C).
3. **Admin:** 검수 metadata 가능, **고객 민감정보 저장 금지**.

---

## 7. 개인정보·민감정보 입력 금지 기준

### 금지 입력

```text
고객명, 주민번호, 연락처, 주소
계약번호, 보험증권 번호
진단명 원문(고객 맥락), 진단서 원문
병력 상세, 검사 결과 원문
수술기록지·입퇴원확인서 원문
상담 원문 전체
가족정보, 계좌·결제정보
신분증·진단서·보험증권 이미지
```

### 허용 가능 (참고 검색)

- 일반 **코드값·질환명 키워드** (고객 식별 없음)
- 공식 출처 URL, 약관명, 보험사명
- 업무 키워드 (고객 PII 없음)

코드 검색 placeholder는 **코드·질환명** 예시만. “진단서 붙여넣기” 유도 금지.

---

## 8. 보험금·청구 가능성 판단 금지 기준

### 금지 표현

```text
보험금이 지급됩니다 / 보험금을 받을 수 있습니다
청구 가능합니다 / 청구 가능 확정
이 코드는 보장됩니다 / 이 수술은 보장됩니다
이 질병은 지급 대상입니다
이 코드면 충분합니다 / 이 서류만 내면 됩니다
무조건 지급 / 무조건 부지급
AI가 최종 판단합니다
```

현행 가드 참고: `WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES`, `lib/answer-assistant/output-safety.ts`, `validation.ts`.

### 허용 표현

```text
공식 약관과 보험사 심사 기준 확인이 필요합니다.
코드 검색은 설계사 업무 참고용입니다.
보험금 지급 여부를 확정하지 않습니다.
실제 청구 가능 여부는 약관, 진단 내용, 보험사 심사 기준에 따라 달라질 수 있습니다.
고객 안내 전 공식 출처를 확인하세요.
```

---

## 9. Answer Assistant 연결 경계

### 원칙

- AA가 코드 검색 결과를 **보험금·청구 판단**으로 바꾸면 **안 됨**.
- AA에 진단서·상담·병력 **원문 입력 유도 금지** (현행 `constants.ts`, `validation.ts`).
- “청구 가능”, “지급 가능” **확정 답변 금지** (`output-safety.ts`).

### No-Go (후속 PR도 Codex 제한검수)

- 코드 검색 결과를 AA **prompt에 자동 주입**
- AA가 코드 기반 **보장·청구 여부** 답변
- AA **prompt/response 원문** 즐겨찾기·저장
- public 사용자 AA에서 코드 검색 연동

현행: Answer Assistant와 Work Tools 코드 API **직접 연결 없음** (별도 route·allowlist).

---

## 10. Work Tools 연결 경계

### 원칙

- 코드 검색은 **Work Tools / planner-only** (`getWorkToolsAccess`, `workToolsRouteGuard`).
- **verified_planner** 또는 admin 세션 필요 (현행 RBAC).
- public 홈·검색에 **코드 결과 노출 없음**.
- “일반 고객용 건강검색” 톤 **금지**.

### 현행 도구 (조사만, 이번 PR 미변경)

| 도구 ID | 라벨 | API |
| --- | --- | --- |
| `disease-code` | 상병코드(KCD) 검색 | `/api/work-tools/disease-codes*` |
| `surgery-code` | 수술분류표 | `/api/work-tools/surgery-codes*` |
| `disease-search` | 인수예외질환 | `/api/work-tools/diseases*` |

UI disclaimer 예: HIRA 기반·**보험사/상품별 지급 기준 상이** (`work-tools-client.tsx`).

### 후속 검토 (PR-BS-09A~E)

- 외부 archive **proxy** → 공식 출처·자체 데이터 전환 정책
- `coverages` 확장 UI의 **오해 방지** copy 강화
- guard **회귀 테스트** (PR-BS-09E)

---

## 11. 데이터 모델 검토 후보

**schema 변경 없음.** 향후 자체 코드 catalog 도입 시 metadata만.

```text
codeType                 // kcd | surgery | disease_exception | ...
codeValue
codeLabel
officialSourceUrl
sourceLabel
lastVerifiedAt
reviewStatus
visibilityScope          // planner | admin (public 기본 금지)
riskLevel
appliesToProductType
requiresPolicyCheck
requiresInsurerReview
reviewedBy
reviewNotePrivate        // admin-only
retiredAt
```

### 모델 후보에 넣지 않는 필드

```text
customerName, residentNumber, contractNumber, policyNumber
diagnosisText, medicalHistory, consultationText
claimDecision, benefitEligibility, paymentAmount
```

---

## 12. 테스트 기준

이번 PR: **문서-only**. 후속 구현 시 정적/회귀 테스트 후보:

| # | 테스트 |
| --- | --- |
| 1 | public route에서 `/api/work-tools/disease-codes` 등 **401/403** |
| 2 | `lib/search/public`에 코드 도메인 **없음** |
| 3 | 진단서/상담 원문 **입력 유도 placeholder 없음** |
| 4 | `WORK_TOOLS_FORBIDDEN_PAYOUT_PHRASES` **미포함** (PR-173-C) |
| 5 | AA에 disease-code API **import/호출 없음** |
| 6 | AA output-safety **청구·지급 확정** 차단 |
| 7 | 검수 전 코드 데이터 **public projection 없음** |
| 8 | Work Tools page **getWorkToolsAccess** 유지 |

기존: `tests/ops/pr173a-work-tools-access.test.ts`, `tests/ops/pr173c-claim-boundary.test.ts`.

---

## 13. No-Go 기준

- **public** 코드 검색 구현·노출
- 보험금 지급·청구 가능성·약관 보장 **확정**
- 진단서·상담·병력 **원문** 입력·저장
- 코드표 **무단 복제**·출처 없는 bulk 적재
- Answer Assistant **자동 연결**·판단 답변
- prompt/response **원문 저장**
- Work Tools **public** 노출·guard 약화
- 문서 PR에 **schema migration** 포함
- package·PG·checkout·billing 추가

---

## 14. 후속 PR 후보

| 우선순위 | 후보 PR | 목적 | 위험도 |
| ---: | --- | --- | --- |
| 1 | PR-BS-09A Code Search Source Policy | KCD·수술분류 **공식 출처**·proxy 정책 | Low |
| 2 | PR-BS-09B Planner-only Code Search Prototype | UI·copy **후보** (데이터 정책 후) | High |
| 3 | PR-BS-09C Code Search Safety Test Suite | 금지 표현·public 노출 **회귀** | High |
| 4 | PR-BS-09D Answer Assistant Boundary Review | AA 연결 **제한검수** | **Critical** |
| 5 | PR-BS-09E Work Tools Guard Verification | API·page guard **회귀** | High |

로드맵: PR-BS-01 #8 완료. 카드납(PR-BS-08)과 **별도** — 코드 검색은 **보험금 판단** 리스크가 더 큼.

---

## 15. 최종 결론

PR-BS-09는 상병·수술·질병 **코드 검색의 경계**를 문서로 고정한 **검토 PR**이다. PlannerDesk는 이미 Work Tools에 planner-gated 코드 검색 **UI·API가 존재**하나, 이번 PR에서는 **기능을 추가·public 개방·AA 연결하지 않는다.**

핵심 원칙: **코드 조회 ≠ 보험금·청구 판단**. public 금지, planner는 참고용+공식 확인, PII·원문 입력 금지, AA 자동 연결 No-Go.

외부 archive proxy·담보(coverages) 표시는 **공식 출처 정책(PR-BS-09A)** 과 **안전 테스트(PR-BS-09C)** 후속에서 다룬다.

---

## 부록: 현행 구조 조사 (코드 변경 없음)

| 항목 | 존재 | 위치 | PR-BS-09 판단 |
| --- | --- | --- | --- |
| 상병코드 UI | O | `work-tools-client.tsx` — `DiseaseCodeSearchTool` | planner-only 유지 |
| 수술코드 UI | O | `SurgeryCodeSearchTool` | 동일 |
| 인수예외 질환 | O | `DiseaseSearchTool` | 동일 |
| API guard | O | `workToolsRouteGuard`, `getWorkToolsAccess` | 약화 금지 |
| public 검색 | **X** | `lib/search/public.ts` — 코드 도메인 없음 | 유지 |
| AA 연동 | **X** | answer-assistant 경로 분리 | 자동 연결 금지 |
| payout boundary copy | O | `claim-boundary-copy.ts`, PR-173-C tests | 확장 권장 |
| 외부 proxy | O | `app/api/work-tools/disease-codes*` 등 → archive API | **후속 출처 정책** |
| DB code catalog | **X** | Prisma에 Code 모델 없음 | schema 변경은 BS-09C+ |
