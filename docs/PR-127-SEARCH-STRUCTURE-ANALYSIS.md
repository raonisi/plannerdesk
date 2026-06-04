# PR-127 — 검색·탐색 구조 분석

정적 코드 기준 (운영 DB 미접근).

## 검색·탐색 구조 분석

| 영역 | 구조 |
| --- | --- |
| **global search** | `app/search/page.tsx` + `search-results.tsx`; `lib/search/public.ts` `searchPublicContent`; 도메인 필터 `lib/search/labels.ts` |
| **보험사 검색** | `app/directory/directory-explorer.tsx` — 초성·보험사명 클라이언트 필터; `?insurer=` 딥링크; `InsurerActionCard` + `InsurerQuickClaimActions` |
| **청구서류 검색** | `claim-document-explorer.tsx` + `claim-forms-filters.tsx`; 보험사·유형·상황 필터; 보험사별 그룹 |
| **지식 아카이브 검색** | `knowledge-archive-list.tsx` + `lib/knowledge/archive-filter.ts`; 카테고리·유형·리스크·검수 필터 |
| **업무 링크 탐색** | 보험사 카드 내 전산·청구·공시 링크; `/disclosure-links` 카테고리 그룹; global search `disclosure_link` 도메인 |
| **public fetch** | `lib/public/insurers.ts`, `claim-documents.ts`, `knowledge-articles.ts`, `disclosure-links.ts`, `message-templates.ts` |
| **public visibility guard** | `lib/public/visibility.ts` + 도메인별 WHERE; `SEARCH_VISIBILITY_SOURCES` in `lib/search/types.ts` |
| **필터 구조** | 통합 검색: 도메인 pill; 청구: 보험사 select + 고급 필터; 지식: URL query 필터; 공시: 분류 pill + 고급 |
| **빈 결과/오류/로딩** | PR127 전: 단문 EmptyState; PR127: `SearchEmptyPanel`, `BrowseNextSteps`, visibility 안내 문구 |
| **모바일 대응** | `flex-col`/`flex-wrap`, `min-w-0`, `sm:` breakpoint on search form·filters·cards |
| **테스트** | `tests/public/directory-claim-ux.test.ts` (PR112); `tests/public/public-visibility.test.ts`; `tests/ops/pr127-search-ux.test.ts` (PR127) |

## 정보 부족 항목

- 실제 운영 DB 검색 결과 스냅샷 (본 PR 미접근)
- 모바일 실기기 스크린 캡처 (Antigravity/운영자 smoke)
