/**
 * Beta expansion decision — PR157~PR159 synthesis (PR-160). Decision only — no expansion execution.
 */

import { PR156_RED_TEAM_VERDICTS } from "@/lib/ops/answer-assistant-red-team";
import { PR155_REGRESSION_VERDICTS } from "@/lib/ops/admin-access-regression";
import { PR154_SMOKE_VERDICTS } from "@/lib/ops/public-smoke-expansion";
import {
  PR158_FEEDBACK_VERDICTS,
  PR158_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/beta-feedback-loop";
import {
  CRITICAL_INCIDENT_SCENARIOS,
  PR159_INCIDENT_VERDICTS,
} from "@/lib/ops/beta-incident-drill";
import {
  FEATURE_LAUNCH_FINAL,
  IN_FLIGHT_HALT_CRITERIA,
  PR157_LAUNCH_VERDICTS,
  PR157_OPEN_CRITICAL_COUNT,
} from "@/lib/ops/beta-launch-decision";
import type { RiskGrade } from "@/lib/ops/external-release-decision";

export const PR160_SCOPE_NOTICE =
  "PR157~PR159 결과를 종합한 제한 베타 **확대 여부 판단**입니다. 실제 beta user 추가·초대·공지·role·allowlist·운영 DB·provider 호출은 포함하지 않습니다.";

export const PR160_FORBIDDEN_DOC_CONTENT =
  "판단 문서에 secret·고객정보·allowlist 실값·초대 링크·실제 가격을 넣지 않습니다.";

export type BetaExpansionVerdict =
  | "expansion"
  | "conditional_expansion"
  | "maintain"
  | "reduce"
  | "stop";

export const BETA_EXPANSION_VERDICT_LABEL: Record<BetaExpansionVerdict, string> = {
  expansion: "Expansion",
  conditional_expansion: "Conditional Expansion",
  maintain: "Maintain",
  reduce: "Reduce",
  stop: "Stop",
};

export type ExpansionCheckStatus = "met" | "partial" | "pending" | "gap";

export const PR160_OPEN_CRITICAL_COUNT = PR157_OPEN_CRITICAL_COUNT;

export const PR160_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr157",
    condition: "PR157 Conditional Launch 이상",
    result: PR157_LAUNCH_VERDICTS.limitedBetaLaunch,
    met: PR157_LAUNCH_VERDICTS.limitedBetaLaunch !== "no_go",
  },
  {
    id: "pr158",
    condition: "PR158 Conditional Ready 이상",
    result: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared,
    met: PR158_FEEDBACK_VERDICTS.feedbackLoopPrepared !== "not_ready",
  },
  {
    id: "pr159",
    condition: "PR159 Conditional Ready 이상",
    result: PR159_INCIDENT_VERDICTS.incidentDrillPrepared,
    met: PR159_INCIDENT_VERDICTS.incidentDrillPrepared !== "not_ready",
  },
  {
    id: "crit",
    condition: "Critical(정적) 0",
    result: String(PR160_OPEN_CRITICAL_COUNT),
    met: PR160_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "feedback",
    condition: "피드백 metadata-only",
    result: PR158_FEEDBACK_VERDICTS.deidentificationSafety,
    met: PR158_FEEDBACK_VERDICTS.deidentificationSafety === "ready",
  },
  {
    id: "halt",
    condition: "장애 즉시 중단 기준",
    result: `${IN_FLIGHT_HALT_CRITERIA.length}건`,
    met: IN_FLIGHT_HALT_CRITERIA.length > 0,
  },
  {
    id: "aa",
    condition: "Answer Assistant red-team",
    result: PR156_RED_TEAM_VERDICTS.redTeamReady,
    met: PR156_RED_TEAM_VERDICTS.redTeamReady !== "not_ready",
  },
  {
    id: "codex",
    condition: "Codex 제한검수",
    result: "원칙적 필수·미완",
    met: false,
  },
] as const;

