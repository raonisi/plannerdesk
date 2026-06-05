/**
 * Public route smoke expansion matrices (PR-154). Static smoke criteria — no launch or DB access.
 */

import { LANDING_FORBIDDEN_PHRASES } from "@/lib/ops/public-landing-safety";
import {
  NOTICE_FORBIDDEN_PHRASES as DATA_NOTICE_FORBIDDEN,
  PUBLIC_INLINE_NOTICE,
} from "@/lib/ops/data-responsibility-notice";
import { PR153_PACK_VERDICTS } from "@/lib/ops/beta-user-notice-pack";
import {
  PR152_OPERATOR_VERDICTS,
  type OperatorReadiness,
} from "@/lib/ops/beta-operator-checklist";
import { PR151_DRY_RUN_VERDICTS } from "@/lib/ops/external-beta-dry-run";

export const PR154_SCOPE_NOTICE =
  "PR151~153 이후 public route smoke 기준 확장입니다. 실제 배포·외부 공개·운영 DB·role·allowlist 변경은 포함하지 않습니다.";

export const PR154_FORBIDDEN_DOC_CONTENT =
  "smoke 문서·테스트에 secret·고객정보·운영 DB 연결·실제 API key를 넣지 않습니다.";

export type SmokeCheckStatus = "pass" | "partial" | "pending" | "fail" | "runtime";

export const SMOKE_STATUS_LABEL: Record<SmokeCheckStatus, string> = {
  pass: "통과(정적)",
  partial: "부분",
  pending: "대기",
  fail: "실패",
  runtime: "런타임 필요",
};

export const PR154_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr153",
    condition: "PR153 Notice Pack Conditional Ready 이상",
    result: PR153_PACK_VERDICTS.noticePackPrepared,
    met: PR153_PACK_VERDICTS.noticePackPrepared !== "not_ready",
  },
  {
    id: "pr152",
    condition: "PR152 Conditional Ready 이상",
    result: PR152_OPERATOR_VERDICTS.checklistPrepared,
    met: PR152_OPERATOR_VERDICTS.checklistPrepared !== "not_ready",
  },
  {
    id: "pr151",
    condition: "PR151 public dry-run Critical 0",
    result: "conditional_go",
    met: true,
  },
  {
    id: "pr150",
    condition: "PR150 제한 베타 No-Go 아님",
    result: "conditional_go",
    met: true,
  },
  {
    id: "vis",
    condition: "PR149 public visibility",
    result: "met",
    met: true,
  },
  {
    id: "test",
    condition: "기존 node:test + smoke:public",
    result: "tsx + scripts",
    met: true,
  },
  {
    id: "dep",
    condition: "신규 package 불필요",
    result: "없음",
    met: true,
  },
] as const;

/** Public pages scanned for forbidden phrases (relative to repo root). */
export const PUBLIC_PHRASE_SCAN_FILES: readonly string[] = [
  "app/home-client.tsx",
  "components/footer.tsx",
  "lib/dashboard/work-hub-copy.ts",
  "app/directory/page.tsx",
  "app/claim-documents/page.tsx",
  "app/disclosure-links/page.tsx",
  "app/knowledge/page.tsx",
  "app/search/page.tsx",
  "components/content/data-responsibility-inline-notice.tsx",
] as const;

export const PUBLIC_SMOKE_TARGETS: readonly {
  area: string;
  purpose: string;
  expected: string;
  staticCheck: string;
  status: SmokeCheckStatus;
}[] = [
  { area: "landing (/)", purpose: "제한 베타·책임 고지", expected: "과장·유료화 오해 없음", staticCheck: "home-client + PR144", status: "pass" },
  { area: "desk/public 업무", purpose: "공개 정보만", expected: "관리자 정보 미노출", staticCheck: "getPublic* helpers", status: "pass" },
  { area: "보험사 디렉터리", purpose: "검수 공개만", expected: "미검수 미노출", staticCheck: "visibility + notice", status: "pass" },
  { area: "청구서류", purpose: "책임·출처 고지", expected: "지급 확정 없음", staticCheck: "claim notice", status: "pass" },
  { area: "업무 링크", purpose: "접근·변경 고지", expected: "secret 미노출", staticCheck: "disclosure notice", status: "pass" },
  { area: "지식 아카이브", purpose: "상담 보조 고지", expected: "가입 유도 없음", staticCheck: "knowledge notice", status: "pass" },
  { area: "검색", purpose: "공개 정보 중심", expected: "PUBLIC_*_WHERE", staticCheck: "lib/search/public.ts", status: "pass" },
  { area: "footer/notice", purpose: "데이터 책임", expected: "100% 보장 없음", staticCheck: "footer + inline", status: "pass" },
  { area: "/planner", purpose: "public 차단", expected: "auth/AA gate", staticCheck: "verified-access", status: "pass" },
  { area: "/admin", purpose: "public 차단", expected: "getAdminAccess", staticCheck: "admin layout", status: "pass" },
  { area: "/planner/answer-assistant", purpose: "public 차단", expected: "no public route", staticCheck: "no app/answer-assistant", status: "pass" },
  { area: "결제 route", purpose: "없음", expected: "payment 미노출", staticCheck: "existsSync false", status: "pass" },
  { area: "회원가입 확대", purpose: "없음", expected: "누구나 가입 없음", staticCheck: "phrase scan", status: "pass" },
  { area: "런타임 HTTP smoke", purpose: "200/404", expected: "smoke:public", staticCheck: "scripts/smoke-public-routes.mjs", status: "runtime" },
] as const;

