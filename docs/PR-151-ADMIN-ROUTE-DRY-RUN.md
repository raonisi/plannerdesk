# PR-151 — Admin Route Dry Run

`ADMIN_ROUTE_DRY_RUN` 기준.

- `app/admin/layout.tsx` → `getAdminAccess` · `AdminAccessDeniedState`
- public·planner·verified: `canAccessAdmin` false
- content_admin: 콘텐츠 CRUD, `canManageUsers` false
- super_admin: 전체 admin, bulk는 **partial** (PR139·PR149)
- secret·env 실값 UI 노출 금지
