/**
 * Admin access regression matrices (PR-155). Static regression criteria — no role/DB changes.
 */

import { PR154_SMOKE_VERDICTS } from "@/lib/ops/public-smoke-expansion";
import { PR149_CRITICAL_RISKS } from "@/lib/ops/security-final-audit";
import {
  PR152_OPERATOR_VERDICTS,
  type OperatorReadiness,
} from "@/lib/ops/beta-operator-checklist";

export const PR155_SCOPE_NOTICE =
  "PR154 이후 admin route 접근 회귀 테스트 기준입니다. 실제 role·allowlist·운영 DB·beta user·외부 공개 변경은 포함하지 않습니다.";

export const PR155_FORBIDDEN_DOC_CONTENT =
  "회귀 테스트·문서에 secret·고객정보·실제 allowlist·운영 DB 연결·실제 관리자 계정을 넣지 않습니다.";

export type RegressionCheckStatus = "pass" | "partial" | "pending" | "fail" | "runtime";

export const REGRESSION_STATUS_LABEL: Record<RegressionCheckStatus, string> = {
  pass: "통과(정적)",
  partial: "부분",
  pending: "대기",
  fail: "실패",
  runtime: "런타임 필요",
};

export const PR155_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr154",
    condition: "PR154 smoke Conditional Ready 이상",
    result: PR154_SMOKE_VERDICTS.smokeExpansionReady,
    met: PR154_SMOKE_VERDICTS.smokeExpansionReady !== "not_ready",
  },
  {
    id: "pr149",
    condition: "PR149 admin 접근 Critical 0(정적)",
    result: "0 open",
    met: true,
  },
  {
    id: "block",
    condition: "PR154 public 접근 차단 smoke 정리",
    result: "static pass",
    met: PR154_SMOKE_VERDICTS.staticSmokePass,
  },
  {
    id: "rbac",
    condition: "Auth/RBAC 구조 확인 가능",
    result: "lib/auth/rbac.ts",
    met: true,
  },
  {
    id: "test",
    condition: "node:test + tsx",
    result: "기존 프레임워크",
    met: true,
  },
  {
    id: "dep",
    condition: "신규 package 불필요",
    result: "없음",
    met: true,
  },
] as const;

/** Admin routes guarded by layout or server actions (as-is codebase). */
export const ADMIN_REGRESSION_TARGETS: readonly {
  area: string;
  purpose: string;
  expected: string;
  staticCheck: string;
  status: RegressionCheckStatus;
}[] = [
  { area: "/admin", purpose: "public/planner 차단", expected: "getAdminAccess", staticCheck: "layout.tsx", status: "pass" },
  { area: "/admin/insurers", purpose: "관리자 보험사 차단", expected: "non-admin denied", staticCheck: "canAccessAdmin", status: "pass" },
  { area: "/admin/claim-documents", purpose: "관리자 청구 차단", expected: "non-admin denied", staticCheck: "require*Access", status: "pass" },
  { area: "/admin/knowledge", purpose: "관리자 지식 차단", expected: "non-admin denied", staticCheck: "actions guard", status: "pass" },
  { area: "Admin bulk (toolbar)", purpose: "일괄 기능 제한", expected: "bulk-policies", staticCheck: "evaluateBulkActionEligibility", status: "pass" },
  { area: "운영 이슈·리포트", purpose: "public 미노출", expected: "admin panels only", staticCheck: "AdminShell", status: "pass" },
  { area: "변경 이력", purpose: "public 미노출", expected: "edit page panels", staticCheck: "AdminChangeHistoryMetadataPanel", status: "pass" },
  { area: "운영 리마인더", purpose: "public 미노출", expected: "admin only", staticCheck: "AdminOperationsReminderPanel", status: "pass" },
  { area: "/planner/answer-assistant", purpose: "AA≠admin", expected: "verified-access", staticCheck: "allowlist 분리", status: "pass" },
  { area: "public search", purpose: "관리자 데이터 미노출", expected: "PUBLIC_*_WHERE", staticCheck: "lib/search/public.ts", status: "pass" },
  { area: "usage audit", purpose: "public 미노출", expected: "/admin/answer-assistant/audit", staticCheck: "route only", status: "pass" },
  { area: "런타임 HTTP admin", purpose: "401/403 without session", expected: "E2E", staticCheck: "test:e2e 부재", status: "runtime" },
] as const;