/** PR157~PR159 synthesis for expansion decision. */
export const PR157_TO_159_SYNTHESIS: readonly {
  pr: string;
  purpose: string;
  verdict: string;
  remainingRisk: string;
  status: ExpansionCheckStatus;
}[] = [
  {
    pr: "PR157",
    purpose: "제한 베타 실행 판단",
    verdict: "conditional_launch",
    remainingRisk: "Codex·High·런타임 gap",
    status: "met",
  },
  {
    pr: "PR158",
    purpose: "피드백 운영",
    verdict: "conditional_ready",
    remainingRisk: "inbox(PR162)·실운영 샘플",
    status: "partial",
  },
  {
    pr: "PR159",
    purpose: "장애 리허설",
    verdict: "conditional_ready",
    remainingRisk: "live drill·실장애 샘플",
    status: "partial",
  },
] as const;

export const EXPANSION_DECISION_CRITERIA: readonly {
  verdict: BetaExpansionVerdict;
  criteria: string;
}[] = [
  {
    verdict: "expansion",
    criteria:
      "Critical 0, High 0, Codex 통과, smoke/regression/red-team/feedback/drill 통과",
  },
  {
    verdict: "conditional_expansion",
    criteria:
      "Critical 0, High·gap을 제한 조건·후속 PR로 분리, Codex 필요",
  },
  { verdict: "maintain", criteria: "Critical 0이나 확대 근거 부족·정보 gap" },
  { verdict: "reduce", criteria: "일부 기능·범위 리스크로 축소 필요" },
  {
    verdict: "stop",
    criteria: "Critical 존재, public/admin/AI/PII/secret/운영 DB 위험",
  },
] as const;

export const FEATURE_EXPANSION_FINAL: readonly {
  feature: string;
  expansion: "allow" | "conditional" | "hold" | "forbid";
  condition: string;
  holdReason: string;
}[] = [
  { feature: "보험사 디렉터리", expansion: "allow", condition: "검수·공개·출처", holdReason: "미검수" },
  { feature: "청구서류", expansion: "allow", condition: "공식 확인·지급 비확정", holdReason: "PR161" },
  { feature: "업무 링크", expansion: "allow", condition: "만료 고지", holdReason: "링크 오류" },
  { feature: "지식 아카이브", expansion: "allow", condition: "상담 보조 고지", holdReason: "가입 유도" },
  { feature: "public 검색", expansion: "allow", condition: "PUBLIC_*_WHERE", holdReason: "미검수" },
  { feature: "planner 업무 화면", expansion: "conditional", condition: "세션·역할", holdReason: "public 노출" },
  { feature: "즐겨찾기", expansion: "allow", condition: "PII 없음", holdReason: "고객정보" },
  {
    feature: "Answer Assistant",
    expansion: "hold",
    condition: "verified+allowlist 유지·확대 보류",
    holdReason: "접근·provider·PR164",
  },
  { feature: "관리자·bulk·운영 패널", expansion: "forbid", condition: "admin 전용", holdReason: "외부 확대 금지" },
  { feature: "운영 이슈·변경 이력", expansion: "forbid", condition: "admin 전용", holdReason: "내부 정보" },
  { feature: "결제/구독", expansion: "hold", condition: "PR145·법무", holdReason: "결제 없음" },
  { feature: "회원가입 확대", expansion: "hold", condition: "수동 승인만", holdReason: "자동 가입 금지" },
] as const;

