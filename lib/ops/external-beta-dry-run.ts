/**
 * External beta dry-run matrices (PR-151). Rehearsal/docs only — no launch, role, or allowlist changes.
 */

import { PR150_FINAL_VERDICTS, PR150_OPEN_CRITICAL_COUNT } from "@/lib/ops/external-release-decision";
import {
  RELEASE_VERDICT_LABEL,
  type ReleaseVerdict,
} from "@/lib/ops/external-release-readiness";

export type { ReleaseVerdict };

export const PR151_SCOPE_NOTICE =
  "PR150 Conditional Go 이후 실제 공개 전 운영자 dry-run입니다. 실제 배포·외부 공개·beta user·role·allowlist·운영 DB 변경은 포함하지 않습니다.";

export const PR151_FORBIDDEN_DOC_CONTENT =
  "dry-run 문서·테스트에 secret·고객정보·allowlist 실값·초대 링크를 넣지 않습니다.";

export type DryRunCheckStatus = "pass" | "partial" | "fail" | "pending" | "na";

export const DRY_RUN_STATUS_LABEL: Record<DryRunCheckStatus, string> = {
  pass: "통과",
  partial: "부분",
  fail: "실패",
  pending: "대기",
  na: "해당없음",
};

export const PR151_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr150",
    condition: "PR150 외부 제한 베타 Conditional Go 이상",
    result: RELEASE_VERDICT_LABEL[PR150_FINAL_VERDICTS.limitedExternalBeta],
    met: PR150_FINAL_VERDICTS.limitedExternalBeta !== "no_go",
  },
  {
    id: "crit",
    condition: "PR150 Critical(정적) 0개",
    result: String(PR150_OPEN_CRITICAL_COUNT),
    met: PR150_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "high",
    condition: "High 리스크 필수 보완 분리",
    result: "PR142·PR148-B~H·bulk·데이터 운영",
    met: true,
  },
  {
    id: "pr149",
    condition: "PR149 visibility·RBAC·AA 통과",
    result: "conditional_go",
    met: true,
  },
  {
    id: "pr148",
    condition: "PR148 AA 제한 정책 유지",
    result: "verified+allowlist",
    met: true,
  },
  {
    id: "pr147",
    condition: "PR147 데이터 책임 고지",
    result: "public 인라인 고지",
    met: true,
  },
  {
    id: "pr146",
    condition: "PR146 베타≠AI 분리",
    result: "설계 문서",
    met: true,
  },
  {
    id: "pr143",
    condition: "PR143 지원·장애 기준",
    result: "playbook",
    met: true,
  },
  {
    id: "dry",
    condition: "실행 없이 dry-run만",
    result: "문서·정적 검증",
    met: true,
  },
] as const;

export const ROLE_DRY_RUN_SCENARIOS: readonly {
  scenario: string;
  userState: string;
  expected: string;
  failCriteria: string;
  status: DryRunCheckStatus;
  evidence: string;
}[] = [
  {
    scenario: "public user 공개 정보 조회",
    userState: "로그인 없음",
    expected: "공개 정보만 조회",
    failCriteria: "admin/planner/AI/운영 데이터 노출",
    status: "pass",
    evidence: "lib/public/* · isPublished",
  },
  {
    scenario: "public user admin 접근 시도",
    userState: "로그인 없음",
    expected: "차단",
    failCriteria: "admin 화면 접근",
    status: "pass",
    evidence: "app/admin/layout getAdminAccess",
  },
  {
    scenario: "public user planner 접근 시도",
    userState: "로그인 없음",
    expected: "차단 또는 공개 라우트만",
    failCriteria: "planner 전용 화면 접근",
    status: "pass",
    evidence: "/planner/answer-assistant auth gate",
  },
  {
    scenario: "planner user 공개 정보 조회",
    userState: "일반 설계사(verified 미만 가정)",
    expected: "허용 범위 내 조회",
    failCriteria: "관리자 정보 노출",
    status: "pass",
    evidence: "public visibility guard",
  },
  {
    scenario: "planner user Answer Assistant 접근",
    userState: "일반 설계사",
    expected: "기본 차단",
    failCriteria: "AI 접근 허용",
    status: "pass",
    evidence: "verified-access locked/denied",
  },
  {
    scenario: "verified planner AI 접근",
    userState: "verified, allowlist 없음",
    expected: "차단",
    failCriteria: "allowlist 없이 접근",
    status: "pass",
    evidence: "not_allowlisted state",
  },
  {
    scenario: "AI allowlisted planner 접근",
    userState: "verified + allowlist",
    expected: "제한 사용 가능",
    failCriteria: "PII 유도·원문 저장",
    status: "partial",
    evidence: "PR148-B~H hardening 잔존",
  },
  {
    scenario: "content_admin admin 접근",
    userState: "content_admin",
    expected: "허용된 관리 범위만",
    failCriteria: "super_admin 기능 접근",
    status: "partial",
    evidence: "canManageUsers false",
  },
  {
    scenario: "content_admin bulk 접근",
    userState: "content_admin",
    expected: "기본 차단 또는 제한",
    failCriteria: "destructive bulk 가능",
    status: "partial",
    evidence: "PR139·PR149 bulk 경계",
  },
  {
    scenario: "super_admin admin 접근",
    userState: "super_admin",
    expected: "관리자 기능 접근",
    failCriteria: "secret/운영 DB 직접 노출",
    status: "pass",
    evidence: "ops 기준·문서 금지",
  },
  {
    scenario: "beta user 접근(가정)",
    userState: "제한 베타 대상 가정",
    expected: "공개 가능 기능만",
    failCriteria: "AI 자동 허용·admin 노출",
    status: "pass",
    evidence: "PR146·PR150 FEATURE_RELEASE_FINAL",
  },
] as const;