export const ROLE_ACCESS_EXPECTATIONS: readonly {
  role: string;
  label: string;
  admin: string;
  adminBulk: string;
  opsIssues: string;
  changeHistory: string;
  planner: string;
  answerAssistant: string;
  status: RegressionCheckStatus;
}[] = [
  { role: "public", label: "비로그인(public)", admin: "차단", adminBulk: "차단", opsIssues: "차단", changeHistory: "차단", planner: "차단", answerAssistant: "차단", status: "pass" },
  { role: "planner", label: "일반 planner(미인증)", admin: "차단", adminBulk: "차단", opsIssues: "차단", changeHistory: "차단", planner: "조건부", answerAssistant: "차단", status: "pass" },
  { role: "verified_planner", label: "verified planner", admin: "차단", adminBulk: "차단", opsIssues: "차단", changeHistory: "차단", planner: "조건부", answerAssistant: "allowlist 조건부", status: "pass" },
  { role: "ai_allowlisted", label: "AI allowlisted planner", admin: "차단", adminBulk: "차단", opsIssues: "차단", changeHistory: "차단", planner: "조건부", answerAssistant: "제한 허용", status: "pass" },
  { role: "content_admin", label: "content_admin", admin: "제한 허용", adminBulk: "조건부", opsIssues: "admin", changeHistory: "admin", planner: "조건부", answerAssistant: "자동 허용 아님", status: "pass" },
  { role: "super_admin", label: "super_admin", admin: "허용", adminBulk: "제한 허용", opsIssues: "admin", changeHistory: "admin", planner: "조건부", answerAssistant: "운영 기준", status: "pass" },
] as const;

export const ADMIN_ROUTE_BLOCK_REGRESSION: readonly {
  scenario: string;
  expected: string;
  failGrade: string;
  evidence: string;
  status: RegressionCheckStatus;
}[] = [
  { scenario: "public -> /admin", expected: "차단", failGrade: "Critical", evidence: "canAccessAdmin false", status: "pass" },
  { scenario: "public -> /admin/insurers", expected: "차단", failGrade: "Critical", evidence: "admin layout", status: "pass" },
  { scenario: "public -> /admin/claim-documents", expected: "차단", failGrade: "Critical", evidence: "admin layout", status: "pass" },
  { scenario: "public -> /admin/knowledge", expected: "차단", failGrade: "Critical", evidence: "admin layout", status: "pass" },
  { scenario: "public -> /admin/bulk", expected: "차단", failGrade: "Critical", evidence: "별도 route 없음·layout", status: "pass" },
  { scenario: "planner -> /admin", expected: "차단", failGrade: "Critical", evidence: "rbac deny", status: "pass" },
  { scenario: "verified planner -> /admin", expected: "차단", failGrade: "Critical", evidence: "rbac deny", status: "pass" },
  { scenario: "AI allowlisted -> /admin", expected: "차단", failGrade: "Critical", evidence: "allowlist≠admin", status: "pass" },
  { scenario: "planner -> /admin/bulk", expected: "차단", failGrade: "Critical", evidence: "bulk roleHasPermission", status: "pass" },
  { scenario: "런타임 admin 200 without auth", expected: "없음", failGrade: "Critical", evidence: "test:e2e 부재", status: "runtime" },
] as const;