export const FINAL_EXPANSION_RISKS: readonly {
  risk: string;
  grade: RiskGrade;
  state: string;
  judgment: string;
}[] = [
  { risk: "public 비공개 데이터 노출", grade: "critical", state: "통제(정적)", judgment: "met" },
  { risk: "admin 권한 우회", grade: "critical", state: "통제(정적)", judgment: "met" },
  { risk: "planner public 노출", grade: "critical", state: "통제", judgment: "met" },
  { risk: "Answer Assistant 접근 확대", grade: "critical", state: "통제·확대 보류", judgment: "met" },
  { risk: "AI safety failure", grade: "critical", state: "통제(정적)", judgment: "met" },
  { risk: "PII·민감정보 저장", grade: "critical", state: "통제", judgment: "met" },
  { risk: "prompt/response 원문 저장", grade: "critical", state: "통제", judgment: "met" },
  { risk: "secret/env/API key 노출", grade: "critical", state: "통제(문서)", judgment: "met" },
  { risk: "build CI migrate 자동 실행", grade: "critical", state: "통제", judgment: "met" },
  { risk: "결제/회원가입 노출", grade: "critical", state: "통제", judgment: "met" },
  { risk: "청구서류 오류 반복", grade: "high", state: "잔존", judgment: "PR161" },
  { risk: "보험사 정보 오류 반복", grade: "high", state: "잔존", judgment: "PR161" },
  { risk: "업무 링크 만료 반복", grade: "high", state: "잔존", judgment: "PR161" },
  { risk: "고객지원 대응 지연", grade: "high", state: "잔존", judgment: "PR143·PR162" },
  { risk: "피드백 처리 누락", grade: "high", state: "gap", judgment: "inbox 미구현" },
  { risk: "런타임 smoke/E2E gap", grade: "high", state: "gap", judgment: "PR154·PR155" },
  { risk: "AA secret classifier partial", grade: "high", state: "partial", judgment: "PR164" },
  { risk: "검색 품질", grade: "medium", state: "수용", judgment: "PR163" },
  { risk: "모바일 사용성", grade: "medium", state: "수용", judgment: "베타" },
  { risk: "문구 오탈자", grade: "low", state: "수용", judgment: "polish" },
] as const;

export const PRE_EXPANSION_REQUIRED: readonly {
  id: string;
  condition: string;
  required: boolean;
  status: ExpansionCheckStatus;
}[] = [
  { id: "c0", condition: "Critical 0", required: true, status: "met" },
  { id: "high", condition: "High 0 또는 통제 조건", required: true, status: "partial" },
  { id: "smoke", condition: "public smoke(정적)", required: true, status: "met" },
  { id: "admin", condition: "admin regression(정적)", required: true, status: "met" },
  { id: "aa", condition: "AA red-team(정적)", required: true, status: "met" },
  { id: "fb", condition: "PR158 Feedback Loop", required: true, status: "met" },
  { id: "drill", condition: "PR159 Incident Drill", required: true, status: "met" },
  { id: "meta", condition: "피드백 metadata-only", required: true, status: "met" },
  { id: "noraw", condition: "prompt/response 원문 없음", required: true, status: "met" },
  { id: "pii", condition: "PII 입력 금지", required: true, status: "met" },
  { id: "secret", condition: "secret 노출 없음", required: true, status: "met" },
  { id: "build", condition: "build/CI 안전", required: true, status: "met" },
  { id: "nopay", condition: "결제·가입·발송 없음", required: true, status: "met" },
  { id: "fresh", condition: "데이터 최신성 계획(PR161)", required: true, status: "partial" },
  { id: "support", condition: "고객지원 기준", required: true, status: "met" },
  { id: "codex", condition: "Codex 제한검수", required: true, status: "pending" },
  { id: "rt", condition: "런타임 HTTP smoke/E2E", required: false, status: "gap" },
  { id: "live", condition: "실제 베타 운영 샘플", required: false, status: "gap" },
] as const;

export const IN_FLIGHT_REDUCE_HALT_CRITERIA: readonly {
  situation: string;
  action: string;
}[] = [
  ...IN_FLIGHT_HALT_CRITERIA.map((r) => ({ situation: r.situation, action: r.action })),
  { situation: "feedback 기록 원문 저장 위험", action: "즉시 중단" },
  { situation: "청구서류 오류 반복", action: "해당 데이터 임시 보류" },
  { situation: "고객지원 대응 불능", action: "확대 중단·대상 축소" },
] as const;

export const EXPANSION_COHORT_CRITERIA: readonly { item: string; rule: string }[] = [
  { item: "규모", rule: "소수 추가만" },
  { item: "승인", rule: "수동 승인" },
  { item: "회원가입", rule: "전체 확대 금지" },
  { item: "초대", rule: "PR160에서 실행하지 않음" },
  { item: "사용자", rule: "검증·운영자 확인 사용자" },
  { item: "기능", rule: "allow/conditional만" },
  { item: "관리자", rule: "외부 금지" },
  { item: "Answer Assistant", rule: "verified+allowlist·확대 보류" },
  { item: "피드백", rule: "비식별 metadata" },
  { item: "중단", rule: "Critical 시 제한" },
  { item: "유료화", rule: "확대와 분리·보류" },
] as const;

