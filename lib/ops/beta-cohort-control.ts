/**
 * Beta Cohort Control ops standards (PR-166). Plan/docs only — no beta user, role, or allowlist changes.
 */

import { PR160_EXPANSION_VERDICTS, PR160_OPEN_CRITICAL_COUNT, PR160_OPEN_HIGH_COUNT } from "@/lib/ops/beta-expansion-decision";
import { PR164_SAFETY_VERDICTS } from "@/lib/ops/ai-safety-hardening";
import {
  PR162_INBOX_VERDICTS,
  PR162_OPEN_HIGH_COUNT,
} from "@/lib/ops/user-support-inbox-plan";
import { PR165_READINESS_VERDICTS } from "@/lib/ops/payment-legal-readiness";
import type { IssueSeverity } from "@/lib/ops/support-incident-playbook";

export const PR166_SCOPE_NOTICE =
  "제한 베타 **대상군 관리 운영 계획**입니다. beta user 추가·role·allowlist·회원가입 확대·초대·알림·DB/schema·결제 구현은 포함하지 않습니다.";

export const PR166_FORBIDDEN_DOC_CONTENT =
  "대상군 문서·기록에 고객명·연락처·주민번호·상담 원문·allowlist 실값·초대 링크·secret·API key를 넣지 않습니다.";

export type CohortControlStatus = "ready" | "conditional" | "not_ready" | "blocked";

export const COHORT_CONTROL_STATUS_LABEL: Record<CohortControlStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
};

export const PR166_OPEN_CRITICAL_COUNT = PR160_OPEN_CRITICAL_COUNT;
export const PR166_OPEN_HIGH_COUNT = Math.max(PR160_OPEN_HIGH_COUNT, PR162_OPEN_HIGH_COUNT);

export const PR166_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr160",
    condition: "PR160 베타 확대 판단(실행 아님)",
    result: PR160_EXPANSION_VERDICTS.immediateExpansion,
    met: PR160_EXPANSION_VERDICTS.immediateExpansion !== "expansion",
  },
  {
    id: "pr162",
    condition: "PR162 오류 제보 운영 기준",
    result: PR162_INBOX_VERDICTS.inboxPlanPrepared,
    met: PR162_INBOX_VERDICTS.inboxPlanPrepared !== "not_ready",
  },
  {
    id: "pr165",
    condition: "PR165 유료화 분리",
    result: PR165_READINESS_VERDICTS.actualMonetizationGo,
    met: PR165_READINESS_VERDICTS.billingImplementation === "blocked",
  },
  {
    id: "crit",
    condition: "Critical 리스크(정적)",
    result: String(PR166_OPEN_CRITICAL_COUNT),
    met: PR166_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "doc",
    condition: "문서화만·allowlist 변경 불필요",
    result: "가능",
    met: true,
  },
] as const;

export const COHORT_CLASSIFICATION: readonly {
  id: string;
  cohort: string;
  description: string;
  allowedScope: string;
  restrictions: string;
}[] = [
  {
    id: "ops",
    cohort: "내부 운영자",
    description: "운영·검수 담당",
    allowedScope: "admin 기준",
    restrictions: "외부 베타 사용자 아님",
  },
  {
    id: "limited-beta",
    cohort: "제한 베타 설계사",
    description: "검증된 소수 사용자",
    allowedScope: "public/planner 일부 기능",
    restrictions: "admin 접근 금지",
  },
  {
    id: "verified",
    cohort: "verified planner",
    description: "검증된 설계사",
    allowedScope: "planner 기능",
    restrictions: "AI 자동 허용 아님",
  },
  {
    id: "aa-allowlisted",
    cohort: "AI allowlisted planner",
    description: "별도 허용된 검증 사용자",
    allowedScope: "Answer Assistant 제한 사용",
    restrictions: "admin 접근 금지",
  },
  {
    id: "public",
    cohort: "일반 public user",
    description: "공개 화면 방문자",
    allowedScope: "공개·검수 정보만",
    restrictions: "planner/admin/AI 금지",
  },
  {
    id: "candidate",
    cohort: "후보 사용자",
    description: "향후 검토 대상",
    allowedScope: "즉시 사용 불가",
    restrictions: "수동 승인 전 접근 금지",
  },
] as const;

