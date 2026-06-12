# PR-BS-08 Card Payment Info Model Review

## 1. 목적

보험사별 **카드납·보험료 납입 방식·자동이체·가상계좌·고객센터 납입 안내** 등 설계사 실무 참고 정보는 PlannerDesk 디렉터리 가치를 높일 수 있다. 다만 보험사·상품·채널·시점별로 조건이 달라 **오안내 위험이 높고**, 고객 계약·납입에 직접 영향을 줄 수 있다.

이번 PR의 목적:

- 카드납·납입 정보가 PlannerDesk에 **왜·어떤 조건에서** 필요한지 검토한다.
- 위험도·공식 출처·Admin 검수·노출 기준을 **문서로 고정**한다.
- **공식 출처 확인과 Admin 검수 전에는 public에 확정 정보를 추가하지 않는다.**
- **실제 데이터 입력·schema 변경·PG 구현은 하지 않는다.**
- **PlannerDesk 유료 결제/PG(PortOne·TossPayments 등)와 혼동하지 않는다.**

관련 선행 문서: [PR-BS-04 Official Work Link Review](./PR-BS-04-OFFICIAL-WORK-LINK-REVIEW.md), [INSURER_ACTION_FIELD_EXPANSION_PLAN.md](./INSURER_ACTION_FIELD_EXPANSION_PLAN.md), [PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md](./PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md).

---

## 2. 용어 구분

| 구분 | 의미 | 이번 PR |
| --- | --- | --- |
| **보험사별 카드납 정보** | 보험료를 카드로 납입할 수 있는지, 초회/계속·조건 등 **업무 참고** 정보 | **검토 대상** |
| **보험료 납입 조건** | 보험사·상품·채널별로 달라질 수 있는 납입 방식·제한 | 공식 출처 필요 |
| **고객 결제정보** | 카드번호, CVC, 계좌번호, 결제 토큰, 고객별 납입 이력 | **저장 금지** |
| **PlannerDesk PG 결제** | PlannerDesk **유료 구독·과금**을 위한 PG·checkout·billing | **제외** (PR175/PR170 계열) |

문서·코드·UI에서 “결제”는 **보험사 납입 참고**인지 **PlannerDesk 과금**인지 반드시 구분한다.

---

## 3. 이번 PR의 범위

| 포함 | 비포함 |
| --- | --- |
| 카드납·납입 정보 모델·위험도·출처·노출 기준 문서화 | 실제 카드납 가능 여부·조건 **데이터 추가** |
| Admin 검수 workflow **후보** 정리 | Prisma enum/schema **변경** |
| 데이터 필드 **검토 후보** (metadata 수준) | checkout/billing/subscription/webhook **구현** |
| PR175 PG 후보와의 **구분** 명시 | 외부 사이트 카드납 목록 **복제** |
| 현행 코드·schema **현황 참조** (변경 없음) | PG SDK·package.json 변경 |

---

## 4. 이번 PR에서 하지 않는 것

- 실제 카드납 가능/불가 **확정 데이터** 입력
- 보험사별 납입 조건·카드사 제한 **임의 작성**
- 자동이체·가상계좌 조건 **임의 작성**
- 고객센터·팩스 번호 **임의 추가**
- 고객 결제정보(카드번호, CVC, 계좌번호, 토큰) 저장
- PlannerDesk PG 결제·구독 구현
- checkout / billing / subscription / webhook route 추가
- DB schema·migration·seed
- 외부 사이트 데이터·문구·asset 복제
- Auth/RBAC·public visibility guard 변경

---

## 5. 카드납·납입 정보의 위험도

