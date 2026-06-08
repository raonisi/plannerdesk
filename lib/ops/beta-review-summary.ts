/**
 * Beta review summary ops standards (PR-172). Synthesis/docs only — no public beta, users, or DB.
 */

import { PR157_LAUNCH_VERDICTS, PR157_OPEN_CRITICAL_COUNT } from "@/lib/ops/beta-launch-decision";
import { PR158_FEEDBACK_VERDICTS } from "@/lib/ops/beta-feedback-loop";
import { PR159_INCIDENT_VERDICTS } from "@/lib/ops/beta-incident-drill";
import { PR160_EXPANSION_VERDICTS, PR160_OPEN_HIGH_COUNT } from "@/lib/ops/beta-expansion-decision";
import { PR161_FRESHNESS_VERDICTS } from "@/lib/ops/data-freshness-review";
import { PR162_INBOX_VERDICTS } from "@/lib/ops/user-support-inbox-plan";
import { PR163_UX_VERDICTS } from "@/lib/ops/public-ux-polish";
import { PR164_SAFETY_VERDICTS } from "@/lib/ops/ai-safety-hardening";
import { PR165_READINESS_VERDICTS } from "@/lib/ops/payment-legal-readiness";
import { PR166_COHORT_VERDICTS } from "@/lib/ops/beta-cohort-control";
import { PR167_METRICS_VERDICTS } from "@/lib/ops/beta-metrics-review";
import { PR168_CORRECTION_VERDICTS } from "@/lib/ops/data-correction-workflow";
import { PR169_DRAFT_VERDICTS } from "@/lib/ops/terms-privacy-draft-plan";
import { PR170_ARCHITECTURE_VERDICTS } from "@/lib/ops/payment-architecture-plan";
import { PR171_POLICY_VERDICTS } from "@/lib/ops/refund-support-policy-plan";
import { PR155_REGRESSION_VERDICTS } from "@/lib/ops/admin-access-regression";
import { PR154_SMOKE_VERDICTS } from "@/lib/ops/public-smoke-expansion";

export const PR172_SCOPE_NOTICE =
  "PR157~PR171 제한 베타 준비·운영 **종합 보고**입니다. 공개 베타 실행·user 추가·role/allowlist·결제·약관 확정·운영 DB·schema 변경은 포함하지 않습니다.";

export const PR172_FORBIDDEN_DOC_CONTENT =
  "종합 보고에 공개 베타 Go·약관 확정·환불 보장·결제 가능·allowlist 실값·고객정보를 넣지 않습니다.";

export type ReviewSummaryStatus = "ready" | "conditional" | "not_ready" | "blocked" | "hold";

export const REVIEW_SUMMARY_STATUS_LABEL: Record<ReviewSummaryStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
  hold: "Hold",
};

export type Pr173EntryVerdict = "go" | "conditional_go" | "hold" | "stop";

export const PR173_ENTRY_VERDICT_LABEL: Record<Pr173EntryVerdict, string> = {
  go: "Go",
  conditional_go: "Conditional Go",
  hold: "Hold",
  stop: "Stop",
};

export const PR172_OPEN_CRITICAL_COUNT = PR157_OPEN_CRITICAL_COUNT;
export const PR172_OPEN_HIGH_COUNT = PR160_OPEN_HIGH_COUNT;

export const PR172_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "chain",
    condition: "PR157~PR171 문서·SSOT 존재",
    result: "15 PR",
    met: true,
  },
  {
    id: "pr164",
    condition: "PR164 AI safety",
    result: PR164_SAFETY_VERDICTS.safetyHardeningPrepared,
    met: PR164_SAFETY_VERDICTS.accessGuardIntegrity === "ready",
  },
  {
    id: "pr168",
    condition: "PR168 데이터 수정 workflow",
    result: PR168_CORRECTION_VERDICTS.officialSourcePolicy,
    met: PR168_CORRECTION_VERDICTS.correctionWorkflowPrepared !== "not_ready",
  },
  {
    id: "pr169",
    condition: "PR169 약관 초안(확정 아님)",
    result: PR169_DRAFT_VERDICTS.legalFinalization,
    met: PR169_DRAFT_VERDICTS.legalFinalization === "blocked",
  },
  {
    id: "pr170",
    condition: "PR170 결제 구조(구현 아님)",
    result: PR170_ARCHITECTURE_VERDICTS.billingImplementation,
    met: PR170_ARCHITECTURE_VERDICTS.billingImplementation === "blocked",
  },
  {
    id: "pr171",
    condition: "PR171 환불 정책(확정 아님)",
    result: PR171_POLICY_VERDICTS.refundImplementation,
    met: PR171_POLICY_VERDICTS.refundImplementation === "blocked",
  },
  {
    id: "crit",
    condition: "Critical(정적)",
    result: String(PR172_OPEN_CRITICAL_COUNT),
    met: PR172_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "doc",
    condition: "공개 베타 실행 없이 종합만",
    result: "가능",
    met: true,
  },
] as const;