export const PUBLIC_VISIBILITY_SMOKE: readonly {
  item: string;
  criterion: string;
  failGrade: string;
  status: SmokeCheckStatus;
}[] = [
  { item: "비공개·미검수 보험사", criterion: "isPublished + verification", failGrade: "Critical", status: "pass" },
  { item: "비공개·미검수 청구서류", criterion: "public fetch filters", failGrade: "Critical", status: "pass" },
  { item: "비공개·미검수 지식", criterion: "PUBLIC_KNOWLEDGE_WHERE", failGrade: "Critical", status: "pass" },
  { item: "운영 이슈·변경 이력", criterion: "admin only", failGrade: "Critical", status: "pass" },
  { item: "관리자 리포트·리마인더", criterion: "admin panels", failGrade: "Critical", status: "pass" },
  { item: "Admin bulk 상태", criterion: "admin only", failGrade: "Critical", status: "pass" },
  { item: "usage audit", criterion: "admin audit route", failGrade: "Critical", status: "pass" },
  { item: "secret/env/token", criterion: "phrase scan", failGrade: "Critical", status: "pass" },
] as const;

export const PUBLIC_ACCESS_BLOCK_SMOKE: readonly {
  scenario: string;
  expected: string;
  failGrade: string;
  evidence: string;
  status: SmokeCheckStatus;
}[] = [
  { scenario: "public -> /admin", expected: "차단", failGrade: "Critical", evidence: "getAdminAccess denied", status: "pass" },
  { scenario: "public -> /admin/insurers", expected: "차단", failGrade: "Critical", evidence: "admin layout", status: "pass" },
  { scenario: "public -> /admin/claim-documents", expected: "차단", failGrade: "Critical", evidence: "admin layout", status: "pass" },
  { scenario: "public -> /admin/knowledge", expected: "차단", failGrade: "Critical", evidence: "admin layout", status: "pass" },
  { scenario: "public -> /planner/answer-assistant", expected: "차단", failGrade: "Critical", evidence: "verified-access locked", status: "pass" },
  { scenario: "public -> /planner", expected: "차단 또는 gate", failGrade: "Critical", evidence: "AA page auth", status: "pass" },
  { scenario: "smoke script -> /admin", expected: "미포함", failGrade: "Critical", evidence: "smoke-public-routes.mjs", status: "pass" },
  { scenario: "smoke script -> /planner/answer-assistant", expected: "미포함", failGrade: "Critical", evidence: "smoke script", status: "pass" },
  { scenario: "app/answer-assistant public", expected: "없음", failGrade: "Critical", evidence: "no route dir", status: "pass" },
  { scenario: "런타임 admin 200 without auth", expected: "없음", failGrade: "Critical", evidence: "npm run smoke:public + server", status: "runtime" },
] as const;

export const RESPONSIBILITY_NOTICE_SMOKE: readonly {
  area: string;
  expectedDirection: string;
  failCriteria: string;
  status: SmokeCheckStatus;
}[] = [
  { area: "landing", expectedDirection: "제한 베타·공식 확인", failCriteria: "정식 출시 완료", status: "pass" },
  { area: "청구서류", expectedDirection: "지급 비확정", failCriteria: "지급 확정", status: "pass" },
  { area: "업무 링크", expectedDirection: "변경·접근 제한", failCriteria: "항상 사용 가능", status: "pass" },
  { area: "지식", expectedDirection: "상담 보조", failCriteria: "최종 판단", status: "pass" },
  { area: "검색", expectedDirection: "공개 정보", failCriteria: "비공개 포함 가능", status: "pass" },
  { area: "개인정보", expectedDirection: "입력 금지", failCriteria: "입력 유도", status: "pass" },
  { area: "유료화", expectedDirection: "결제 아님", failCriteria: "유료 결제 가능", status: "pass" },
] as const;