export const ADMIN_DATA_NON_EXPOSURE: readonly {
  data: string;
  publicExposure: string;
  failGrade: string;
  status: RegressionCheckStatus;
}[] = [
  { data: "운영 이슈", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "변경 이력", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "관리자 리포트", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "운영 리마인더", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "Admin bulk 상태", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "usage audit", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "role/allowlist 정보", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "secret/env/token", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
  { data: "미검수·비공개 데이터", publicExposure: "미노출", failGrade: "Critical", status: "pass" },
] as const;

export const ADMIN_ROLE_BOUNDARY_REGRESSION: readonly {
  test: string;
  expected: string;
  failGrade: string;
  status: RegressionCheckStatus;
}[] = [
  { test: "content_admin 콘텐츠 CRUD", expected: "허용", failGrade: "High", status: "pass" },
  { test: "content_admin canManageUsers", expected: "차단", failGrade: "Critical", status: "pass" },
  { test: "content_admin importDrafts bulk", expected: "차단", failGrade: "Critical", status: "pass" },
  { test: "content_admin role 관리", expected: "차단", failGrade: "Critical", status: "pass" },
  { test: "super_admin canManageUsers", expected: "허용", failGrade: "High", status: "pass" },
  { test: "super_admin secret 출력", expected: "금지", failGrade: "Critical", status: "pass" },
] as const;

export const AA_ADMIN_SEPARATION_REGRESSION: readonly {
  test: string;
  expected: string;
  failGrade: string;
  status: RegressionCheckStatus;
}[] = [
  { test: "AI allowlisted -> /admin", expected: "차단", failGrade: "Critical", status: "pass" },
  { test: "content_admin -> AA 자동 허용", expected: "아님", failGrade: "Critical", status: "pass" },
  { test: "allowlist -> admin 권한", expected: "분리", failGrade: "Critical", status: "pass" },
  { test: "public -> Answer Assistant", expected: "차단", failGrade: "Critical", status: "pass" },
  { test: "verified without allowlist -> AA", expected: "차단", failGrade: "Critical", status: "pass" },
  { test: "usage audit public", expected: "미노출", failGrade: "Critical", status: "pass" },
] as const;

/** Non-admin roles for fixture-based rbac regression (no real users). */
export const NON_ADMIN_ROLE_FIXTURES: readonly {
  id: string;
  role: string | null;
  label: string;
}[] = [
  { id: "anonymous", role: null, label: "비로그인" },
  { id: "public_role", role: "anonymous_public", label: "anonymous_public" },
  { id: "planner_unverified", role: "planner", label: "미인증 planner(정규화)" },
  { id: "verified_planner", role: "verified_planner", label: "verified planner" },
  { id: "moderator", role: "moderator", label: "moderator(비admin)" },
] as const;

export const ADMIN_ROLE_FIXTURES: readonly {
  id: string;
  role: string;
  label: string;
}[] = [
  { id: "content_admin", role: "content_admin", label: "content_admin" },
  { id: "super_admin", role: "super_admin", label: "super_admin" },
] as const;

export const DEFERRED_RUNTIME_REGRESSION: readonly {
  test: string;
  reason: string;
  command: string;
}[] = [
  { test: "HTTP admin without session", reason: "E2E 부재", command: "— (test:e2e)" },
  { test: "planner session admin probe", reason: "세션 mock 필요", command: "—" },
  { test: "allowlist live gate", reason: "env·DB 금지", command: "—" },
] as const;

export const PR155_REGRESSION_VERDICTS = {
  regressionReady: "conditional_ready" as OperatorReadiness,
  pr156Entry: "conditional_ready" as OperatorReadiness,
  staticRegressionPass: true,
  overallUntilCodex: "conditional_ready" as OperatorReadiness,
} as const;

export const PR155_OPEN_CRITICAL_COUNT = 0;

export const PR156_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR156", title: "AA Red-Team Test", purpose: "AI safety", risk: "Critical", codex: "필수" },
  { id: "PR157", title: "Beta Launch Decision", purpose: "실행 여부", risk: "Critical", codex: "필수" },
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Incident Drill", purpose: "장애", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "admin route 차단 테스트 누락",
  "public/planner/verified/allowlisted admin 차단",
  "content_admin/super_admin 경계",
  "destructive bulk 위험",
  "운영 데이터 public 미노출",
  "AA allowlist≠admin",
  "운영 DB·외부 API 미접촉",
  "package/lockfile 부재",
  "PR156 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR155_LINKED_HUBS = [
  "PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md",
  "PR-149-SECURITY-FINAL-AUDIT-OPS.md",
  "PR-139-ROLE-ACCESS-OPS.md",
  "PR-137-ANSWER-ASSISTANT-RESTRICTION-OPS.md",
] as const;

export const PR155_TEST_FILES = [
  "tests/admin/admin-access-regression.test.ts",
  "tests/ops/pr155-admin-access-regression.test.ts",
  "tests/ops/pr139-role-access.test.ts",
  "tests/public/public-visibility.test.ts",
] as const;

/** PR149 reference — admin Critical count for entry gate. */
export const PR149_ADMIN_CRITICAL_NOTE = PR149_CRITICAL_RISKS[0];
