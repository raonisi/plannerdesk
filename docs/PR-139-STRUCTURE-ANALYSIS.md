# PR-139 — Auth/RBAC 구조 분석

## role 목록 (Prisma `Role` enum · rbac.ts)

- `super_admin` · `content_admin` · `moderator` · `verified_planner` · `anonymous_public`

## session role 확인

- `auth()` → `session.user.role` · `normalizeRole()` invalid → `anonymous_public`

## RBAC helper (`lib/auth/rbac.ts`)

- `canAccessAdmin` · `canManageContent` · `canPublishContent` · `canManageUsers` (super only)
- `ADMIN_PERMISSION_MATRIX`

## access guard (`lib/auth/access.ts`)

- `getAdminAccess` — layout
- `requireAdminAccess` · `requireContentManagerAccess` · `requirePublisherAccess` · `requireSuperAdminAccess`

## admin layout guard

- `app/admin/layout.tsx` — locked / denied / children

## verified planner

- Prisma `PlannerVerification` + `User.role` · AA: `getVerifiedAnswerAssistantAccess`

## content_admin vs super_admin

| | content_admin | super_admin |
| --- | --- | --- |
| /admin | ✓ | ✓ |
| manageUsers | ✗ | ✓ |
| bulk importDrafts | ✗ (policy) | superAdmin permission |
| bulk setPublishedTrue | ✓ (코드) | ✓ |

## Admin bulk

- `lib/admin/bulk-policies.ts` — `roleHasPermission` · `validateServerBulkAction`
- Domain actions: `requirePublisherAccess` / admin session

## public visibility

- `lib/public/*` · `PUBLIC_*_WHERE` · search `public.ts`

## Answer Assistant

- `verified-access.ts` · `allowlist.ts` · `feature-gate.ts` — PR137 강화, allowlist 미확대

## 테스트

- `tests/admin/bulk-safety.test.ts` · `tests/ops/pr123-admin-operations.test.ts` · **PR139** `tests/ops/pr139-role-access.test.ts`

## cron / notification

- 없음 (PR138 동일)

## 정보 부족

- production 계정별 role 배정 목록 (운영자 수동)