export const PUBLIC_ROUTE_DRY_RUN: readonly {
  item: string;
  expected: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { item: "landing 문구", expected: "제한 베타·책임 고지 안전", result: "PR144 conditional", status: "pass" },
  { item: "보험사 디렉터리", expected: "검수 완료 공개 정보만", result: "isPublished guard", status: "pass" },
  { item: "청구서류", expected: "지급 비확정·공식 확인 고지", result: "PR147 claim variant", status: "pass" },
  { item: "업무 링크", expected: "접근·변경 가능성 고지", result: "PR147 disclosure variant", status: "pass" },
  { item: "지식 아카이브", expected: "상담 보조용 고지", result: "PR147 knowledge variant", status: "pass" },
  { item: "검색 결과", expected: "미검수/비공개 미노출", result: "public search filters", status: "pass" },
  { item: "footer/notice", expected: "데이터 책임 고지", result: "DataResponsibilityInlineNotice", status: "pass" },
  { item: "관리자 정보", expected: "미노출", result: "admin route 분리", status: "pass" },
  { item: "운영 이슈", expected: "미노출", result: "admin only panels", status: "pass" },
  { item: "변경 이력", expected: "미노출", result: "admin only", status: "pass" },
  { item: "Admin bulk 상태", expected: "미노출", result: "admin only", status: "pass" },
  { item: "usage audit", expected: "미노출", result: "admin audit route", status: "pass" },
] as const;

export const PLANNER_ROUTE_DRY_RUN: readonly {
  item: string;
  expected: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { item: "public 사용자 접근", expected: "차단", result: "auth required", status: "pass" },
  { item: "일반 planner 접근", expected: "허용 범위 내", result: "shell only if not verified", status: "pass" },
  { item: "admin 정보 노출", expected: "없음", result: "route 분리", status: "pass" },
  { item: "운영 이슈 노출", expected: "없음", result: "admin only", status: "pass" },
  { item: "변경 이력 노출", expected: "없음", result: "admin only", status: "pass" },
  { item: "Answer Assistant 링크", expected: "일반 planner 기본 차단", result: "verified-access gate", status: "pass" },
  { item: "개인정보 입력 유도", expected: "없음", result: "PR148 forbidden input", status: "pass" },
  { item: "데이터 책임 고지", expected: "존재", result: "AA user notice PR148", status: "pass" },
] as const;

export const ADMIN_ROUTE_DRY_RUN: readonly {
  item: string;
  expected: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { item: "public 접근", expected: "차단", result: "getAdminAccess deny", status: "pass" },
  { item: "planner 접근", expected: "차단", result: "canAccessAdmin false", status: "pass" },
  { item: "verified planner 접근", expected: "차단", result: "rbac", status: "pass" },
  { item: "content_admin 접근", expected: "허용 범위만", result: "content CRUD", status: "pass" },
  { item: "super_admin 접근", expected: "전체 관리자", result: "canManageUsers", status: "pass" },
  { item: "bulk 기능", expected: "super_admin 제한 또는 guard", result: "partial — PR149", status: "partial" },
  { item: "운영 이슈", expected: "admin 전용", result: "ops panels", status: "pass" },
  { item: "변경 이력", expected: "admin 전용", result: "AdminChangeHistory*", status: "pass" },
  { item: "관리자 리포트", expected: "admin 전용", result: "AdminOperationsReport*", status: "pass" },
  { item: "운영 리마인더", expected: "admin 전용", result: "admin panels", status: "pass" },
  { item: "secret/env/API key 노출", expected: "없음", result: "문서·UI 금지", status: "pass" },
] as const;

