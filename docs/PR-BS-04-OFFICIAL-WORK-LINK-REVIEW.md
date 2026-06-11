# PR-BS-04 Official Work Link Review

**위험도:** High · **성격:** 보험사 업무 링크 **공식 출처 검수 workflow 설계** — 데이터 추가·schema·코드 변경 없음

선행: [PR-BS-01 Feature Benchmark Report](./PR-BS-01-FEATURE-BENCHMARK-REPORT.md), [PR-BS-02 Data Freshness UX](./PR-BS-02-DATA-FRESHNESS-UX.md), [PR-BS-03 Search & Filter Refinement](./PR-BS-03-SEARCH-FILTER-REFINEMENT.md)

관련 기존 문서:

- [INSURER_ACTION_FIELD_EXPANSION_PLAN.md](./INSURER_ACTION_FIELD_EXPANSION_PLAN.md) — 보험사 action field·거버넌스
- [PR-128-WORK-LINKS-OPS.md](./PR-128-WORK-LINKS-OPS.md) — 업무 링크 유형·접근 안내
- [PR-161-DATA-FRESHNESS-REVIEW-OPS.md](./PR-161-DATA-FRESHNESS-REVIEW-OPS.md) — 최신성·공식 출처 ops
- [PR-168-DATA-CORRECTION-WORKFLOW-OPS.md](./PR-168-DATA-CORRECTION-WORKFLOW-OPS.md) — 오류 제보·수정 workflow
- [PR-168-OFFICIAL-SOURCES.md](./PR-168-OFFICIAL-SOURCES.md) — 공식 출처 우선순위

---

## 1. 목적

PlannerDesk는 보험사 **전산 사이트, 고객센터, 청구 팩스, 업무 링크, 카드납/납입** 등 설계사 실무 정보를 단계적으로 확장할 수 있다.

단, 다음 원칙을 지킨다.

- **공식 출처 확인 없이** public 또는 planner에 노출하지 않는다.
- 외부 아카이브·경쟁 사이트의 **링크 목록·번호·문구를 복제하지 않는다.**
- 보험사별 정보는 **보험사 공식 안내** 기준으로 별도 확인·검수 후 반영한다.

**PR-BS-04는 실제 데이터 추가 PR이 아니라**, 향후 데이터 추가 PR에서 지켜야 할 **검수 기준·노출 기준·No-Go**를 문서화하는 작업이다.

---

## 2. 이번 PR의 범위

| 포함 | 제외 |
| --- | --- |
| 공식 출처 검수 workflow 설계 | 보험사 링크·번호 실제 입력 |
| 정보 유형별 위험도 분류 | DB schema·migration |
| Public / Planner / Admin 노출 기준 | public visibility guard 변경 |
| Admin 검수 단계 제안 | Auth/RBAC 변경 |
| 최신성·출처 표시 기준 (문서) | 크롤링·자동 동기화 |
| 오류 제보 workflow 연계 기준 | 외부 사이트 데이터 수집 |
| 데이터 모델 **검토 후보** (문서만) | 기능 코드 수정 |
| 후속 PR-BS-04A~D 후보 정리 | |

---

## 3. 이번 PR에서 하지 않는 것

- 보험사 링크 **추가하지 않음**
- 고객센터 번호 **추가하지 않음**
- 팩스 번호 **추가하지 않음**
- 카드납/납입 정보 **추가하지 않음**
- 청구서류 파일·원문 **추가하지 않음**
- DB schema **변경하지 않음**
- public 노출 정책 **변경하지 않음**
- 외부 사이트 데이터 **가져오지 않음**
- `lastVerifiedAt`·`officialSourceUrl`·검수 상태 **임의 부여하지 않음**

---

## 4. 공식 출처 기준

### 4-1. 우선 공식 출처 (유형별)

| 정보 유형 | 우선 공식 출처 |
| --- | --- |
| 보험사 대표 홈페이지 | 보험사 공식 홈페이지 |
| 전산/업무 포털 | 보험사 또는 GA **공식** 업무 공지·포털 안내 |
| 청구서류 | 보험사 공식 청구 안내 페이지·공식 양식 URL |
| 고객센터 | 보험사 공식 고객센터·문의 안내 페이지 |
| 팩스 번호 | 보험사 공식 청구/고객센터 안내 |
| 카드납/납입 | 보험사 공식 납입 안내, 약관, 공시·공지 |
| 공시·약관 | 생명보험협회·손해보험협회·보험사 공시 |
| 업무 변경사항 | 보험사 공식 공지 또는 관리자 대조 확인 |

PlannerDesk 기존 우선순위는 [PR-168-OFFICIAL-SOURCES.md](./PR-168-OFFICIAL-SOURCES.md) 및 `OFFICIAL_SOURCE_PRIORITY`(PR-161)와 정렬한다.

