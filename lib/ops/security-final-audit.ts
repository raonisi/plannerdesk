/**
 * Security & access final audit matrices (PR-149). Audit/docs only — no Auth/RBAC/schema changes.
 */

import { AI_LIMITED_BETA_CHECKLIST } from "@/lib/ops/ai-limited-beta-policy";
import { FORBIDDEN_USAGE_AUDIT_FIELDS } from "@/lib/answer-assistant/usage-log";
import {
  ADMIN_PERMISSION_MATRIX,
  ROLE_CONTENT_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_VERIFIED_PLANNER,
} from "@/lib/auth/rbac";

export const PR149_SCOPE_NOTICE =
  "권한·보안·public visibility·Answer Assistant·secret·build/CI 최종 감사입니다. Auth/RBAC 대규모 변경, role·allowlist 실변경, migration, 운영 DB 접근은 포함하지 않습니다.";

export const PR149_FORBIDDEN_DOC_CONTENT =
  "감사 문서·테스트에 secret·token·env·API key·고객정보·allowlist 실값을 넣지 않습니다.";

export type AuditCheckStatus = "met" | "partial" | "gap" | "na";

export type SecurityVerdict = "go" | "conditional_go" | "no_go";

export const ROLE_FINAL_AUDIT_ROWS: readonly {
  role: string;
  allowed: string;
  forbidden: string;
  check: string;
  status: AuditCheckStatus;
}[] = [
  {
    role: "public user",
    allowed: "공개 정보 조회(/, /directory, /search 등)",
    forbidden: "admin·planner AI·운영 데이터",
    check: "getPublic* · admin layout deny",
    status: "met",
  },
  {
    role: "planner (anonymous)",
    allowed: "공개 라우트",
    forbidden: "admin·AI·권한 관리",
    check: "normalizeRole anonymous_public",
    status: "met",
  },
  {
    role: "verified planner",
    allowed: "planner·공개",
    forbidden: "admin·allowlist 밖 AA 생성",
    check: "verified-access.ts",
    status: "met",
  },
  {
    role: "AI allowlisted verified",
    allowed: "제한 AA 생성",
    forbidden: "admin·운영 bulk·allowlist 변경",
    check: "allowlist + gate",
    status: "met",
  },
  {
    role: "content_admin",
    allowed: "콘텐츠 CRUD·publish·/admin",
    forbidden: "canManageUsers·importDrafts bulk",
    check: "ADMIN_PERMISSION_MATRIX",
    status: "partial",
  },
  {
    role: "super_admin",
    allowed: "admin 전체·user role(별도 PR)",
    forbidden: "secret 노출·운영 DB 직접 수정",
    check: "canManageUsers · ops 기준",
    status: "met",
  },
] as const;

export const ROUTE_ACCESS_AUDIT_ROWS: readonly {
  route: string;
  public: string;
  planner: string;
  verified: string;
  content_admin: string;
  super_admin: string;
  status: AuditCheckStatus;
  note: string;
}[] = [
  { route: "/", public: "허용", planner: "허용", verified: "허용", content_admin: "허용", super_admin: "허용", status: "met", note: "public data" },
  { route: "/directory 등 공개", public: "허용", planner: "허용", verified: "허용", content_admin: "허용", super_admin: "허용", status: "met", note: "getPublic*" },
  { route: "/search", public: "허용", planner: "허용", verified: "허용", content_admin: "허용", super_admin: "허용", status: "met", note: "searchPublicContent" },
  { route: "/planner/*", public: "금지(실질)", planner: "조건부", verified: "조건부", content_admin: "허용", super_admin: "허용", status: "met", note: "AA만 존재" },
  { route: "/planner/answer-assistant", public: "금지", planner: "기본 금지", verified: "allowlist", content_admin: "shell", super_admin: "shell", status: "met", note: "verified-access" },
  { route: "/admin", public: "금지", planner: "금지", verified: "금지", content_admin: "허용", super_admin: "허용", status: "met", note: "getAdminAccess" },
  { route: "/admin/insurers 등", public: "금지", planner: "금지", verified: "금지", content_admin: "허용", super_admin: "허용", status: "met", note: "require*Access" },
  { route: "/admin/bulk", public: "금지", planner: "금지", verified: "금지", content_admin: "조건부", super_admin: "허용", status: "partial", note: "별도 route 없음·bulk policy" },
  { route: "/admin/reports", public: "금지", planner: "금지", verified: "금지", content_admin: "—", super_admin: "—", status: "na", note: "/admin 패널만" },
  { route: "/admin/issues", public: "금지", planner: "금지", verified: "금지", content_admin: "—", super_admin: "—", status: "na", note: "패널·문서" },
  { route: "/admin/reminders", public: "금지", planner: "금지", verified: "금지", content_admin: "—", super_admin: "—", status: "na", note: "패널만" },
  { route: "/admin/change-history", public: "금지", planner: "금지", verified: "금지", content_admin: "—", super_admin: "—", status: "na", note: "edit 페이지 패널" },
] as const;