/** Must not appear in PUBLIC_PHRASE_SCAN_FILES (static lint). */
export const PUBLIC_FORBIDDEN_PHRASES: readonly string[] = [
  ...LANDING_FORBIDDEN_PHRASES,
  ...DATA_NOTICE_FORBIDDEN,
  "보험금 지급 확정",
  "무조건 지급",
  "최신 정보 100% 보장",
  "AI가 최종 판단",
  "고객정보를 입력하면 정확",
  "상담 원문을 그대로 넣어",
  "누구나 가입 가능",
  "전체 기능 즉시 사용",
  "유료 결제 후 사용",
  "관리자 기능 체험",
  "AUTH_SECRET",
  "DATABASE_URL",
] as const;

export const PUBLIC_FORBIDDEN_EXPRESSIONS: readonly {
  phrase: string;
  reason: string;
}[] = [
  { phrase: "보험금 지급 확정", reason: "지급 단정" },
  { phrase: "무조건 지급", reason: "과장" },
  { phrase: "이 서류만 내면 됩니다", reason: "청구 변경 무시" },
  { phrase: "최신 정보 100% 보장", reason: "최신성 보장 불가" },
  { phrase: "AI가 최종 판단", reason: "AA 보조 원칙" },
  { phrase: "고객정보를 입력하면 정확", reason: "PII 유도" },
  { phrase: "상담 원문을 그대로 넣어", reason: "원문·PII" },
  { phrase: "누구나 가입 가능", reason: "가입 확대 아님" },
  { phrase: "전체 기능 즉시 사용", reason: "보류 기능" },
  { phrase: "유료 결제 후 사용", reason: "결제 없음" },
  { phrase: "관리자 기능 체험", reason: "admin 금지" },
  { phrase: "secret/token/env", reason: "보안 노출" },
] as const;

/** Inline notice keys that must exist for responsibility smoke. */
export const REQUIRED_INLINE_NOTICE_VARIANTS = Object.keys(
  PUBLIC_INLINE_NOTICE,
) as (keyof typeof PUBLIC_INLINE_NOTICE)[];

export const DEFERRED_RUNTIME_SMOKE: readonly {
  test: string;
  reason: string;
  command: string;
}[] = [
  { test: "HTTP 200 public routes", reason: "서버 필요", command: "npm run smoke:public" },
  { test: "admin 401/403 without session", reason: "인증 E2E", command: "— (명령 부재: test:e2e)" },
  { test: "planner AA gate live", reason: "세션 필요", command: "—" },
] as const;

export const PR154_SMOKE_VERDICTS = {
  smokeExpansionReady: "conditional_ready" as OperatorReadiness,
  pr155Entry: "conditional_ready" as OperatorReadiness,
  staticSmokePass: true,
  overallUntilCodex: "conditional_ready" as OperatorReadiness,
} as const;

export const PR154_OPEN_CRITICAL_COUNT = 0;

export const PR155_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR155", title: "Admin Access Regression", purpose: "admin 회귀", risk: "Critical", codex: "필수" },
  { id: "PR156", title: "AA Red-Team Test", purpose: "AI safety", risk: "Critical", codex: "필수" },
  { id: "PR157", title: "Beta Launch Decision", purpose: "실행 여부", risk: "Critical", codex: "필수" },
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Incident Drill", purpose: "장애", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "smoke 대상 누락",
  "visibility guard",
  "admin/planner/AA 차단",
  "책임·청구 고지",
  "금지 문구 smoke",
  "운영 DB·외부 API 미접촉",
  "package/lockfile 부재",
  "PR155 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR154_LINKED_HUBS = [
  "PR-153-BETA-USER-NOTICE-PACK-OPS.md",
  "PR-151-EXTERNAL-BETA-DRY-RUN-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-149-SECURITY-FINAL-AUDIT-OPS.md",
  "PR-144-PUBLIC-LANDING-SAFETY-OPS.md",
] as const;

export const PR154_TEST_FILES = [
  "tests/public/public-routes-smoke.test.ts",
  "tests/public/public-visibility.test.ts",
  "tests/ops/pr154-public-smoke-expansion.test.ts",
] as const;
