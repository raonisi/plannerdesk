# PR-155 — content_admin / super_admin 경계

- `canManageUsers`: super_admin only
- `importDrafts` bulk: superAdmin permission + blocked + validateServerBulkAction 거부
- content_admin: content CRUD·publish 허용, role 관리 차단

코드: `lib/auth/rbac.ts`, `lib/admin/bulk-policies.ts`