export const PUBLIC_VISIBILITY_AUDIT: readonly {
  item: string;
  criterion: string;
  status: AuditCheckStatus;
  evidence: string;
}[] = [
  { item: "공개 보험사", criterion: "isPublished+검수", status: "met", evidence: "lib/public/insurers.ts" },
  { item: "공개 청구서류", criterion: "isPublished+검수", status: "met", evidence: "lib/public/claim-documents.ts" },
  { item: "공개 지식", criterion: "검수 공개", status: "met", evidence: "getPublicKnowledgeArticles" },
  { item: "공개 링크", criterion: "published only", status: "met", evidence: "disclosure-links public" },
  { item: "검색", criterion: "미검수 미노출", status: "met", evidence: "lib/search/public.ts" },
  { item: "검수 대기·draft", criterion: "public 금지", status: "met", evidence: "visibility.ts" },
  { item: "운영 이슈·리포트·리마인더", criterion: "public 금지", status: "met", evidence: "admin only panels" },
  { item: "Admin bulk 상태", criterion: "public 금지", status: "met", evidence: "no public bulk UI" },
  { item: "usage audit", criterion: "public 금지", status: "met", evidence: "/admin/answer-assistant/audit" },
  { item: "secret/env", criterion: "public 금지", status: "met", evidence: "no env in pages" },
] as const;

export const AA_FINAL_AUDIT: readonly {
  item: string;
  criterion: string;
  status: AuditCheckStatus;
  evidence: string;
}[] = [
  { item: "public 접근", criterion: "차단", status: "met", evidence: "no app/answer-assistant" },
  { item: "일반 planner AA", criterion: "차단", status: "met", evidence: "verified_planner only" },
  { item: "allowlist", criterion: "유지", status: "met", evidence: "allowlist.ts" },
  { item: "베타 자동 AA", criterion: "없음", status: "met", evidence: "PR-146 ACCESS_SCOPE_ROWS" },
  { item: "output safety", criterion: "약화 없음", status: "met", evidence: "output-safety.ts" },
  { item: "audit metadata", criterion: "only", status: "met", evidence: FORBIDDEN_USAGE_AUDIT_FIELDS.join(",") },
  { item: "prompt/response 저장", criterion: "없음", status: "met", evidence: "AnswerAssistantUsageAudit schema" },
  { item: "provider 변경", criterion: "없음", status: "met", evidence: "PR149-A" },
] as const;

export const PII_FINAL_AUDIT: readonly { item: string; criterion: string; status: AuditCheckStatus }[] = [
  { item: "고객명·주민번호·연락처", criterion: "수집 금지", status: "met" },
  { item: "계약·증권번호", criterion: "수집 금지", status: "met" },
  { item: "병력·상담 원문", criterion: "저장 금지", status: "met" },
  { item: "테스트 fixture", criterion: "실제 PII 금지", status: "met" },
  { item: "usage log", criterion: "원문 없음", status: "met" },
  { item: "베타 신청 폼", criterion: "없음", status: "met" },
] as const;

export const SECRET_AUDIT: readonly { item: string; criterion: string; status: AuditCheckStatus }[] = [
  { item: ".env", criterion: "PR149 미접촉", status: "met" },
  { item: "docs", criterion: "placeholder only", status: "met" },
  { item: "CI", criterion: "secret 노출 없음", status: "met" },
  { item: "test", criterion: "실제 key 금지", status: "met" },
] as const;

export const BUILD_CI_AUDIT: readonly {
  item: string;
  criterion: string;
  status: AuditCheckStatus;
  evidence: string;
}[] = [
  { item: "npm run build", criterion: "migrate deploy 없음", status: "met", evidence: "package.json scripts" },
  { item: "CI build step", criterion: "generate+next only", status: "met", evidence: ".github/workflows/ci.yml" },
  { item: "db:migrate:deploy", criterion: "build 분리", status: "met", evidence: "별도 script" },
  { item: "test", criterion: "운영 DB 없음", status: "met", evidence: "static/unit tests" },
  { item: "PR149 migration 실행", criterion: "없음", status: "met", evidence: "—" },
] as const;

export const PAYMENT_SIGNUP_BLOCK_AUDIT: readonly {
  item: string;
  criterion: string;
  status: AuditCheckStatus;
}[] = [
  { item: "payment/checkout/billing route", criterion: "없음", status: "met" },
  { item: "subscription model", criterion: "없음", status: "met" },
  { item: "PG package", criterion: "추가 없음", status: "met" },
  { item: "베타 신청 폼", criterion: "없음", status: "met" },
  { item: "자동 승인·대량 초대", criterion: "없음", status: "met" },
  { item: "외부 발송 webhook", criterion: "없음", status: "met" },
] as const;

export const SECURITY_GO_CRITERIA: readonly { verdict: SecurityVerdict; criteria: string }[] = [
  { verdict: "go", criteria: "Critical/High 0, visibility·권한·PII·secret 안전" },
  { verdict: "conditional_go", criteria: "Critical 0, High 별도 PR, PR150 조건부" },
  { verdict: "no_go", criteria: "public 노출·권한 우회·PII·secret·AA 확대·운영 DB 위험" },
] as const;