export const ANSWER_ASSISTANT_DRY_RUN: readonly {
  item: string;
  expected: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { item: "public 접근", expected: "차단", result: "no public AA route", status: "pass" },
  { item: "일반 planner 접근", expected: "기본 차단", result: "locked/denied", status: "pass" },
  { item: "verified without allowlist", expected: "차단", result: "not_allowlisted", status: "pass" },
  { item: "verified with allowlist", expected: "제한 사용", result: "canGenerate gate", status: "partial" },
  { item: "beta user 자동 접근", expected: "없음", result: "PR146 분리", status: "pass" },
  { item: "개인정보 입력 안내", expected: "입력 금지 명확", result: "PR148", status: "pass" },
  { item: "보험금 확정 출력", expected: "금지", result: "output safety", status: "pass" },
  { item: "가입·해지 유도", expected: "금지", result: "forbidden output", status: "pass" },
  { item: "공포 조장", expected: "금지", result: "forbidden phrases", status: "pass" },
  { item: "prompt 원문 저장", expected: "없음", result: "schema audit", status: "pass" },
  { item: "response 원문 저장", expected: "없음", result: "schema audit", status: "pass" },
  { item: "usage audit", expected: "metadata-only", result: "FORBIDDEN_USAGE_AUDIT_FIELDS", status: "pass" },
  { item: "rate limit", expected: "유지", result: "rate-limit store", status: "pass" },
  { item: "retention", expected: "유지·문서화", result: "PR148 retention", status: "pass" },
  { item: "disable 기준", expected: "Critical 시 중단", result: "PR148 disable", status: "pass" },
  { item: "결제/유료화 연결", expected: "없음", result: "no payment routes", status: "pass" },
] as const;

export const DATA_RESPONSIBILITY_DRY_RUN: readonly {
  area: string;
  expectedNotice: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { area: "보험사 정보", expectedNotice: "공식 출처 확인 필요", result: "directory variant", status: "pass" },
  { area: "청구서류", expectedNotice: "정책·사고에 따라 달라질 수 있음", result: "claim variant", status: "pass" },
  { area: "보험금 지급", expectedNotice: "확정 아님", result: "claim notice copy", status: "pass" },
  { area: "업무 링크", expectedNotice: "접근·변경 가능성", result: "disclosure variant", status: "pass" },
  { area: "지식 아카이브", expectedNotice: "상담 보조용", result: "knowledge variant", status: "pass" },
  { area: "검색 결과", expectedNotice: "검수 완료 공개 정보", result: "search variant", status: "pass" },
  { area: "Answer Assistant", expectedNotice: "최종 판단 아님", result: "PR148 user notice", status: "pass" },
  { area: "개인정보", expectedNotice: "고객정보·민감정보 입력 금지", result: "PR148 forbidden input", status: "pass" },
  { area: "오류 제보", expectedNotice: "PR143 기준", result: "support playbook link", status: "pass" },
] as const;

export const SUPPORT_INCIDENT_DRY_RUN: readonly {
  scenario: string;
  expectedHandling: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { scenario: "청구서류 오류 제보", expectedHandling: "High 이상", result: "PR143 분류", status: "pass" },
  { scenario: "링크 오류 제보", expectedHandling: "Medium~High", result: "PR143·PR147", status: "pass" },
  { scenario: "미검수 데이터 노출", expectedHandling: "Critical·즉시 중단", result: "PR143 halt", status: "pass" },
  { scenario: "관리자 정보 노출", expectedHandling: "Critical·즉시 중단", result: "PR143 halt", status: "pass" },
  { scenario: "개인정보 입력 시도", expectedHandling: "Critical/High·안내", result: "PR148·PR147", status: "pass" },
  { scenario: "AA 위험 답변", expectedHandling: "Critical·AI disable", result: "PR148 disable", status: "pass" },
  { scenario: "권한 우회 제보", expectedHandling: "Critical·공개 중단", result: "PR143·PR149", status: "pass" },
  { scenario: "secret 노출 의심", expectedHandling: "Critical·즉시 중단", result: "PR143 halt", status: "pass" },
  { scenario: "단순 오탈자", expectedHandling: "Low/Medium", result: "PR143 tier", status: "pass" },
] as const;

export const BUILD_CI_DRY_RUN: readonly {
  item: string;
  expected: string;
  result: string;
  status: DryRunCheckStatus;
}[] = [
  { item: "npm run lint", expected: "통과 또는 기존 경고만", result: "CI 동일", status: "pass" },
  { item: "npm run typecheck", expected: "통과", result: "tsc", status: "pass" },
  { item: "npm run test", expected: "통과", result: "ops+AA suite", status: "pass" },
  { item: "npm run build", expected: "migrate deploy 없음", result: "prisma generate && next build", status: "pass" },
  { item: "prisma migrate deploy", expected: "build와 분리", result: "not in build script", status: "pass" },
  { item: "CI workflow", expected: "secret 노출 없음", result: "env refs only", status: "pass" },
  { item: "CI workflow", expected: "destructive command 없음", result: "no migrate deploy", status: "pass" },
  { item: "deployment 문서", expected: "migration 경계 명확", result: "PR116·PR149", status: "pass" },
  { item: "rollback 문서", expected: "Critical 중단 기준", result: "PR143·PR148", status: "pass" },
] as const;