export const PR157_TO_PR171_SUMMARY: readonly {
  id: string;
  purpose: string;
  currentStatus: string;
  publicBetaImpact: string;
  remainingRisk: string;
}[] = [
  { id: "PR157", purpose: "제한 베타 실행 판단", currentStatus: PR157_LAUNCH_VERDICTS.limitedBetaLaunch, publicBetaImpact: "기준선", remainingRisk: "즉시 실행 hold·Codex" },
  { id: "PR158", purpose: "베타 피드백 운영", currentStatus: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared, publicBetaImpact: "metadata 피드백", remainingRisk: "수집 채널 not_ready" },
  { id: "PR159", purpose: "장애 대응 리허설", currentStatus: PR159_INCIDENT_VERDICTS.incidentDrillPrepared, publicBetaImpact: "장애 playbook", remainingRisk: "live drill not_ready" },
  { id: "PR160", purpose: "베타 확대 판단", currentStatus: PR160_EXPANSION_VERDICTS.limitedBetaExpansion, publicBetaImpact: "확대 보류", remainingRisk: "paid/public no_go" },
  { id: "PR161", purpose: "데이터 최신성", currentStatus: PR161_FRESHNESS_VERDICTS.freshnessReviewPrepared, publicBetaImpact: "출처·보류", remainingRisk: "live audit not_ready" },
  { id: "PR162", purpose: "오류 제보 운영", currentStatus: PR162_INBOX_VERDICTS.inboxPlanPrepared, publicBetaImpact: "PII 금지 제보", remainingRisk: "inbox not_ready" },
  { id: "PR163", purpose: "public UX", currentStatus: PR163_UX_VERDICTS.uxPolishPrepared, publicBetaImpact: "가독성·고지", remainingRisk: "mobile partial" },
  { id: "PR164", purpose: "AI safety", currentStatus: PR164_SAFETY_VERDICTS.safetyHardeningPrepared, publicBetaImpact: "지급·PII 차단", remainingRisk: "live red-team pending" },
  { id: "PR165", purpose: "유료화 법무", currentStatus: PR165_READINESS_VERDICTS.paymentLegalReadiness, publicBetaImpact: "법무 검토 필요", remainingRisk: "유료화 not_ready" },
  { id: "PR166", purpose: "베타 대상군", currentStatus: PR166_COHORT_VERDICTS.cohortControlPrepared, publicBetaImpact: "수동 승인", remainingRisk: "확대 blocked" },
  { id: "PR167", purpose: "베타 지표", currentStatus: PR167_METRICS_VERDICTS.metricsReviewPrepared, publicBetaImpact: "metadata 지표", remainingRisk: "analytics blocked" },
  { id: "PR168", purpose: "데이터 수정 workflow", currentStatus: PR168_CORRECTION_VERDICTS.correctionWorkflowPrepared, publicBetaImpact: "후속 PR 분리", remainingRisk: "live fix pending" },
  { id: "PR169", purpose: "약관·개인정보 초안", currentStatus: PR169_DRAFT_VERDICTS.termsPrivacyDraftPlan, publicBetaImpact: "초안만", remainingRisk: "법무 gap" },
  { id: "PR170", purpose: "결제 구조 계획", currentStatus: PR170_ARCHITECTURE_VERDICTS.paymentArchitecturePlan, publicBetaImpact: "PG 미구현", remainingRisk: "PG 선택 gap" },
  { id: "PR171", purpose: "환불·지원 정책", currentStatus: PR171_POLICY_VERDICTS.refundSupportPolicyPlan, publicBetaImpact: "정책 검토만", remainingRisk: "환불 확정 gap" },
] as const;

