/**
 * Role and route access matrix copy (PR-139). Documents existing RBAC — does not change permissions.
 */

import {
  ADMIN_PERMISSION_MATRIX,
  ROLE_ANONYMOUS_PUBLIC,
  ROLE_CONTENT_ADMIN,
  ROLE_MODERATOR,
  ROLE_SUPER_ADMIN,
  ROLE_VERIFIED_PLANNER,
  type PlannerDeskRole,
} from "@/lib/auth/rbac";

export const ROLE_ACCESS_INTRO =
  "아래는 현재 코드 기준 역할별 접근 범위입니다. UI 숨김이 아니라 서버 측 guard(getAdminAccess, require*Access, getPublic*, bulk policy)를 기준으로 합니다.";

export const ROLE_ACCESS_NO_CHANGE_NOTICE =
  "이번 PR139-A에서는 사용자 role 데이터·Auth provider·Prisma schema·allowlist를 변경하지 않습니다.";

export const ROLE_ACCESS_FORBIDDEN_DOC_CONTENT =
  "권한 문서·테스트에 고객정보·상담 원문·secret·token·env·API key 값을 포함하지 않습니다.";

export type AccessCell = "allow" | "deny" | "conditional" | "admin_only";

export type RoleAccessRow = {
  id: string;
  label: string;
  description: string;
  cells: Record<
    "public" | "planner" | "verified" | "content_admin" | "super_admin",
    AccessCell
  >;
  serverGuard: string;
  docAnchor: string;
};

/** Feature-level matrix aligned with lib/auth/rbac.ts and bulk-policies.ts (as-is). */
export const FEATURE_ACCESS_ROWS: readonly RoleAccessRow[] = [
  {
    id: "public-directory",
    label: "공개 보험사·청구·지식·링크 조회",
    description: "getPublic* · PUBLIC_*_WHERE",
    cells: {
      public: "allow",
      planner: "allow",
      verified: "allow",
      content_admin: "allow",
      super_admin: "allow",
    },
    serverGuard: "lib/public/*",
    docAnchor: "PR-139-PUBLIC-VISIBILITY-RBAC.md",
  },
  {
    id: "content-crud",
    label: "보험사·청구·지식·링크·템플릿 등록/수정",
    description: "canManageContent",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "allow",
      super_admin: "allow",
    },
    serverGuard: "requireContentManagerAccess",
    docAnchor: "PR-139-FEATURE-PERMISSION-MATRIX.md",
  },
  {
    id: "publish",
    label: "공개/비공개 상태 변경",
    description: "canPublishContent · requirePublisherAccess",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "allow",
      super_admin: "allow",
    },
    serverGuard: "requirePublisherAccess",
    docAnchor: "PR-139-FEATURE-PERMISSION-MATRIX.md",
  },
  {
    id: "review-queue",
    label: "검수 대기·정정 제보·검증 대기",
    description: "admin dashboard snapshot",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "admin_only",
      super_admin: "admin_only",
    },
    serverGuard: "getAdminAccess + /admin",
    docAnchor: "PR-131-DASHBOARD-OPS.md",
  },
  {
    id: "ops-report",
    label: "관리자 운영 리포트",
    description: "AdminOperationsReportPanel",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "admin_only",
      super_admin: "admin_only",
    },
    serverGuard: "getAdminAccess",
    docAnchor: "PR-136-ADMIN-OPS-REPORT-OPS.md",
  },
  {
    id: "ops-reminder",
    label: "운영 리마인더",
    description: "AdminOperationsReminderPanel",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "admin_only",
      super_admin: "admin_only",
    },
    serverGuard: "getAdminAccess",
    docAnchor: "PR-138-OPERATIONS-REMINDER-OPS.md",
  },
  {
    id: "change-history",
    label: "변경 이력(메타데이터)",
    description: "admin metadata panel",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "admin_only",
      super_admin: "admin_only",
    },
    serverGuard: "getAdminAccess",
    docAnchor: "PR-133-CHANGE-HISTORY-OPS.md",
  },
  {
    id: "admin-bulk",
    label: "Admin bulk (일괄 검수·공개 등)",
    description: "bulk-policies · validateServerBulkAction",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "conditional",
      super_admin: "allow",
    },
    serverGuard: "roleHasPermission + domain actions",
    docAnchor: "PR-139-HIGH-RISK-PERMISSIONS.md",
  },
  {
    id: "user-role-mgmt",
    label: "권한·사용자 role 관리",
    description: "canManageUsers",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "deny",
      content_admin: "deny",
      super_admin: "allow",
    },
    serverGuard: "requireSuperAdminAccess",
    docAnchor: "PR-139-HIGH-RISK-PERMISSIONS.md",
  },
  {
    id: "answer-assistant",
    label: "Answer Assistant 생성",
    description: "verified_planner + allowlist + gate",
    cells: {
      public: "deny",
      planner: "deny",
      verified: "conditional",
      content_admin: "conditional",
      super_admin: "conditional",
    },
    serverGuard: "getVerifiedAnswerAssistantAccess",
    docAnchor: "PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md",
  },
] as const;

