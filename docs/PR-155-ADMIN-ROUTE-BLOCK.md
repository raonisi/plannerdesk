# PR-155 — Admin route 차단

public·planner·verified·AI allowlisted → `/admin` 및 하위 **차단** (Critical 실패).

증거: `app/admin/layout.tsx` → `getAdminAccess`, `canAccessAdmin` in `lib/auth/rbac.ts`.

별도 route 없음: `/admin/bulk`, `/admin/issues`, `/admin/reports`, `/admin/reminders`, `/admin/change-history` — 패널·bulk toolbar로만 존재.