export const DOMAIN_READINESS_ASSESSMENT: readonly {
  id: string;
  domain: string;
  criteria: string;
  status: ReviewSummaryStatus;
}[] = [
  { id: "public", domain: "public route", criteria: "공개·검수 정보만", status: "conditional" },
  { id: "planner", domain: "planner route", criteria: "권한 사용자만", status: "ready" },
  { id: "admin", domain: "admin route", criteria: "관리자 전용", status: "ready" },
  { id: "visibility", domain: "public visibility", criteria: "미검수 차단", status: "ready" },
  { id: "insurer", domain: "보험사 디렉터리", criteria: "공식 출처 확인", status: "conditional" },
  { id: "claim", domain: "청구서류", criteria: "지급 확정 아님", status: "ready" },
  { id: "link", domain: "업무 링크", criteria: "공식·권한 안내", status: "conditional" },
  { id: "knowledge", domain: "지식 아카이브", criteria: "보조 자료 고지", status: "conditional" },
  { id: "search", domain: "public 검색", criteria: "공개·검수만", status: "conditional" },
  { id: "report", domain: "오류 제보", criteria: "metadata·PII 금지", status: "ready" },
  { id: "correction", domain: "데이터 수정", criteria: "공식 확인 후 PR", status: "conditional" },
  { id: "aa", domain: "Answer Assistant", criteria: "verified+allowlist", status: "ready" },
  { id: "ai-safety", domain: "AI safety", criteria: "지급·PII·injection 차단", status: "ready" },
  { id: "audit", domain: "usage audit", criteria: "원문 저장 없음", status: "ready" },
  { id: "cohort", domain: "cohort 관리", criteria: "수동 승인·중단", status: "conditional" },
  { id: "metrics", domain: "metrics", criteria: "PII 없는 지표", status: "ready" },
  { id: "terms", domain: "약관·개인정보", criteria: "초안·확정 아님", status: "conditional" },
  { id: "payment", domain: "결제 구조", criteria: "구현 없음·검토만", status: "blocked" },
  { id: "refund", domain: "환불·지원", criteria: "정책 계획·확정 아님", status: "conditional" },
] as const;

export const BETA_AGGREGATE_RISKS: readonly {
  id: string;
  risk: string;
  grade: "critical" | "high" | "medium" | "low";
  currentState: string;
  pr173Impact: string;
}[] = [
  { id: "vis", risk: "public 비공개 데이터 노출", grade: "critical", currentState: "guard 유지·정적 0", pr173Impact: "No-Go if open" },
  { id: "admin", risk: "admin 접근 우회", grade: "critical", currentState: PR155_REGRESSION_VERDICTS.regressionReady, pr173Impact: "regression 필수" },
  { id: "planner", risk: "planner 접근 우회", grade: "critical", currentState: "guard 유지", pr173Impact: "regression 필수" },
  { id: "aa-access", risk: "AA 접근 확대", grade: "critical", currentState: "blocked", pr173Impact: "No-Go if widened" },
  { id: "payout", risk: "AI 지급 확정 출력", grade: "critical", currentState: "PR164 rules ready", pr173Impact: "safety 필수" },
  { id: "pii", risk: "PII 입력 유도", grade: "critical", currentState: "차단 규칙 ready", pr173Impact: "safety 필수" },
  { id: "raw", risk: "prompt/response 원문 저장", grade: "critical", currentState: "metadata-only", pr173Impact: "audit 필수" },
  { id: "secret", risk: "secret/token 노출", grade: "critical", currentState: "정적 0", pr173Impact: "No-Go" },
  { id: "migrate", risk: "운영 DB migration 위험", grade: "critical", currentState: "build no migrate", pr173Impact: "No-Go" },
  { id: "billing", risk: "결제 기능 노출", grade: "critical", currentState: "blocked", pr173Impact: "No-Go" },
  { id: "terms-final", risk: "약관·개인정보 확정 표현", grade: "critical", currentState: "blocked", pr173Impact: "No-Go" },
  { id: "refund-final", risk: "환불정책 확정 표현", grade: "critical", currentState: "blocked", pr173Impact: "No-Go" },
  { id: "claim-err", risk: "청구서류 오류 반복", grade: "high", currentState: "workflow ready", pr173Impact: "correction PR" },
  { id: "insurer-err", risk: "보험사 정보 오류 반복", grade: "high", currentState: "workflow ready", pr173Impact: "correction PR" },
  { id: "link-err", risk: "링크 오류 반복", grade: "medium", currentState: "workflow ready", pr173Impact: "backlog" },
  { id: "support", risk: "고객지원 미처리 누적", grade: "high", currentState: "plan only", pr173Impact: "PR177" },
  { id: "ux", risk: "UX 불편 반복", grade: "medium", currentState: "conditional", pr173Impact: "polish" },
  { id: "typo", risk: "문구 오탈자", grade: "low", currentState: "backlog", pr173Impact: "low" },
] as const;