export const COHORT_SELECTION_CRITERIA: readonly {
  id: string;
  criterion: string;
  description: string;
  judgment: "required" | "conditional";
}[] = [
  { id: "purpose", criterion: "사용 목적 명확성", description: "설계사 업무 개선 목적", judgment: "required" },
  { id: "feedback", criterion: "피드백 가능성", description: "비식별 오류·불편 제보 가능", judgment: "required" },
  { id: "pii", criterion: "개인정보 기준 이해", description: "고객정보·민감정보 입력 금지", judgment: "required" },
  { id: "beta-consent", criterion: "제한 베타 동의", description: "기능 제한·중단 가능성 이해", judgment: "required" },
  { id: "aa-rule", criterion: "AA 사용 기준", description: "verified + allowlist 별도 이해", judgment: "conditional" },
  { id: "no-fear", criterion: "공포·가입 유도 금지", description: "고객 안내 문구 안전 기준", judgment: "required" },
  { id: "official", criterion: "공식 확인 이해", description: "청구·보험사 정보 공식 확인", judgment: "required" },
  { id: "no-paid", criterion: "유료화 분리", description: "제한 베타는 결제·구독 무관", judgment: "required" },
] as const;

export const COHORT_EXCLUSION_CRITERIA: readonly {
  id: string;
  exclusion: string;
  reason: string;
  action: string;
}[] = [
  { id: "pii-repeat", exclusion: "고객정보 입력 반복", reason: "개인정보 위험", action: "대상 제외 또는 기능 제한" },
  { id: "transcript", exclusion: "상담 원문 입력 반복", reason: "원문 저장 위험", action: "안내 후 제한" },
  { id: "payout", exclusion: "보험금 확정 요구 반복", reason: "심의·책임 리스크", action: "기능 제한" },
  { id: "solicit", exclusion: "가입·해지 유도 문구 요청", reason: "영업 리스크", action: "기능 제한" },
  { id: "inject", exclusion: "prompt injection 시도", reason: "보안 리스크", action: "즉시 제외 후보" },
  { id: "admin-try", exclusion: "admin 접근 시도", reason: "권한 리스크", action: "즉시 제외 후보" },
  { id: "secret", exclusion: "secret/env/token 요청", reason: "보안 리스크", action: "즉시 제외 후보" },
  { id: "report-pii", exclusion: "제보에 PII 반복", reason: "개인정보 리스크", action: "안내 후 제한" },
  { id: "leak", exclusion: "베타 기능 외부 공유", reason: "운영 리스크", action: "대상 제외 후보" },
  { id: "paid-confusion", exclusion: "결제·유료화 오해", reason: "운영 혼선", action: "안내 후 유지 여부 판단" },
] as const;

export const COHORT_EXPANSION_CRITERIA: readonly {
  id: string;
  condition: string;
  required: boolean;
}[] = [
  { id: "crit0", condition: "Critical 리스크 0개", required: true },
  { id: "high-ctrl", condition: "High 리스크 통제 가능", required: true },
  { id: "rbac", condition: "public/admin/planner 분리 유지", required: true },
  { id: "aa-limit", condition: "Answer Assistant 접근 제한 유지", required: true },
  { id: "feedback", condition: "피드백 운영 기준 준비", required: true },
  { id: "incident", condition: "장애 대응 기준 준비", required: true },
  { id: "fresh", condition: "데이터 최신성 기준 준비", required: true },
  { id: "inbox", condition: "오류 제보 기준 준비", required: true },
  { id: "pii-notice", condition: "개인정보 입력 금지 안내", required: true },
  { id: "manual", condition: "수동 승인 기준 명확", required: true },
  { id: "no-paid", condition: "유료화와 분리", required: true },
  { id: "codex", condition: "Codex 제한검수", required: false },
] as const;

