# PR-135 — 기존 즐겨찾기 구조 분석

## Prisma / 서버

| 항목 | 결과 |
| --- | --- |
| `Favorite` / `Bookmark` model | **없음** (`schema.prisma` 검색 0건) |
| user/planner 관계 | **없음** |
| 서버 API 저장 | **없음** |

→ **C안( DB migration 필요)** 해당. 이번 PR135-A에서는 **구현하지 않음**.

## Client-only (기존)

| 영역 | 구현 | 저장 키 |
| --- | --- | --- |
| 보험사 | `hooks/useFavorites.ts`, `/directory` 탭 | `plannerdesk:favoriteInsurers` |
| 업무 도구 | `work-tools-client.tsx` | `plannerdesk.workTools.favorites` |
| 고객 문구 | `message-template-library.tsx` | `plannerdesk.messages.favorites` |
| 홈 최근 | `home-client.tsx` | `plannerdesk.home.recents` (즐겨찾기 아님) |

## PR135-A 신규 (동일 패턴)

| 영역 | 훅/컴포넌트 | 저장 키 |
| --- | --- | --- |
| 청구서류 | `useLocalIdFavorites` + 목록/검색 토글 | `plannerdesk:favoriteClaimDocuments` |
| 지식 | `useLocalIdFavorites` + 카드/검색 토글 | `plannerdesk:favoriteKnowledgeArticles` |
| 홈 통합 | `PlannerWorkFavoritesPanel` | 위 키들 읽기 전용 집계 |

## 미구현 (의도적 보류)

| 영역 | 사유 |
| --- | --- |
| 업무 링크(work_link) | 외부 URL·PR134 확인 필요 링크 — 정상 단정 금지 |
| 검색어 | 고객정보 입력 위험 |
| 관리자 항목 | public/planner 노출 금지 |
| Answer Assistant | 접근 범위 확대 금지 |

## Visibility / RBAC

- 즐겨찾기 **표시**는 서버가 내려준 **공개 카탈로그**와 교집합만 렌더.
- `useFavorites`는 이미 published insurer list 위에서만 필터 (PR-32).
- public fetch / `PUBLIC_*_WHERE` **변경 없음**.

## Dashboard / 검색 UI (PR131·PR132 연계)

- PR131 홈: `PlannerWorkFavoritesPanel`로 보험사·도구·청구·지식 칩 통합.
- PR132 검색: `SearchResultFavoriteToggle` — insurer / claim_document / knowledge_article 만.