export const EXTERNAL_BETA_DRY_RUN_CHECKLIST: readonly {
  id: string;
  criterion: string;
  status: DryRunCheckStatus;
}[] = [
  { id: "pub", criterion: "public route 안전", status: "pass" },
  { id: "pln", criterion: "planner route 안전", status: "pass" },
  { id: "adm", criterion: "admin route 안전", status: "pass" },
  { id: "rbac", criterion: "RBAC content_admin/super_admin 경계", status: "partial" },
  { id: "aa", criterion: "AA verified+allowlist", status: "partial" },
  { id: "split", criterion: "베타 접근≠AI", status: "pass" },
  { id: "audit", criterion: "usage audit metadata-only", status: "pass" },
  { id: "pii", criterion: "PII 입력 금지", status: "pass" },
  { id: "data", criterion: "데이터 책임·출처 고지", status: "pass" },
  { id: "claim", criterion: "청구·지급 비확정 고지", status: "pass" },
  { id: "support", criterion: "PR143 Critical/High 분류", status: "pass" },
  { id: "halt", criterion: "Critical 즉시 중단", status: "pass" },
  { id: "build", criterion: "build/CI 운영 DB 무단 접촉 없음", status: "pass" },
  { id: "pay", criterion: "결제 route/PG 없음", status: "pass" },
  { id: "signup", criterion: "회원가입 확대 없음", status: "pass" },
  { id: "send", criterion: "외부 발송 없음", status: "pass" },
  { id: "role", criterion: "role/allowlist 실변경 없음", status: "pass" },
  { id: "codex", criterion: "Codex 제한검수", status: "pending" },
  { id: "ag", criterion: "Antigravity 검수", status: "pending" },
] as const;

export const DRY_RUN_DECISION_CRITERIA: readonly {
  verdict: ReleaseVerdict;
  criteria: string;
}[] = [
  { verdict: "go", criteria: "모든 시나리오 pass, Critical/High 0, Codex 통과" },
  { verdict: "conditional_go", criteria: "Critical 0, High·partial 분리, 실제 공개 전 재검수" },
  { verdict: "no_go", criteria: "Critical·권한 우회·PII·secret·AI 확대·운영 DB 위험" },
] as const;

export const PR151_DRY_RUN_VERDICTS = {
  externalBetaDryRun: "conditional_go" as ReleaseVerdict,
  pr152Entry: "conditional_go" as ReleaseVerdict,
  pr157LaunchDecision: "no_go" as ReleaseVerdict,
  overallUntilCodex: "conditional_go" as ReleaseVerdict,
} as const;

export const PR151_OPEN_CRITICAL_COUNT = 0;

export const PR152_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR152", title: "Beta Operator Checklist", purpose: "운영자 실행 체크리스트", risk: "Medium~High", codex: "조건부" },
  { id: "PR153", title: "Beta User Notice Pack", purpose: "베타 안내문", risk: "Medium~High", codex: "조건부" },
  { id: "PR154", title: "Public Smoke Expansion", purpose: "public smoke 확장", risk: "High", codex: "조건부" },
  { id: "PR155", title: "Admin Access Regression", purpose: "admin 회귀", risk: "Critical", codex: "필수" },
  { id: "PR156", title: "AA Red-Team Test", purpose: "AI safety", risk: "Critical", codex: "필수" },
  { id: "PR157", title: "Beta Launch Decision", purpose: "실행 여부", risk: "Critical", codex: "필수" },
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백 운영", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Incident Drill", purpose: "장애 리허설", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "dry-run 시나리오 누락",
  "public/planner/admin 접근 기대값",
  "public visibility·RBAC",
  "Answer Assistant allowlist",
  "audit metadata-only",
  "PII·secret·데이터 책임 고지",
  "build/CI 운영 DB 접촉",
  "결제·가입·발송 부재",
  "PR152 진입 가능 여부",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "README 취향",
  "UI 미세 취향",
] as const;

export const PR151_LINKED_HUBS = [
  "PR-150-EXTERNAL-RELEASE-DECISION-OPS.md",
  "PR-149-SECURITY-FINAL-AUDIT-OPS.md",
  "PR-148-AI-LIMITED-BETA-POLICY-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
] as const;

export { RELEASE_VERDICT_LABEL } from "@/lib/ops/external-release-readiness";