export const COHORT_REDUCTION_CRITERIA: readonly {
  id: string;
  situation: string;
  action: string;
}[] = [
  { id: "pub-admin", situation: "public에서 admin 접근 가능", action: "즉시 중단" },
  { id: "pub-planner", situation: "public에서 planner 접근 가능", action: "즉시 중단" },
  { id: "draft-leak", situation: "비공개·미검수 데이터 public 노출", action: "즉시 중단" },
  { id: "aa-bypass", situation: "allowlist 없는 AI 접근", action: "AI 중단 또는 대상 축소" },
  { id: "aa-payout", situation: "AI 보험금 지급 확정 출력", action: "AI 대상군 축소" },
  { id: "aa-pii", situation: "개인정보 입력 유도 발생", action: "AI 기능 중단 검토" },
  { id: "aa-inject", situation: "prompt injection 성공", action: "대상군 축소 또는 AI 중단" },
  { id: "secret-leak", situation: "secret/env/token 노출", action: "즉시 중단" },
  { id: "pii-store", situation: "고객정보 저장 위험", action: "즉시 중단" },
  { id: "report-pii", situation: "제보 PII 반복", action: "교육 또는 축소" },
  { id: "support-fail", situation: "고객지원 대응 불능", action: "확대 중단" },
  { id: "data-error", situation: "데이터 오류 반복", action: "해당 기능 보류" },
] as const;

export const AA_COHORT_MANAGEMENT: readonly {
  id: string;
  item: string;
  rule: string;
}[] = [
  { id: "base", item: "기본 원칙", rule: "verified planner + allowlist 유지" },
  { id: "pub", item: "public user", rule: "접근 금지" },
  { id: "planner", item: "일반 planner", rule: "기본 접근 금지" },
  { id: "verified", item: "verified planner", rule: "allowlist 없으면 접근 금지" },
  { id: "allowlisted", item: "AI allowlisted planner", rule: "제한 사용 가능" },
  { id: "admin", item: "admin 권한", rule: "AI 사용 권한과 별개" },
  { id: "audit", item: "사용 기록", rule: "metadata-only" },
  { id: "input", item: "입력 기준", rule: "고객정보·민감정보 입력 금지" },
  { id: "output", item: "출력 기준", rule: "지급 확정·가입 유도·공포 금지" },
  { id: "stop", item: "중단 기준", rule: "safety failure 시 기능 중단 검토" },
] as const;

export const COHORT_RECORD_RULES: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "대상군 유형", allowed: "내부 운영자·베타 설계사 등", forbidden: "주민번호·연락처" },
  { field: "상태", allowed: "후보/승인/보류/제외", forbidden: "민감정보" },
  { field: "승인 사유", allowed: "비식별 업무 목적", forbidden: "고객 사례 전문" },
  { field: "제한 사유", allowed: "위험 유형 중심", forbidden: "상담 원문" },
  { field: "피드백 여부", allowed: "있음/없음·유형", forbidden: "PII 포함 제보 전문" },
  { field: "AI 허용 여부", allowed: "allowlist 기준 여부", forbidden: "API key·secret" },
  { field: "중단 사유", allowed: "safety/권한/PII 유형", forbidden: "원문 로그" },
  { field: "후속 PR", allowed: "PR 후보명", forbidden: "민감 로그 전문" },
] as const;

export const COHORT_FOLLOW_UP_PRS: readonly {
  issueType: string;
  prCandidate: string;
  risk: IssueSeverity | "critical" | "high" | "medium";
  codex: string;
}[] = [
  { issueType: "대상군 확대 판단", prCandidate: "PR167 Beta Metrics Review", risk: "high", codex: "조건부" },
  { issueType: "데이터 오류 반복", prCandidate: "PR168 Data Correction Workflow", risk: "high", codex: "조건부" },
  { issueType: "AI safety 반복", prCandidate: "PR164-B AI Safety Follow-up", risk: "critical", codex: "필요" },
  { issueType: "개인정보 입력 반복", prCandidate: "PR166-B Privacy Cohort Rule", risk: "critical", codex: "필요" },
  { issueType: "권한 우회 시도", prCandidate: "PR166-C Access Control Hotfix", risk: "critical", codex: "필요" },
  { issueType: "사용자 교육 부족", prCandidate: "PR153-C Beta Notice Update", risk: "medium", codex: "조건부" },
  { issueType: "cohort 관리 기능 필요", prCandidate: "PR166-D Cohort Admin Plan", risk: "high", codex: "조건부" },
  { issueType: "유료화 전환 문의 증가", prCandidate: "PR165-B Payment Notice Update", risk: "high", codex: "필요" },
] as const;