export type RouteAccessRow = {
  path: string;
  public: AccessCell;
  planner: AccessCell;
  content_admin: AccessCell;
  super_admin: AccessCell;
  guard: string;
};

export const ROUTE_ACCESS_ROWS: readonly RouteAccessRow[] = [
  {
    path: "/",
    public: "allow",
    planner: "allow",
    content_admin: "allow",
    super_admin: "allow",
    guard: "public visibility on data fetches",
  },
  {
    path: "/directory, /claim-documents, /knowledge, /search",
    public: "allow",
    planner: "allow",
    content_admin: "allow",
    super_admin: "allow",
    guard: "getPublic* / lib/search/public.ts",
  },
  {
    path: "/planner/*",
    public: "deny",
    planner: "conditional",
    content_admin: "allow",
    super_admin: "allow",
    guard: "session; planner-specific routes",
  },
  {
    path: "/planner/answer-assistant",
    public: "deny",
    planner: "conditional",
    content_admin: "conditional",
    super_admin: "conditional",
    guard: "getVerifiedAnswerAssistantAccess",
  },
  {
    path: "/admin",
    public: "deny",
    planner: "deny",
    content_admin: "allow",
    super_admin: "allow",
    guard: "app/admin/layout.tsx → getAdminAccess",
  },
  {
    path: "/admin/insurers, /claim-documents, /knowledge, …",
    public: "deny",
    planner: "deny",
    content_admin: "allow",
    super_admin: "allow",
    guard: "requireContentManagerAccess on actions",
  },
  {
    path: "/admin/search",
    public: "deny",
    planner: "deny",
    content_admin: "allow",
    super_admin: "allow",
    guard: "lib/search/admin.ts (no work_link domain)",
  },
  {
    path: "/admin/answer-assistant/*",
    public: "deny",
    planner: "deny",
    content_admin: "allow",
    super_admin: "allow",
    guard: "getAdminAccess; allowlist env 변경은 별도 PR",
  },
] as const;

export const CODE_ROLES: readonly {
  role: PlannerDeskRole;
  label: string;
  purpose: string;
}[] = [
  {
    role: ROLE_ANONYMOUS_PUBLIC,
    label: "일반(public)",
    purpose: "비로그인·미부여 — 공개 콘텐츠만",
  },
  {
    role: ROLE_VERIFIED_PLANNER,
    label: "인증 설계사",
    purpose: "검증 완료 설계사 — AA는 allowlist 조건부",
  },
  {
    role: ROLE_CONTENT_ADMIN,
    label: "콘텐츠 관리자",
    purpose: "/admin 콘텐츠 CRUD·publish·bulk(정책 범위)",
  },
  {
    role: ROLE_SUPER_ADMIN,
    label: "슈퍼 관리자",
    purpose: "content_admin + canManageUsers(향후 UI)",
  },
  {
    role: ROLE_MODERATOR,
    label: "모더레이터(예약)",
    purpose: "향후 커뮤니티 — 현재 admin 아님",
  },
] as const;

export const HIGH_RISK_PERMISSION_ROWS = [
  {
    id: "user-role",
    label: "권한·User.role 변경",
    severity: "Critical",
    rule: "super_admin only · requireSuperAdminAccess",
  },
  {
    id: "bulk-publish",
    label: "일괄 공개(setPublishedTrue)",
    severity: "Critical",
    rule: "publishContent — content_admin·super_admin 모두 가능(운영 주의)",
  },
  {
    id: "bulk-import",
    label: "일괄 등록(importDrafts)",
    severity: "Critical",
    rule: "superAdmin only · validateServerBulkAction 차단",
  },
  {
    id: "aa-allowlist",
    label: "Answer Assistant allowlist",
    severity: "Critical",
    rule: "env allowlist — PR139에서 변경 금지",
  },
  {
    id: "visibility-guard",
    label: "public visibility guard",
    severity: "Critical",
    rule: "PUBLIC_*_WHERE 약화 금지",
  },
] as const;

export const PR139_DEFERRED_ITEMS = [
  "신규 role 추가(reviewer, data_admin 전용 계정)",
  "role 전용 DB table / migration",
  "content_admin bulk publish 분리",
  "권한 관리 UI",
  "Auth provider·세션 구조 변경",
] as const;

export const ACCESS_CELL_LABEL: Record<AccessCell, string> = {
  allow: "허용",
  deny: "금지",
  conditional: "조건부",
  admin_only: "admin",
};

/** Re-export for admin panel — source of truth remains rbac.ts */
export { ADMIN_PERMISSION_MATRIX };