### 4-2. 단독 공식 출처로 사용하지 않는 것

- 블로그, 카페, 커뮤니티, 외부 아카이브 사이트
- 캡처 이미지·스크린샷만 있는 자료
- 사용자 제보 단독 (오류 **후보**로만 접수)
- 내부 검수 메모 단독 (공식 URL 대조 후 보조만)

### 4-3. 출처 기록 필드 (현행·검토)

| 필드/개념 | 현재 PlannerDesk | PR-BS-04 활용 |
| --- | --- | --- |
| `officialSourceUrl` | ClaimDocument 등 일부 | 링크·서류·공시에 우선 기록 |
| `sourceUrl` | 일부 도메인 | 보조 출처·레거시 정렬 |
| `lastVerifiedAt` | Insurer, ClaimDocument, Disclosure 등 | 검수 완료 시각 기록 |
| `verificationStatus` | Insurer·ClaimDocument (Prisma) | public 게이트 (`verified`, `needs_review`) |

> `reviewStatus`는 본 문서에서 **검토 후보 용어**로만 사용한다. 런타임 public 게이트는 기존 `verificationStatus` + `isPublished`를 유지한다.

---

## 5. 정보 유형별 위험도

| 정보 유형 | 위험도 | 이유 |
| --- | --- | --- |
| 보험사 공식 홈페이지 | Medium | URL·도메인 변경 가능 |
| 전산 사이트 링크 | **High** | 접근 권한·보안·URL 변경·오접속 |
| 고객센터 번호 | **High** | 번호 오류 시 업무 혼선·고객 피해 |
| 팩스 번호 | **High** | 오발송·개인정보 유출 위험 |
| 청구서류·양식 링크 | **High** | 보험사 정책·양식 변경 빈번 |
| 카드납/납입 정보 | **High** | 상품·채널·조건별 상이, 오안내 리스크 |
| 업무 링크(work_link) | **High** | 외부 URL·로그인 필요·접근 제한 |
| 내부 메모 (`notes`, private review) | **Critical** | public/planner 노출 금지 |
| 검수 전 데이터 | **Critical** | public 노출 금지 |
| 보험금/청구 가능성 판단 | **Critical** | 확정 표현·오해 금지 |

현행 코드 참고 (변경 없음):

- 보험사 public projection: `lib/public/insurers.ts` — `notes`·`sourceNote` 미노출
- 업무 링크 검색: `lib/search/work-links-search.ts` — published insurer + `PUBLIC_VERIFICATION_STATUSES` only
- Work Tools: planner-gated (`getWorkToolsAccess`) — public 검색·노출과 분리

---

## 6. Public / Planner / Admin 노출 기준

| 정보 유형 | Public | Planner | Admin |
| --- | --- | --- | --- |
| 보험사 공식 홈페이지 | 가능 후보 | 가능 | 관리 |
| 공식 청구 안내 | 가능 후보 | 가능 | 관리 |
| 전산 사이트 링크 | **신중** | 가능 | 관리 |
| 고객센터 번호 | **신중** | 가능 | 관리 |
| 팩스 번호 | **신중 또는 제한** | 가능 | 관리 |
| 카드납/납입 정보 | **신중 또는 제한** | 가능 | 관리 |
| 검수 전 데이터 | **금지** | **금지** | 가능 |
| 내부 메모 | **금지** | **금지** | 가능 |
| 오류 제보 원문(PII) | **금지** | **제한** | 관리 |
| `officialSourceUrl` | 가능 후보 (검수 후) | 가능 | 관리 |
| `lastVerifiedAt` | 가능 후보 | 가능 | 관리 |

### 원칙

1. **Public:** 공식 출처가 있고, `isPublished` + 허용 `verificationStatus`를 통과한 정보만 노출한다. (`lib/public/*`, `isPublishedContentPubliclyVisible`)
2. **Planner:** 업무용 정보 범위가 넓을 수 있으나, 공식 출처·최신성 표시·오안내 방지 copy는 동일하게 적용한다. Work Tools·Answer Assistant는 별도 gate 유지.
3. **Admin:** 검수 전·내부 메모·제보 원문이 있을 수 있으나 **public으로 유출되면 안 된다.**

---

## 7. Admin 검수 workflow

### 7-1. 제안 단계

