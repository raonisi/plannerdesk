# PR-136 — 기존 관리자 운영 구조 분석

## admin dashboard

| 항목 | 경로·구현 |
| --- | --- |
| Route | `/admin` · `app/admin/page.tsx` |
| Snapshot | `buildAdminDashboardSnapshot()` |
| Shell | `AdminShell` — 기능 카드·bulk·요약 타일 |
| PR131 큐 | `AdminReviewQueuePanel` |
| PR136 | `AdminOperationsReportPanel` |

## admin access guard

- `getAdminAccess()` · `lib/auth/access.ts`
- RBAC: `lib/auth/rbac.ts` — **변경 없음**

## 영역별 admin route

| 영역 | Route |
| --- | --- |
| 보험사 | `/admin/insurers` |
| 청구서류 | `/admin/claim-documents` |
| 지식 | `/admin/knowledge` |
| 공시·링크 | `/admin/disclosure-links` |
| 고객 문구 | `/admin/message-templates` |
| 제보 | `/admin/corrections` |
| 설계사 검증 | `/admin/planner-verifications` |
| 통합 검색 | `/admin/search` |

업무 링크는 보험사 편집·PR128·PR134 문서로 점검 (전용 bulk 링크 테이블 없음).

## 운영 이슈

- 문서: PR129 시리즈
- 코드: Registry 테이블 **없음** — 수동 Registry

## Answer Assistant

- Route: `/planner/answer-assistant` (gate 유지)
- Audit: `AnswerAssistantUsageAudit` only

## Admin bulk safety

- `dashboard-status` bulkWorkflows
- PR123 · PR107 문서

## public visibility

- `lib/public/*` · guards unchanged

## 변경 이력 · 링크

- PR133 metadata panel (no migration)
- PR134 manual link check

## 신규 통계 테이블

**없음** — PR136-B 설계만
