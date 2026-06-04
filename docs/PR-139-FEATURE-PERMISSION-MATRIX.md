# PR-139 — 기능별 권한 매트릭스

**기준:** `lib/auth/rbac.ts` · `lib/auth/access.ts` · `lib/admin/bulk-policies.ts` · `getVerifiedAnswerAssistantAccess` (변경 없음)

| 기능 | public | planner | verified planner | content_admin | super_admin |
| --- | --- | --- | --- | --- | --- |
| 공개 보험사·청구·지식·링크 조회 | 허용 | 허용 | 허용 | 허용 | 허용 |
| 보험사·청구·지식·링크·템플릿 등록/수정 | 금지 | 금지 | 금지 | 허용 | 허용 |
| 공개/비공개 변경 | 금지 | 금지 | 금지 | 허용 | 허용 |
| 검수 승인·검수 대기 조회 | 금지 | 금지 | 금지 | admin | admin |
| 권한·User.role 관리 | 금지 | 금지 | 금지 | **금지** | 허용 (`canManageUsers`) |
| Admin bulk (manageContent) | 금지 | 금지 | 금지 | 허용 | 허용 |
| Admin bulk publish (high) | 금지 | 금지 | 금지 | **허용(코드)** | 허용 |
| importDrafts | 금지 | 금지 | 금지 | **금지** | 정책상 superAdmin·차단 |
| 변경 이력·운영 이슈·리포트·리마인더 | 금지 | 금지 | 금지 | admin | admin |
| Answer Assistant 생성 | 금지 | 금지 | allowlist+gate | admin tester shell | 동일 |

**주의:** content_admin이 `setPublishedTrue` 일괄 공개를 **코드상 수행 가능** — 운영상 super_admin 승인 후 실행 권장 ([PR-139-HIGH-RISK-PERMISSIONS.md](./PR-139-HIGH-RISK-PERMISSIONS.md)).

**UI:** `lib/auth/role-access-matrix.ts` · `AdminRoleAccessPanel`