export const EXPANSION_VERDICT_COPY: Record<
  BetaExpansionVerdict,
  { summary: string; conditions: string }
> = {
  expansion: {
    summary: "Critical/High 해소·Codex·전 검증 통과 시에만 해당.",
    conditions: "별도 승인·수동·정식 공개/유료화 아님.",
  },
  conditional_expansion: {
    summary:
      "Critical 0, High·gap 잔존. 소수·수동·기능 제한·즉시 중단 전제 조건부 검토.",
    conditions: "Codex·High 보완 전 실제 확대 보류.",
  },
  maintain: {
    summary: "운영 유지 가능하나 확대 근거 부족.",
    conditions: "PR161·지원·AI safety·사용성 우선.",
  },
  reduce: {
    summary: "일부 기능·범위 축소 필요.",
    conditions: "AA·대상·기능 범위 재검토.",
  },
  stop: {
    summary: "Critical 존재 시 확대 불가.",
    conditions: "긴급 보완·운영 중단 검토.",
  },
};

export const PR160_EXPANSION_VERDICTS = {
  /** 제한 베타 확대 가능성 (문서) */
  limitedBetaExpansion: "conditional_expansion" as BetaExpansionVerdict,
  /** Codex 전 Expansion 금지 */
  overallUntilCodex: "conditional_expansion" as BetaExpansionVerdict,
  /** PR160 시점 — 실운영 샘플·Codex·High gap */
  immediateExpansion: "maintain" as BetaExpansionVerdict,
  publicBeta: "stop" as BetaExpansionVerdict,
  paidBeta: "stop" as BetaExpansionVerdict,
  formalMonetization: "stop" as BetaExpansionVerdict,
} as const;

export const PR160_OPEN_HIGH_COUNT = FINAL_EXPANSION_RISKS.filter(
  (r) => r.grade === "high",
).length;

export const PR161_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR161", title: "Data Freshness Review", purpose: "최신성 점검", risk: "High", codex: "조건부" },
  { id: "PR162", title: "User Support Inbox Plan", purpose: "제보 운영", risk: "High", codex: "조건부" },
  { id: "PR163", title: "Public UX Polish", purpose: "사용성", risk: "Medium", codex: "불필요" },
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
  { id: "PR166", title: "Beta Cohort Control", purpose: "대상군 관리", risk: "High", codex: "조건부" },
  { id: "PR167", title: "Beta Metrics Review", purpose: "지표 검토", risk: "High", codex: "조건부" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "PR157~PR159 종합 누락",
  "Expansion/Conditional/Maintain/Reduce/Stop 적절성",
  "Critical/High 분류",
  "smoke·regression·red-team·feedback·drill 반영",
  "확대/보류 기능 구분",
  "AA verified+allowlist·확대 보류",
  "audit·피드백 metadata-only",
  "PII·secret·build/CI",
  "결제/가입/발송 부재",
  "PR161 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR160_LINKED_HUBS = [
  "PR-159-BETA-INCIDENT-DRILL-OPS.md",
  "PR-158-BETA-FEEDBACK-LOOP-OPS.md",
  "PR-157-BETA-LAUNCH-DECISION-OPS.md",
  "PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md",
  "PR-155-ADMIN-ACCESS-REGRESSION-OPS.md",
  "PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS.md",
] as const;

export const PR160_TEST_FILES = [
  "tests/ops/pr160-beta-expansion-decision.test.ts",
  "tests/ops/pr159-beta-incident-drill.test.ts",
] as const;

/** Re-export — PR158 critical baseline unchanged. */
export const PR158_CRITICAL_BASELINE = PR158_OPEN_CRITICAL_COUNT;

/** PR159 critical scenarios count for drill linkage. */
export const PR159_CRITICAL_SCENARIO_COUNT = CRITICAL_INCIDENT_SCENARIOS.length;

/** PR157 feature baseline for expansion feature table reference. */
export const PR157_FEATURE_BASELINE_COUNT = FEATURE_LAUNCH_FINAL.length;