| 단계 | 작업 | 담당 |
| ---: | --- | --- |
| 1 | 후보 정보 등록 (링크·번호·유형) | Content admin |
| 2 | `officialSourceUrl` (또는 동등 공식 URL) 입력 | Content admin |
| 3 | 정보 유형·위험도 분류 | Content admin / reviewer |
| 4 | 공식 출처 대조·충돌 확인 | Reviewer |
| 5 | 1차 검수 (정확성·노출 범위) | Reviewer |
| 6 | `lastVerifiedAt` 기록 | Reviewer |
| 7 | `verificationStatus` / 검토용 `reviewStatus` 설정 | Publisher |
| 8 | public / planner 노출 범위 결정 (`isPublished`) | Publisher |
| 9 | 변경 이력·출처 URL 보존 | Admin ops |
| 10 | 오류 제보 발생 시 **재검수** 큐 | Admin ops |

### 7-2. reviewStatus 검토 후보 (schema 미추가)

```
draft
needs_review
verified
published
stale
retired
rejected
```

현행 Prisma `VerificationStatus` 및 publish guard와 **용어 정렬**은 후속 PR-BS-04C에서 검토한다. PR-BS-04에서는 enum·migration을 추가하지 않는다.

### 7-3. 위험도별 검수 강도

| 위험도 | 최소 검수 |
| --- | --- |
| Medium | 공식 URL 1곳 + `lastVerifiedAt` |
| High | 공식 URL 1곳 이상 + 교차 확인 + 번호/URL 재확인 주기 명시 |
| Critical | public 노출 **금지** 또는 법무·도메인 No-Go 검토 (PR-174) |

### 7-4. 기존 Admin·ops 연계

- Admin 보험사 CRUD: `app/admin/insurers/**`
- 공개 게이트: `app/admin/insurers/visibility.ts` ↔ `lib/public/insurers.ts`
- Freshness ops: `AdminDataFreshnessReviewPanel`, PR-161
- Correction workflow: PR-168, `/admin/corrections`

---

## 8. 최신성 표시 기준

PR-BS-02 `DataFreshnessMeta` / `lib/public/data-freshness.ts`와 정렬한다.

| 상태 | 사용자 표시 (예) |
| --- | --- |
| 최근 검수 완료 | 최근 확인: YYYY.MM.DD |
| 출처 있음 | 공식 출처 확인 (링크) |
| 오래된 정보 | 재확인 필요 (admin 판단, public copy는 확정 금지) |
| 출처 없음 | 공식 출처 확인 필요 |
| 검수 전 | public 노출 금지 |
| 폐기/중단 | 사용 중단 또는 노출 제외 (admin) |

### 금지 문구 (public·planner UI)

- 항상 최신
- 100% 정확
- 공식 확정
- 이 정보만 보면 됩니다
- 이 번호로만내면 됩니다
- 이 서류만 내면 됩니다
- 청구 가능 확정
- 보험금 지급 확정

날짜·URL이 없으면 **임의 생성하지 않고** “확인일 정보 부족” / “공식 출처 확인 필요”로 표시한다.

---

## 9. 오류 제보·수정 요청 연계

### 9-1. 연계 문서·구현 (현행)

- [PR-168-DATA-CORRECTION-WORKFLOW-OPS.md](./PR-168-DATA-CORRECTION-WORKFLOW-OPS.md)
- `lib/ops/data-correction-workflow.ts` — workflow SSOT (DB 수정 없음)
- Public: `correction-request-dialog`, `PublicErrorReportNotice`
- Admin: `/admin/corrections`

### 9-2. PR-177 (Support Operations Design) 연계

PR-177은 **고객지원 운영 설계** 후속(조건부)이다. PR-BS-04 workflow는 PR-177에서 **SLA·에스컬레이션·운영 인박스**가 정의될 때 연결하며, PR-BS-04 자체는 운영 도구를 구현하지 않는다.

### 9-3. 제보 시 수집 가능 (비식별)

- 문제가 발생한 화면 (directory / claim / search 등)
- 보험사명
- 정보 유형 (전산·고객센터·팩스·청구·카드납 등)
- 문제 유형 (URL 깨짐, 번호 오류, 구버전 등)
- 기대 정보 (간단 설명)
- 확인한 **공식 출처 URL**

### 9-4. 수집 금지 (PII·민감)

- 고객명, 주민번호, 연락처, 주소
- 계약번호, 보험증권 번호
- 병력, 진단명 원문, 상담 원문 전체
- 계좌정보
- 신분증/진단서/보험증권 이미지
- secret, token, API key

제보는 **수정 후보**로만 접수하며, 공식 출처 대조 없이 live 데이터를 자동 반영하지 않는다 (PR-168 원칙).

---

## 10. 데이터 모델 검토 후보

> **검토 수준만.** PR-BS-04에서 Prisma schema·migration **변경 없음**.

