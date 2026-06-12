# PR-BS-03 Search & Filter Refinement

**위험도:** Medium · **성격:** public 통합 검색 UX 개선 — 검색 범위 확대·schema 변경 없음

선행: [PR-BS-01](./PR-BS-01-FEATURE-BENCHMARK-REPORT.md), [PR-BS-02](./PR-BS-02-DATA-FRESHNESS-UX.md)

---

## 1. 개선 범위

- 검색 결과 **카테고리 badge** 색상 구분
- **도메인 필터** 상시 표시 (검색 전에는 허브 바로가기)
- **빈 상태**·**검색 전 안내** 문구 강화
- **work_link** 통합 검색 그룹 표시
- **DataFreshnessMeta** 재사용 (보험사·청구·공시·업무 링크)

검색 범위를 새로 넓히지 않으며, 기존 `lib/search/public.ts` visibility guard를 유지한다.

---

## 2. Public search 허용 대상

| 도메인 | 설명 |
| --- | --- |
| insurer | 공개·검수된 보험사 |
| claim_document | 공개 청구서류 |
| knowledge_article | 공개 지식 |
| disclosure_link | 공개 공시·약관 링크 |
| message_template | 공개·safeCopy 고객문구 |
| work_link | 공개 보험사 업무 링크 (published insurer only) |

---

## 3. Public search 금지 대상

- admin-only 데이터, private/internal memo
- 미검수·비공개 레코드
- Work Tools **내부 기능** (planner-gated UI)
- Answer Assistant, usage audit
- 고객정보·민감정보·결제 데이터
- CorrectionRequest (admin search only)

---

## 4. 필터/tabs 기준

`PUBLIC_SEARCH_FILTER_OPTIONS`: 전체 · 보험사 · 청구서류 · 지식 · 공시·약관 · 고객문구 · 업무 링크

- 검색어 있음 → `buildPublicSearchHref`로 domain 필터
- 검색어 없음 → 해당 영역 **허브**로 이동 (전체는 `/search`)

---

## 5. 빈 상태·검색 전 문구

- `SEARCH_EMPTY_TIPS`, `SEARCH_EMPTY_CORRECTION_HINT`
- `SEARCH_IDLE_HINT`, `SEARCH_IDLE_EXAMPLES`, `SEARCH_IDLE_PII_NOTICE`
- 금지: `SEARCH_FORBIDDEN_PHRASES` (100% 보장, 지급 확정 등)

---

## 6. 구현 파일

| 영역 | 파일 |
| --- | --- |
| 페이지 | `app/search/page.tsx` |
| 필터 | `components/search/search-domain-filter.tsx` |
| 검색 전 | `components/search/search-idle-panel.tsx` |
| 빈 상태 | `components/search/search-empty-panel.tsx` |
| 결과 | `app/search/search-results.tsx` |
| copy | `lib/search/constants.ts`, `lib/search/labels.ts` |
| 테스트 | `tests/public/search-filter.test.ts` |

구현 완료·문구 보강: [PR-BS-11 Public Search Filter UI](./PR-BS-11-PUBLIC-SEARCH-FILTER-UI.md)

---

## 7. 후속 PR 후보

| PR | 목적 |
| --- | --- |
| PR-BS-04 | 보험사 업무 링크 검수 workflow |
| PR-BS-05 | 오류 제보·PII 차단 강화 |

---

## 8. 검증

```bash
npm run lint
npm run typecheck
npm run test
```
