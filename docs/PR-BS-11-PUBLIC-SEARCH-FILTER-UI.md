# PR-BS-11 Public Search Filter UI Implementation

**위험도:** Medium · **성격:** public 통합 검색 필터·카테고리·빈 상태 UX — 검색 범위·schema 변경 없음

선행: [PR-BS-10 Data Freshness UI](./PR-BS-10-DATA-FRESHNESS-UI.md), [PR-BS-03 Search Filter](./PR-BS-03-SEARCH-FILTER-REFINEMENT.md)

---

## 1. 목적

public 통합 검색에서 보험사·청구서류·공시·지식·업무 링크 후보를 **카테고리 badge·도메인 필터·안전한 빈 상태**로 탐색하기 쉽게 한다.

검색 범위를 새로 넓히지 않으며, 기존 `lib/search/public.ts` visibility guard를 유지한다.

---

## 2. Public search 허용·금지

### 허용

| 도메인 | badge |
| --- | --- |
| insurer | 보험사 |
| claim_document | 청구서류 |
| disclosure_link | 공시·약관 |
| knowledge_article | 지식 아카이브 |
| message_template | 고객문구 |
| work_link | 업무 링크 |

### 금지

Work Tools, 상병/수술 코드 검색, Answer Assistant, Admin 데이터, 미검수·비공개, admin memo, 고객정보·민감정보

---

## 3. UX 구성

| 영역 | 구현 |
| --- | --- |
| 필터/tabs | `SearchDomainFilter` + `PUBLIC_SEARCH_FILTER_OPTIONS` |
| 카테고리 badge | `SEARCH_DOMAIN_BADGE_CLASS` per result card |
| 검색 전 안내 | `SearchIdlePanel` + form PII·freshness notice |
| 빈 상태 | `SearchEmptyPanel` + correction hint |
| 최신성 | `DataFreshnessMeta` (PR-BS-10) on insurer/claim/disclosure/work_link |

---

## 4. 안전 문구

- `SEARCH_IDLE_PII_NOTICE`, `SEARCH_FORM_FRESHNESS_NOTICE`
- `SEARCH_EMPTY_PII_NOTICE`, `SEARCH_FORBIDDEN_PHRASES`
- 금지: 100% 보장, 청구/지급 확정, 고객명·계약번호 입력 유도

---

## 5. 구현 파일

| 영역 | 파일 |
| --- | --- |
| 페이지 | `app/search/page.tsx`, `app/search/search-results.tsx` |
| 컴포넌트 | `components/search/search-domain-filter.tsx`, `search-idle-panel.tsx`, `search-empty-panel.tsx` |
| copy | `lib/search/constants.ts`, `lib/search/labels.ts` |
| fetch | `lib/search/public.ts`, `lib/search/work-links-search.ts` |
| 테스트 | `tests/public/search-filter.test.ts` |

---

## 6. 검증

```bash
npm run lint
npm run typecheck
npm run test
npm run test:public
```

schema·migration·package·Auth/RBAC 변경 **없음**.