export const PUBLIC_BETA_NO_GO: readonly {
  id: string;
  situation: string;
  judgment: string;
}[] = [
  { id: "crit", situation: "Critical 리스크 1건 이상", judgment: "No-Go" },
  { id: "admin-pub", situation: "public에서 admin/planner 접근", judgment: "No-Go" },
  { id: "unpub", situation: "미검수·비공개 public 노출", judgment: "No-Go" },
  { id: "aa-wide", situation: "AA 접근 제한 완화", judgment: "No-Go" },
  { id: "no-allow", situation: "allowlist 없는 AI 접근", judgment: "No-Go" },
  { id: "ai-bad", situation: "지급 확정·PII 유도", judgment: "No-Go" },
  { id: "raw", situation: "원문 저장 가능성", judgment: "No-Go" },
  { id: "secret", situation: "secret 노출 가능성", judgment: "No-Go" },
  { id: "migrate", situation: "운영 DB migration 위험", judgment: "No-Go" },
  { id: "claim-dis", situation: "청구서류 책임 고지 누락", judgment: "No-Go" },
  { id: "source", situation: "공식 확인 전 데이터 확정", judgment: "No-Go" },
  { id: "terms", situation: "약관·개인정보 확정 표현", judgment: "No-Go" },
  { id: "refund", situation: "환불정책 확정 표현", judgment: "No-Go" },
  { id: "pay", situation: "결제·PG·checkout 노출", judgment: "No-Go" },
  { id: "pii-rec", situation: "지원 기록 PII 허용", judgment: "No-Go" },
  { id: "schema", situation: "검토 없는 schema/package 변경", judgment: "No-Go" },
] as const;

export const PR173_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  required: boolean;
  status: "met" | "partial" | "gap" | "pending";
}[] = [
  { id: "crit0", condition: "Critical 0", required: true, status: "met" },
  { id: "high", condition: "High 통제 가능", required: true, status: "partial" },
  { id: "smoke", condition: "public smoke", required: true, status: "met" },
  { id: "admin-reg", condition: "admin regression", required: true, status: "met" },
  { id: "planner", condition: "planner guard", required: true, status: "met" },
  { id: "aa-safe", condition: "AA safety", required: true, status: "met" },
  { id: "allowlist", condition: "verified+allowlist", required: true, status: "met" },
  { id: "audit", condition: "metadata-only audit", required: true, status: "met" },
  { id: "fresh", condition: "데이터 최신성", required: true, status: "partial" },
  { id: "corr", condition: "수정 workflow", required: true, status: "met" },
  { id: "inbox", condition: "오류 제보", required: true, status: "partial" },
  { id: "cohort", condition: "cohort 기준", required: true, status: "met" },
  { id: "metrics", condition: "metrics 기준", required: true, status: "met" },
  { id: "terms", condition: "약관 초안 계획", required: true, status: "met" },
  { id: "pay-block", condition: "결제·환불 미확정", required: true, status: "met" },
  { id: "no-bill", condition: "결제 기능 없음", required: true, status: "met" },
  { id: "codex", condition: "Codex 판단", required: true, status: "pending" },
] as const;

export const PR173_ENTRY_CRITERIA: readonly {
  verdict: Pr173EntryVerdict;
  criteria: string;
}[] = [
  { verdict: "go", criteria: "Critical 0·High 통제·핵심 기준 준비·Codex 통과" },
  { verdict: "conditional_go", criteria: "Critical 0·High 일부·PR173 검토 가능·공개 실행 금지" },
  { verdict: "hold", criteria: "정보 부족·High 반복·준비 미흡" },
  { verdict: "stop", criteria: "Critical 존재·권한·PII·AI·결제 노출" },
] as const;

export const PR172_SUMMARY_CONCLUSIONS: readonly {
  id: Pr173EntryVerdict;
  label: string;
  text: string;
}[] = [
  {
    id: "conditional_go",
    label: "Conditional Go (권장)",
    text: "Critical 리스크는 확인되지 않았으나 High·정보 부족 항목이 남아 있습니다. PR173 진입은 조건부로 가능하나 실제 공개 베타 실행 전 추가 검증이 필요합니다.",
  },
  {
    id: "go",
    label: "Go",
    text: "제한 베타 운영 준비 문서와 핵심 안전 기준이 정리되었습니다. PR173 Public Release Readiness Review 진입 가능 상태로만 판단하며 정식 공개·유료화·결제는 별도 검토입니다.",
  },
  {
    id: "hold",
    label: "Hold",
    text: "일부 기준은 정리되었으나 공개 베타 검토로 넘어가기에 정보 부족 또는 High 리스크가 남아 있습니다. PR173 전 데이터·AI·지원·약관 기준 보완이 필요합니다.",
  },
  {
    id: "stop",
    label: "Stop",
    text: "Critical 리스크가 존재하면 PR173 진입을 중단합니다. visibility·권한·PII·AA·결제·DB 위험 중 하나라도 확인 시 Stop입니다.",
  },
] as const;

