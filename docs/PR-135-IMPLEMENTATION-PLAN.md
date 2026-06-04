# PR-135 — 구현 계획 (PR135-A)

## 진입 조건 (PR130~134)

| 항목 | 판단 |
| --- | --- |
| PR130 즐겨찾기 근거 | 로드맵 PR135 순위·반복 업무 절감 |
| PR131 대시보드 진입점 | 홈 허브·빠른 실행 카드 |
| PR132 검색 구조 | `GlobalSearchResult.id` + 도메인 타입 |
| PR134 링크 신뢰 | 수동 점검·확인 필요 단정 금지 |
| Critical/High | schema favorites 없음 → migration 회피 |
| DB/Auth | **이번 PR 영향 없음** |

**진행 가능:** 예 (B안)

## 구현 분기

- **선택:** B안 — client-only 확장
- **DB migration:** 불필요 (중단 조건 해당 없음)
- **별도 PR:** PR-135-B (서버 저장 시)

## 반영 항목

- 보험사 (기존 + 홈 집계)
- 청구서류 (신규 local id)
- 지식 (신규 local id)
- 업무 도구 (기존 + 홈 동기화 이벤트)
- 홈 `PlannerWorkFavoritesPanel`
- 검색 토글 (insurer / claim / knowledge)

## 보류

- 검색어·메모·work_link·admin·AA

## 수정 파일 (요약)

- `lib/planner-favorites/*`
- `hooks/useLocalIdFavorites.ts`
- `components/dashboard/planner-work-favorites-panel.tsx`
- `components/planner-favorites/*`
- `components/search/search-result-favorite-toggle.tsx`
- `app/home-client.tsx`, claim/knowledge/search/directory/work-tools

## 수정 금지

- `prisma/schema.prisma`, auth, allowlist, public WHERE, 운영 데이터

## 검증

`npm run lint` · `typecheck` · `test` · `build` (migration 없음)