export const PR149_CRITICAL_RISKS: readonly string[] = [
  "(정적 감사) open Critical 코드 결함 없음 — PR150 전 법무·약관·AA hardening 별도",
] as const;

export const PR149_HIGH_RISKS: readonly {
  id: string;
  risk: string;
  pr: string;
}[] = [
  { id: "H1", risk: "PR148-B~H output/input/audit hardening 미완", pr: "PR148-B~H" },
  { id: "H2", risk: "약관·개인정보 확정 전 외부 공개", pr: "PR142·PR150" },
  { id: "H3", risk: "content_admin destructive bulk 경계", pr: "PR139·bulk-policies" },
  { id: "H4", risk: "planner layout 세션 guard 없음(AA 페이지 guard로 완화)", pr: "정보 gap" },
] as const;

export const SECURITY_FINAL_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: AuditCheckStatus;
  note: string;
}[] = [
  { id: "pa", item: "public/admin 분리", criterion: "public admin 불가", status: "met", note: "layout" },
  { id: "ap", item: "planner/admin 분리", criterion: "planner admin 불가", status: "met", note: "rbac" },
  { id: "rbac", item: "RBAC 경계", criterion: "content vs super", status: "partial", note: "bulk" },
  { id: "vis", item: "public visibility", criterion: "미검수 미노출", status: "met", note: "visibility.ts" },
  { id: "ops", item: "운영 데이터", criterion: "public 금지", status: "met", note: "admin panels" },
  { id: "aa", item: "Answer Assistant", criterion: "verified+allowlist", status: "met", note: "PR148" },
  { id: "beta-ai", item: "베타≠AI", criterion: "분리", status: "met", note: "PR146" },
  { id: "audit", item: "usage audit", criterion: "metadata-only", status: "met", note: "schema" },
  { id: "pii", item: "개인정보", criterion: "수집·저장 없음", status: "met", note: "—" },
  { id: "sec", item: "secret", criterion: "노출 없음", status: "met", note: "—" },
  { id: "build", item: "build", criterion: "no migrate in build", status: "met", note: "ci.yml" },
  { id: "ci", item: "CI", criterion: "no destructive", status: "met", note: "—" },
  { id: "pay", item: "결제", criterion: "구현 없음", status: "met", note: "PR145" },
  { id: "signup", item: "회원가입 확대", criterion: "없음", status: "met", note: "—" },
  { id: "send", item: "외부 발송", criterion: "없음", status: "met", note: "—" },
  { id: "db", item: "migration", criterion: "PR149 없음", status: "met", note: "—" },
  { id: "opsdb", item: "운영 DB", criterion: "미접촉", status: "met", note: "—" },
] as const;

export const PR149_SECURITY_VERDICT = {
  securityReadiness: "conditional_go" as SecurityVerdict,
  externalBetaSecurity: "conditional_go" as SecurityVerdict,
  pr150Entry: "conditional_go" as SecurityVerdict,
};

export const PR149_READINESS_CONDITIONS: readonly string[] = [
  "Critical 코드 결함 없음(정적) — High는 PR148-B~H·PR142·bulk 경계",
  "PR150에서 법무·약관·운영자 Go 확정 필요",
  "정보 gap: /planner 전역 layout auth — 현재 AA 단일 route",
] as const;

export const PR149_DEFERRED_PRS: readonly {
  id: string;
  title: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR149-B", title: "Auth/RBAC Hardening", risk: "Critical", codex: "필수" },
  { id: "PR149-C", title: "Public Visibility Guard Review", risk: "Critical", codex: "필수" },
  { id: "PR149-D", title: "Answer Assistant Access Hardening", risk: "Critical", codex: "필수" },
  { id: "PR149-E", title: "Secret Exposure Review", risk: "Critical", codex: "필수" },
  { id: "PR149-F", title: "Build/Deployment Safety Review", risk: "High~Critical", codex: "필수" },
  { id: "PR150", title: "External Release Decision", risk: "Critical", codex: "필수" },
] as const;

export const PR149_DEFERRED_IMPLEMENTATION = [
  "Auth provider 변경",
  "RBAC 대규모 변경",
  "role·allowlist 실변경",
  "public visibility guard 약화",
  "Answer Assistant 확대",
  "audit 원문 저장",
  "운영 DB 접근",
] as const;

export const PR149_LINKED_DOCS = [
  "PR-139-ROLE-ACCESS-OPS.md",
  "PR-146-ACCESS-SCOPE-SPLIT.md",
  "PR-148-AI-LIMITED-BETA-POLICY-OPS.md",
  "PR-140-EXTERNAL-RELEASE-READINESS-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
] as const;

/** Cross-check: PR148 AI checklist still met at audit time. */
export const PR149_AA_CROSSCHECK_GAP_COUNT = AI_LIMITED_BETA_CHECKLIST.filter(
  (c) => c.status === "gap",
).length;

export const PR149_RBAC_REFERENCE = {
  contentAdmin: ADMIN_PERMISSION_MATRIX[ROLE_CONTENT_ADMIN],
  superAdmin: ADMIN_PERMISSION_MATRIX[ROLE_SUPER_ADMIN],
  verifiedRole: ROLE_VERIFIED_PLANNER,
} as const;