export const PR173_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR173", title: "Public Release Readiness Review", purpose: "공개 베타 가능성", risk: "Critical", codex: "필수" },
  { id: "PR174", title: "Terms Legal Review Prep", purpose: "법무 검토 전달", risk: "Critical", codex: "필수" },
  { id: "PR175", title: "Payment Provider Comparison", purpose: "PG 후보 비교", risk: "High", codex: "조건부" },
  { id: "PR176", title: "Billing Data Architecture Review", purpose: "결제 데이터 구조", risk: "Critical", codex: "필수" },
  { id: "PR177", title: "Support Operations Design", purpose: "고객지원 운영 설계", risk: "High", codex: "조건부" },
  { id: "PR178", title: "Public Beta Gate Checklist", purpose: "공개 베타 gate", risk: "Critical", codex: "필수" },
] as const;

export type SummaryChecklistStatus = "met" | "partial" | "pending" | "gap";

export const BETA_REVIEW_SUMMARY_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: SummaryChecklistStatus;
}[] = [
  { id: "chain", item: "PR157~171 종합", criterion: "15 PR", status: "met" },
  { id: "domain", item: "영역별 평가", criterion: "19 domains", status: "met" },
  { id: "risk", item: "종합 리스크", criterion: "18 items", status: "met" },
  { id: "nogo", item: "No-Go", criterion: "16 items", status: "met" },
  { id: "pr173", item: "PR173 진입 조건", criterion: "17 items", status: "met" },
  { id: "verdict", item: "진입 판단", criterion: "4 levels", status: "met" },
  { id: "no-pub", item: "공개 베타 실행", criterion: "PR172 미실행", status: "met" },
  { id: "no-user", item: "user/role/allowlist", criterion: "변경 없음", status: "met" },
  { id: "no-db", item: "운영 DB", criterion: "접근 없음", status: "met" },
  { id: "pub-exec", item: "실제 공개 실행", criterion: "PR173+ only", status: "pending" },
] as const;

export const PR172_REVIEW_VERDICTS = {
  betaReviewSummary: "conditional" as ReviewSummaryStatus,
  synthesisComplete: "ready" as ReviewSummaryStatus,
  pr173Entry: "conditional_go" as Pr173EntryVerdict,
  publicBetaExecution: "blocked" as ReviewSummaryStatus,
  paidMonetization: "blocked" as ReviewSummaryStatus,
} as const;

export const PR172_CODE_REFERENCES = {
  smoke: PR154_SMOKE_VERDICTS.smokeExpansionReady,
  adminRegression: PR155_REGRESSION_VERDICTS.regressionReady,
  aaSafety: PR164_SAFETY_VERDICTS.accessGuardIntegrity,
  visibility: "lib/public/visibility.ts",
  verifiedAccess: "lib/answer-assistant/verified-access.ts",
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "PR157~171 종합 누락",
  "Critical/High 분류",
  "공개 베타 No-Go",
  "PR173 진입 조건",
  "visibility·권한·PII·AA",
  "약관·환불·결제 확정 부재",
  "공개 베타 실행 부재",
  "role/allowlist/DB 변경 부재",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "PR 번호 가정",
  "live 운영 수치",
] as const;

export const PR172_LINKED_HUBS = [
  "PR-157-BETA-LAUNCH-DECISION-OPS.md",
  "PR-167-BETA-METRICS-REVIEW-OPS.md",
  "PR-168-DATA-CORRECTION-WORKFLOW-OPS.md",
  "PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md",
  "PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md",
  "PR-171-REFUND-SUPPORT-POLICY-PLAN-OPS.md",
] as const;

export const PR172_FORBIDDEN_PHRASES: readonly string[] = [
  "공개 베타 즉시 실행",
  "정식 공개 승인",
  "약관 확정",
  "환불 보장",
  "결제 가능",
  "유료화 시작",
] as const;

export const PR172_TEST_FILES = [
  "tests/ops/pr172-beta-review-summary.test.ts",
  "tests/ops/pr157-beta-launch-decision.test.ts",
  "tests/ops/pr171-refund-support-policy-plan.test.ts",
] as const;