export const MANUAL_APPROVAL_RULES: readonly {
  id: string;
  rule: string;
  detail: string;
}[] = [
  { id: "no-auto", rule: "자동 승인 금지", detail: "대량 초대·자동 가입 없음" },
  { id: "ops-only", rule: "운영자 수동 검토", detail: "선정 기준·제외 기준 충족 확인" },
  { id: "aa-separate", rule: "AA allowlist 별도", detail: "베타 설계사 ≠ AI allowlist" },
  { id: "no-pii-record", rule: "기록 metadata-only", detail: "연락처·사례 원문 저장 금지" },
  { id: "codex-expand", rule: "확대 시 Codex", detail: "대상군·권한 연결 시 조건부 검수" },
] as const;

export type CohortChecklistStatus = "met" | "partial" | "pending" | "gap";

export const COHORT_CONTROL_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: CohortChecklistStatus;
}[] = [
  { id: "classify", item: "대상군 분류", criterion: "6 cohort", status: "met" },
  { id: "select", item: "선정 기준", criterion: "8 criteria", status: "met" },
  { id: "exclude", item: "제외 기준", criterion: "10 rules", status: "met" },
  { id: "expand", item: "확대 기준", criterion: "수동·Critical 0", status: "met" },
  { id: "reduce", item: "축소·중단", criterion: "12 situations", status: "met" },
  { id: "aa", item: "AA 대상 관리", criterion: "verified+allowlist", status: "met" },
  { id: "record", item: "기록 metadata", criterion: "PII·원문 금지", status: "met" },
  { id: "no-user-add", item: "beta user 추가", criterion: "PR166 미구현", status: "met" },
  { id: "no-allowlist", item: "allowlist 변경", criterion: "PR166 미변경", status: "met" },
  { id: "no-rbac", item: "Auth/RBAC 변경", criterion: "없음", status: "met" },
  { id: "metrics", item: "PR167 지표 연결", criterion: "확대 판단 입력", status: "met" },
  { id: "live-cohort", item: "live cohort 운영", criterion: "수동·별도 PR", status: "pending" },
] as const;

export const PR166_COHORT_VERDICTS = {
  cohortControlPrepared: "conditional" as CohortControlStatus,
  selectionCriteria: "ready" as CohortControlStatus,
  exclusionCriteria: "ready" as CohortControlStatus,
  aaCohortSafety: "ready" as CohortControlStatus,
  recordMetadataOnly: "ready" as CohortControlStatus,
  actualExpansionExecution: "blocked" as CohortControlStatus,
} as const;

export const PR167_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR167", title: "Beta Metrics Review", purpose: "지표 검토", risk: "High", codex: "조건부" },
  { id: "PR168", title: "Data Correction Workflow", purpose: "수정 workflow", risk: "High", codex: "조건부" },
  { id: "PR169", title: "Terms & Privacy Draft", purpose: "약관 초안", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "beta user 추가 부재",
  "role·allowlist 변경 부재",
  "verified+allowlist AA 유지",
  "선정·제외·축소 기준",
  "기록 metadata-only",
  "PII·secret 위험 부재",
  "DB/schema/package 부재",
  "PR167 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "cohort 라벨 네이밍",
  "Low 오탈자",
] as const;

export const PR166_LINKED_HUBS = [
  "PR-160-BETA-EXPANSION-DECISION-OPS.md",
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
  "PR-165-PAYMENT-LEGAL-READINESS-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
  "PR-148-AI-LIMITED-BETA-POLICY-OPS.md",
] as const;

export const PR166_CODE_REFERENCES = {
  verifiedAccess: "lib/answer-assistant/verified-access.ts",
  allowlist: "lib/answer-assistant/allowlist.ts",
  rbac: "lib/auth/rbac.ts",
  inboxPlan: "lib/ops/user-support-inbox-plan.ts",
  expansion: "lib/ops/beta-expansion-decision.ts",
} as const;

export const PR166_TEST_FILES = [
  "tests/ops/pr166-beta-cohort-control.test.ts",
  "tests/ops/pr160-beta-expansion-decision.test.ts",
  "tests/answer-assistant/allowlist-beta.test.ts",
] as const;
