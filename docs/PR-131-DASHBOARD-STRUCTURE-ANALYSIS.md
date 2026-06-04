# PR-131 — 기존 대시보드 구조 분석

## public/home

- Route: `app/page.tsx` → `HomeClient` (`app/home-client.tsx`)
- 데이터: `getPublicInsurers`, `getPublicClaimDocuments`, `getPublicKnowledgeArticles` (PR131에서 지식 추가)
- PR131: 업무 시작 카드, `WorkHubNextSteps`, `HomePublicStatsStrip`, 청구 흐름, AA 베타 안내

## planner dashboard

- 별도 `/planner` 대시보드 route 없음
- 답변 보조: `/planner/answer-assistant` — 서버 `getVerifiedAnswerAssistantAccess` gate 유지
- 홈에서 베타 링크·안내만 추가 (접근 확대 없음)

## admin dashboard

- `app/admin/page.tsx` → `buildAdminDashboardSnapshot` → `AdminShell`
- PR131: `AdminReviewQueuePanel` — 제보·검증 대기·확인 필요 기능 수

## 진입점

| 영역 | Route |
| --- | --- |
| 보험사 | `/directory` |
| 청구서류 | `/claim-documents` |
| 지식 | `/knowledge` |
| 통합 검색 | `/search` |
| 업무 링크·전산 | 보험사 카드·`/directory` (PR128 그룹) |
| 운영 이슈 | 문서(PRP-129), admin 전용 요약 문구 |
| 공시·약관 | `/disclosure-links` |

## Guards

- **public visibility**: `PUBLIC_*_WHERE`, `is*PubliclyVisible` — **미수정**
- **RBAC**: `getAdminAccess` on admin routes — **미수정**

## 모바일

- 홈·카드: `min-[420px]:grid-cols-2`, `lg:grid-cols-3`, `min-w-0`, `break-keep`
- Admin 큐: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

## 정보 부족

- Production OPS/FB 레지스트리 실측치(운영자 기입 전)
- 별도 planner 전용 홈 route 필요 여부(제품 결정)