| 정보 유형 | 위험도 | 이유 |
| --- | --- | --- |
| 카드납 가능 여부 | **High** | 보험사·상품·채널별 상이, “가능/불가” 확정 표현 위험 |
| 카드납 제한 조건 (보장성만, 제휴 카드사 등) | **High** | 조건 변경·예외 많음 |
| 자동이체 가능 여부 | **Medium~High** | 채널·상품별 정책 차이 |
| 가상계좌 납입 안내 | **High** | 계좌·기한 오안내 시 납입 실패 |
| 고객센터 납입 문의 | **High** | 번호·안내 오류 시 업무·고객 혼선 |
| 보험료 납입 기한·연체 | **Critical** | 계약상 불이익 가능 — PlannerDesk 확정 제공 부적합 |
| 결제정보 저장 | **Critical** | 저장 금지 |
| 카드번호 / CVC | **Critical** | 저장·입력 유도 금지 |
| 계좌번호 | **Critical** | 저장 금지 |
| 내부 메모 (`notes`, private review) | **Critical** | public/planner 노출 금지 |
| 검수 전 데이터 | **Critical** | public/planner 노출 금지 |

현행 Insurer projection은 `cardPaymentStatus`, `cardPaymentInitialAvailable`, `cardPaymentRecurringAvailable`, `cardPaymentNote`를 public에 노출할 수 있으나, **검수·출처·최신성 없는 확장은 금지**한다. (`lib/public/insurers.ts`, `components/directory/insurer-action-card.tsx` — 이번 PR **미변경**)

---

## 6. 공식 출처 기준

### 6-1. 공식 출처 후보

| 정보 유형 | 우선 공식 출처 |
| --- | --- |
| 카드납 가능 여부 | 보험사 공식 납입 안내, 공지, 업무 공지 |
| 납입 조건 | 보험사 공식 안내, 약관·공시·공지 |
| 자동이체 | 보험사 공식 납입 안내 |
| 가상계좌 | 보험사 공식 납입 안내 |
| 고객센터 | 보험사 공식 고객센터 페이지 |
| 카드사 제한 | 보험사 공식 카드납 안내 |
| 변경사항 | 보험사 공식 공지, Admin 재확인 |

### 6-2. 공식 출처로 인정하지 않는 것

- 블로그, 카페, 커뮤니티, 외부 아카이브
- 캡처 이미지, 설계사 단톡방 캡처
- 출처·날짜 불명확 PDF
- BohumSchool 등 **외부 사이트 정리본 직접 이전**

비공식 자료는 **조사 단서**로만 사용하고, public/planner 노출 근거로 쓰지 않는다. (PR-BS-04·PR-BS-05 correction flow와 동일 원칙)

---

## 7. Public / Planner / Admin 노출 기준

| 정보 유형 | Public | Planner | Admin |
| --- | --- | --- | --- |
| 카드납 가능 여부 | **신중 또는 보류** | 가능 후보 (출처·검수일) | 관리 |
| 카드납 조건 | **보류 권장** | 가능 후보 | 관리 |
| 자동이체 안내 | 신중 | 가능 후보 | 관리 |
| 가상계좌 안내 | **보류 권장** | 가능 후보 | 관리 |
| 고객센터 납입 문의 | 신중 | 가능 후보 | 관리 |
| 검수 전 데이터 | **금지** | **금지** | 가능 |
| 내부 메모 | **금지** | **금지** | 가능 |
| 고객 결제정보 | **금지** | **금지** | **금지** |
| 공식 출처 URL | 가능 후보 | 가능 | 관리 |
| `lastVerifiedAt` | 가능 후보 | 가능 | 관리 |

### 원칙

1. **Public:** “가능/불가능 확정”보다 **공식 출처 확인 필요**·**최근 확인일** 중심. `isPublished` + 허용 `verificationStatus` 통과 필수.
2. **Planner:** 업무 참고 범위는 넓을 수 있으나, 출처·검수일·조건 복잡성 안내는 동일. Work Tools·Answer Assistant gate **유지**.
3. **Admin:** 검수 전·내부 메모 존재 가능, **public/planner 유출 금지**.

---

## 8. Admin 검수 workflow

이번 PR은 workflow를 **검토 후보**로만 제시한다. enum·schema **추가하지 않음**.

| 단계 | 작업 |
| ---: | --- |
| 1 | 후보 정보 등록 |
| 2 | 보험사 선택 |
| 3 | 정보 유형 선택 (카드납·자동이체·가상계좌 등) |
| 4 | 공식 출처 URL 입력 |
| 5 | 출처 확인일 기록 |
| 6 | 위험도 분류 |
| 7 | 관리자 1차 검수 |
| 8 | second review 필요 여부 판단 (High/Critical) |
| 9 | `lastVerifiedAt` 기록 |
| 10 | `visibilityScope` 결정 (public / planner / admin) |
| 11 | `reviewStatus` 설정 |
| 12 | 변경 이력 기록 |
| 13 | 오류 제보 시 재검수 (correction flow) |
| 14 | stale 기간 도래 시 재검수 |

