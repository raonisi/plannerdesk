# PR-132 — 통합 검색 구조 분석

## global search

- Route: `/search` — `app/search/page.tsx`
- Engine: `searchPublicContent` (`lib/search/public.ts`)
- UI: `SearchResultsList`, `SearchEmptyPanel`, domain pills

## 도메인

| 도메인 | Fetch | Visibility |
| --- | --- | --- |
| insurer | prisma + PUBLIC_VERIFICATION_STATUSES | published |
| claim_document | 동일 | published |
| knowledge_article | PUBLIC_KNOWLEDGE_WHERE + tags | published |
| work_link | work-links-search (insurer links) | published insurers |
| disclosure_link | PUBLIC_DISCLOSURE_LINK_WHERE | published |
| message_template | PUBLIC_MESSAGE_TEMPLATE_WHERE + safeCopy | published |

## admin search

- `/admin/search` — `searchAdminContent`, **work_link 미포함**

## PR132 변경

- `work_link` 타입·필터·그룹 순서
- `SEARCH_GROUP_PREVIEW_LIMIT` + 더 보기 href
- 카드 external/tel 링크

## 정보 부족

- Production DB 실검색 latency
- 전체 보험사 keyword-only 링크 검색 상한(30건) 튜닝