| 후보 필드/개념 | 용도 | 노출 |
| --- | --- | --- |
| `workLinkType` | 전산·포털·청구·약관 등 유형 | public 메타 |
| `officialSourceUrl` | 공식 근거 URL | public 가능 |
| `sourceLabel` | 출처 표시명 | public 가능 |
| `lastVerifiedAt` | 최근 확인일 | public 가능 |
| `reviewStatus` | 검수 lifecycle (용어 정렬) | admin; public는 mapped status만 |
| `visibilityScope` | public / planner / admin | admin |
| `riskLevel` | Medium / High / Critical | admin |
| `reviewedBy` | 검수자 (내부) | admin only |
| `reviewNotePrivate` | 내부 검수 메모 | **admin only — public/planner 금지** |
| `retiredAt` | 폐기·중단 시각 | admin |
| `correctionRequestCount` | 제보 누적 (ops) | admin |

현행 Insurer action fields (`systemUrl`, `customerCenterPhone`, `claimFaxNumber`, `cardPaymentStatus` 등)는 [INSURER_ACTION_FIELD_EXPANSION_PLAN.md](./INSURER_ACTION_FIELD_EXPANSION_PLAN.md) 참고.

---

## 11. No-Go 기준

다음은 **데이터 추가 PR** 및 **운영 반영** 전 차단 조건이다.

| No-Go | 사유 |
| --- | --- |
| 공식 출처 없는 정보 public 노출 | 신뢰·법무 리스크 |
| 검수 전 데이터 public 노출 | visibility guard 위반 |
| 팩스·고객센터 번호 임의 추가 | High 오안내 |
| 카드납 조건 임의 추가 | High·법무 |
| 외부 사이트 링크 목록 복제 | 저작권·데이터 거버넌스 |
| 내부 메모 public 노출 | Critical |
| 보험금 지급/청구 가능성 확정 표현 | Critical (PR-174 No-Go) |
| PII 포함 오류 제보 원문 저장 | GDPR·운영 리스크 |
| 문서 PR에 schema 변경 포함 | 범위 분리 위반 |
| public visibility guard 약화 | Critical |
| 크롤링·자동 동기화로 live 반영 | PR-161/168 금지 |
| Work Tools / AA gate 우회 | RBAC 위반 |

---

## 12. 후속 PR 후보

| 우선순위 | 후보 PR | 목적 | 위험도 |
| ---: | --- | --- | --- |
| 1 | PR-BS-04A Official Source Policy | 공식 출처·검수 기준 문서 고도화 | Low |
| 2 | PR-BS-04B Work Link Admin Review UI | 업무 링크 검수 Admin UI 설계 | Medium |
| 3 | PR-BS-04C Work Link Data Model Review | 데이터 모델 변경 필요성 검토 | High |
| 4 | PR-BS-04D Verified Work Link Public UX | 검수 완료 링크만 public/planner 표시 | Medium |
| 5 | PR-BS-05 Correction Flow Hardening | 오류 제보·PII 차단 강화 | Medium |

로드맵 연계: PR-BS-08 Card Payment Info Model Review, PR-177 Support Operations Design (조건부).

---

## 13. 최종 결론

- PlannerDesk는 보험사 업무 링크를 **실무에 맞게 확장할 수 있으나**, 공식 출처 검수 없이는 public/planner에 노출하지 않는다.
- PR-BS-04는 **workflow·위험도·노출·No-Go**를 정리한 **문서 PR**이며, 링크·번호·카드납 데이터 추가·schema·코드 변경은 포함하지 않는다.
- 현행 `lib/public/*` visibility, PR-168 correction, PR-BS-02 freshness UX를 **후속 데이터 PR의 필수 선행 조건**으로 본다.
- 다음 권장: **PR-BS-05** (제보·PII) 또는 **PR-BS-04B** (Admin 검수 UI 설계) — 운영 준비도에 따라 선택.

---

## 부록: 현행 구조 조사 요약 (코드 변경 없음)

| 항목 | 존재 | 주요 위치 | PR-BS-04 반영 |
| --- | --- | --- | --- |
| `officialSourceUrl` | ✅ | ClaimDocument, search mapping | 출처 기록 필수 |
| `sourceUrl` | ✅ | 일부 content·AA retrieval | 보조 출처 |
| `lastVerifiedAt` | ✅ | Insurer, ClaimDocument, Disclosure | 검수일 기록 |
| `verificationStatus` | ✅ | Prisma, public guard | 검수 게이트 |
| `reviewStatus` (용어) | 검토 후보 | — | §7.2 |
| 보험사 업무 링크 | ✅ | `insurer-action-card`, `work-links.ts` | High 검수 |
| 고객센터 | ✅ | `customerCenterPhone`, `helpdeskPhone` | High |
| 팩스 | ✅ | `claimFaxNumber`, `claimFaxHandlingType` | High |
| 카드납/납입 | ✅ | `cardPayment*` enums | High·법무 |
| 오류 제보 | ✅ | PR-168, correction dialog | 재검수 연계 |