### reviewStatus 후보 (문서 수준)

```text
draft
needs_review
verified
published
stale
retired
rejected
```

현행 Insurer는 `verificationStatus`·`isPublished`·`lastVerifiedAt` 조합으로 유사 gate가 있다. 별도 `PaymentInfo` 엔티티 필요성은 **PR-BS-08C**에서 검토한다.

---

## 9. 최신성 표시 기준

| 상태 | 표시 문구 (후보) |
| --- | --- |
| 검수 완료 | 최근 확인: YYYY.MM.DD |
| 공식 출처 있음 | 공식 출처 확인 |
| 오래된 정보 | 재확인 필요 |
| 출처 없음 | 공식 출처 확인 필요 |
| 검수 전 | public 노출 금지 |
| 조건 복잡 | 보험사·상품·채널별 확인 필요 |
| 폐기/중단 | 사용 중단 또는 노출 제외 |

### 금지 문구 (UI·카드납 copy)

- 카드납 가능합니다 / 무조건 카드납 됩니다
- 이 카드로 납입하면 됩니다
- 이 번호로 전화하면 됩니다 / 이 방법만 쓰면 됩니다
- 항상 최신 / 100% 정확 / 공식 확정
- 보험료 납입 문제 없습니다
- 고객 결제정보를 입력하세요

PR-BS-02 `DataFreshnessMeta`·금지 phrase 패턴과 정합 유지.

---

## 10. 데이터 모델 검토 후보

**schema 변경 없음.** 향후 별도 PR에서 Insurer 확장 vs 독립 `PaymentInfo` 테이블을 비교한다.

### 10-1. 현행 Insurer 필드 (참고만)

```text
cardPaymentStatus          (enum: available | unavailable | conditional | unknown)
cardPaymentInitialAvailable
cardPaymentRecurringAvailable
cardPaymentNote            (structured text; admin-managed)
lastVerifiedAt
verificationStatus
isPublished
```

### 10-2. 독립 엔티티 검토 후보 (metadata only)

```text
paymentInfoType            // card_payment | auto_debit | virtual_account | payment_inquiry | ...
insurerId
title
summary                    // 짧은 업무 요약; 고객 PII 없음
officialSourceUrl
sourceLabel
lastVerifiedAt
reviewStatus               // 문서 8절 후보
visibilityScope            // public | planner | admin
riskLevel
appliesToProductType       // optional; “상품별 확인 필요” 플래그
appliesToChannel
requiresOfficialConfirmation
reviewedBy
reviewNotePrivate          // admin-only; public/planner 금지
staleAfterDays
retiredAt
correctionRequestCount
```

**모델 후보에 넣지 않는 것:** 카드번호, CVC, 계좌번호, 계약번호, 보험증권 번호, 고객명, 결제 토큰, PG secret.

---

## 11. 개인정보·결제정보 저장 금지 기준

### 저장 금지

```text
고객명, 주민번호, 연락처, 주소
계약번호, 보험증권 번호
카드번호, CVC, 계좌번호, 결제 비밀번호, 결제 토큰
고객별 납입 이력, 고객별 보험료
고객 상담 원문
신분증·카드·통장 이미지
secret, token, API key, PG secret
```

### 저장 가능 후보 (업무 metadata)

- 정보 유형, 보험사 ID
- 공식 출처 URL, 출처 확인일
- 위험도, 검수 상태, 공개 범위
- 관리자 검수 메타데이터 (admin-only memo)

PlannerDesk는 **고객 대신 보험료를 결제하지 않는다.** 납입은 항상 보험사·고객 채널에서 이루어진다.

---

## 12. PlannerDesk PG 결제와의 구분

| 항목 | PR-BS-08 (본 PR) | PR175 / PR170 계열 |
| --- | --- | --- |
| 대상 | 보험사별 **납입 참고** 정보 | PlannerDesk **유료 구독·과금** |
| 결제 주체 | 고객 ↔ 보험사 (PlannerDesk 비관여) | 사용자 ↔ PlannerDesk |
| PG SDK | **구현 안 함** | 후속 검토 (Toss/PortOne/NICEPAY 등) |
| Route | 없음 | checkout/billing/webhook **후속** |
| 저장 | 고객 결제정보 **금지** | 결제 토큰도 **최소·비저장** 원칙 (PR170) |
| 문서 | 본 문서 | [PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md](./PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md), `lib/ops/payment-feasibility.ts` |

현행: `app/checkout`, `app/billing`, subscription/webhook route **없음** (`tests/regression/pre-beta-gate.test.ts` 등으로 유지).

---

## 13. No-Go 기준

- 공식 출처 없는 카드납 정보 **public 노출**
- 카드납 가능/불가 **확정** 표현 (출처·검수 없이)
- 보험사별 카드납·납입 조건 **임의 작성**
- 고객 결제정보·카드번호·CVC·계좌번호 **저장**
- 계약번호·보험증권 번호 저장
- 외부 사이트 카드납 목록 **복제**
- 단톡방/캡처/블로그를 **공식 출처**로 사용
- 문서 PR에 **schema migration** 포함
- PlannerDesk **PG·checkout·billing·webhook** 코드 추가
- public visibility guard **약화**
- package.json / lockfile / 신규 PG SDK

---

## 14. 후속 PR 후보

| 우선순위 | 후보 PR | 목적 | 위험도 |
| ---: | --- | --- | --- |
| 1 | PR-BS-08A Official Payment Info Policy | 카드납·납입 공식 출처 정책 고도화 | Low |
| 2 | PR-BS-08B Payment Info Admin Review UI | Admin 검수 UI 설계 (데이터 입력은 검수 후) | Medium |
| 3 | PR-BS-08C Payment Info Data Model Review | Insurer 확장 vs 별도 모델·schema 필요성 | **High** |
| 4 | PR-BS-08D Planner-only Payment Info UX | 검수 완료 정보 planner-only 표시 | Medium~High |
| 5 | PR-BS-08E Public Payment Info Boundary | public 노출 가능 범위·copy 재검토 | **High** |
| 6 | PR-BS-09 Code Search Boundary Review | (BS-01 로드맵) 상병/수술 코드 planner-only | High |
| — | PR175 Payment Provider Comparison | PlannerDesk **PG** 후보 (본 PR과 별도) | High |

---

## 15. 최종 결론

PR-BS-08은 보험사별 카드납·납입 **참고 정보**의 필요성·위험도·출처·노출·검수 기준을 문서로 고정한 **검토 PR**이다. 실제 데이터 추가·schema 변경·PlannerDesk PG 구현은 포함하지 않는다.

현행 PlannerDesk에는 Insurer `cardPayment*` 필드와 디렉터리 UI가 있으나, **새 보험사 카드납 데이터를 이번 PR에서 추가하거나 외부에서 가져오지 않는다.** 공식 출처·Admin 검수·최신성 표시가 갖춰진 후속 PR에서만 단계적으로 확장한다.

PlannerDesk **유료 결제(PG)** 는 PR175/PR170 계열로 분리하며, 고객 결제정보는 어떤 맥락에서도 PlannerDesk에 저장하지 않는다.

---

## 부록: 현행 코드·schema 조사 (변경 없음)

| 항목 | 존재 | 위치 |
| --- | --- | --- |
| 카드납 enum/필드 | O | `prisma/schema.prisma` — `CardPaymentStatus`, `cardPayment*` |
| Public projection | O | `lib/public/insurers.ts` |
| 디렉터리 UI | O | `components/directory/insurer-action-card.tsx` |
| 제보 토픽 | O | `lib/correction-request/pii-guard.ts` — “카드납 가능 여부 오류” |
| PlannerDesk checkout/billing | **X** | route 없음 |
| PG SDK (package.json) | **X** | 미설치 |
| PlannerDesk PG 문서 | O | PR-170, `lib/ops/payment-feasibility.ts` |
