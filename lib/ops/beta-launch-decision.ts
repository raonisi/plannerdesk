/**
 * Limited beta launch decision — PR140~PR156 synthesis (PR-157). Decision only — no execution.
 */

import { PR156_RED_TEAM_VERDICTS } from "@/lib/ops/answer-assistant-red-team";
import { PR155_REGRESSION_VERDICTS } from "@/lib/ops/admin-access-regression";
import { PR154_SMOKE_VERDICTS } from "@/lib/ops/public-smoke-expansion";
import { PR153_PACK_VERDICTS } from "@/lib/ops/beta-user-notice-pack";
import { PR152_OPERATOR_VERDICTS } from "@/lib/ops/beta-operator-checklist";
import { PR151_DRY_RUN_VERDICTS } from "@/lib/ops/external-beta-dry-run";
import {
  PR150_FINAL_VERDICTS,
  PR150_OPEN_CRITICAL_COUNT,
  type RiskGrade,
} from "@/lib/ops/external-release-decision";

export const PR157_SCOPE_NOTICE =
  "PR140~PR156 결과를 종합한 제한 베타 **실행 여부 판단**입니다. 실제 배포·외부 공개·beta user·role·allowlist·운영 DB·provider 호출은 포함하지 않습니다.";

export const PR157_FORBIDDEN_DOC_CONTENT =
  "판단 문서에 secret·고객정보·allowlist 실값·초대 링크·실제 가격을 넣지 않습니다.";

export type BetaLaunchVerdict = "launch" | "conditional_launch" | "hold" | "no_go";

export const BETA_LAUNCH_VERDICT_LABEL: Record<BetaLaunchVerdict, string> = {
  launch: "Launch",
  conditional_launch: "Conditional Launch",
  hold: "Hold",
  no_go: "No-Go",
};

export type LaunchCheckStatus = "met" | "partial" | "pending" | "gap";

/** Re-export for panel — PR150 critical baseline unchanged. */
export const PR157_OPEN_CRITICAL_COUNT = PR150_OPEN_CRITICAL_COUNT;

export const PR157_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr150",
    condition: "PR150 제한 베타 No-Go 아님",
    result: PR150_FINAL_VERDICTS.limitedExternalBeta,
    met: PR150_FINAL_VERDICTS.limitedExternalBeta !== "no_go",
  },
  {
    id: "pr151",
    condition: "PR151 dry-run Conditional Go 이상",
    result: PR151_DRY_RUN_VERDICTS.externalBetaDryRun,
    met: PR151_DRY_RUN_VERDICTS.externalBetaDryRun !== "no_go",
  },
  {
    id: "pr152",
    condition: "PR152 Conditional Ready 이상",
    result: PR152_OPERATOR_VERDICTS.checklistPrepared,
    met: PR152_OPERATOR_VERDICTS.checklistPrepared !== "not_ready",
  },
  {
    id: "pr153",
    condition: "PR153 안내문 세트 준비",
    result: PR153_PACK_VERDICTS.noticePackPrepared,
    met: PR153_PACK_VERDICTS.noticePackPrepared !== "not_ready",
  },
  {
    id: "pr154",
    condition: "PR154 public smoke",
    result: PR154_SMOKE_VERDICTS.smokeExpansionReady,
    met: PR154_SMOKE_VERDICTS.smokeExpansionReady !== "not_ready",
  },
  {
    id: "pr155",
    condition: "PR155 admin regression",
    result: PR155_REGRESSION_VERDICTS.regressionReady,
    met: PR155_REGRESSION_VERDICTS.regressionReady !== "not_ready",
  },
  {
    id: "pr156",
    condition: "PR156 AI red-team",
    result: PR156_RED_TEAM_VERDICTS.redTeamReady,
    met: PR156_RED_TEAM_VERDICTS.redTeamReady !== "not_ready",
  },
  {
    id: "crit",
    condition: "Critical(정적) 0",
    result: String(PR157_OPEN_CRITICAL_COUNT),
    met: PR157_OPEN_CRITICAL_COUNT === 0,
  },
  {
    id: "codex",
    condition: "Codex 제한검수",
    result: "원칙적 필수·미완",
    met: false,
  },
] as const;

/** PR140~PR156 synthesis for launch decision. */
export const PR140_TO_156_SYNTHESIS: readonly {
  pr: string;
  purpose: string;
  verdict: string;
  remainingRisk: string;
  status: LaunchCheckStatus;
}[] = [
  { pr: "PR140", purpose: "유료화/외부 공개 준비", verdict: "conditional_go", remainingRisk: "유료화·정식 공개 별도", status: "met" },
  { pr: "PR141", purpose: "제한 베타 준비", verdict: "conditional", remainingRisk: "수동 온보딩", status: "met" },
  { pr: "PR142", purpose: "약관·개인정보 계획", verdict: "partial", remainingRisk: "법무 확정 전", status: "partial" },
  { pr: "PR143", purpose: "고객지원·장애", verdict: "playbook", remainingRisk: "실운영 검증", status: "met" },
  { pr: "PR144", purpose: "landing 안전", verdict: "conditional", remainingRisk: "과장·유료화 오해 금지", status: "met" },
  { pr: "PR145", purpose: "결제 보류", verdict: "no_go 실행", remainingRisk: "결제·PG 없음", status: "met" },
  { pr: "PR146", purpose: "베타/AI 분리", verdict: "설계만", remainingRisk: "베타≠AA", status: "met" },
  { pr: "PR147", purpose: "데이터 책임", verdict: "conditional", remainingRisk: "최신성 보장 없음", status: "met" },
  { pr: "PR148", purpose: "AA 제한 정책", verdict: "conditional_go", remainingRisk: "PR148-B~H hardening", status: "partial" },
  { pr: "PR149", purpose: "보안 감사", verdict: "conditional_go", remainingRisk: "bulk 경계", status: "met" },
  { pr: "PR150", purpose: "외부 공개 판단", verdict: "conditional_go", remainingRisk: "Codex·High", status: "met" },
  { pr: "PR151", purpose: "dry-run", verdict: "conditional_go", remainingRisk: "런타임 E2E", status: "partial" },
  { pr: "PR152", purpose: "운영자 체크리스트", verdict: "conditional_ready", remainingRisk: "실행은 not_ready", status: "met" },
  { pr: "PR153", purpose: "사용자 안내문", verdict: "conditional_ready", remainingRisk: "외부 발송 not_ready", status: "met" },
  { pr: "PR154", purpose: "public smoke", verdict: "conditional_ready", remainingRisk: "HTTP smoke 보류", status: "partial" },
  { pr: "PR155", purpose: "admin regression", verdict: "conditional_ready", remainingRisk: "HTTP admin E2E", status: "partial" },
  { pr: "PR156", purpose: "AA red-team", verdict: "conditional_ready", remainingRisk: "secret classifier·provider", status: "partial" },
] as const;

export const LAUNCH_DECISION_CRITERIA: readonly {
  verdict: BetaLaunchVerdict;
  criteria: string;
}[] = [
  {
    verdict: "launch",
    criteria:
      "Critical 0, High 0, Codex 통과, smoke/regression/red-team 런타임 포함 통과, 운영자·안내 완료",
  },
  {
    verdict: "conditional_launch",
    criteria:
      "Critical 0, High 일부·정보 gap을 제한 조건·후속 PR로 분리, Codex 제한검수 필요",
  },
  { verdict: "hold", criteria: "Critical 0이나 실행 전 확인 부족이 핵심 영역에 집중" },
  {
    verdict: "no_go",
    criteria: "Critical 존재, public/admin/AI 우회, PII·secret·운영 DB 위험",
  },
] as const;

export const FEATURE_LAUNCH_FINAL: readonly {
  feature: string;
  execution: "allow" | "conditional" | "hold" | "forbid";
  condition: string;
  holdReason: string;
}[] = [
  { feature: "보험사 디렉터리", execution: "allow", condition: "검수·공개·출처 고지", holdReason: "미검수 노출" },
  { feature: "청구서류", execution: "allow", condition: "지급 비확정·공식 확인", holdReason: "고지 부족" },
  { feature: "업무 링크", execution: "allow", condition: "만료·접근 고지", holdReason: "링크 오류" },
  { feature: "지식 아카이브", execution: "allow", condition: "상담 보조 고지", holdReason: "가입 유도" },
  { feature: "public 검색", execution: "allow", condition: "PUBLIC_*_WHERE", holdReason: "미검수 결과" },
  { feature: "planner 업무 화면", execution: "conditional", condition: "세션·역할", holdReason: "public 노출" },
  { feature: "즐겨찾기", execution: "allow", condition: "PII 저장 없음", holdReason: "고객정보" },
  {
    feature: "Answer Assistant",
    execution: "conditional",
    condition: "verified+allowlist·output safety",
    holdReason: "접근 확대·provider",
  },
  { feature: "관리자·bulk·운영 패널", execution: "forbid", condition: "admin 전용", holdReason: "외부 노출" },
  { feature: "운영 이슈·변경 이력·리포트", execution: "forbid", condition: "admin 전용", holdReason: "내부 정보" },
  { feature: "결제/구독", execution: "hold", condition: "PR145·법무", holdReason: "결제 없음" },
  { feature: "회원가입 확대", execution: "hold", condition: "수동 승인만", holdReason: "자동 가입 금지" },
] as const;

export const FINAL_LAUNCH_RISKS: readonly {
  risk: string;
  grade: RiskGrade;
  state: string;
  judgment: string;
}[] = [
  { risk: "public 비공개 데이터 노출", grade: "critical", state: "통제(정적)", judgment: "met" },
  { risk: "admin 권한 우회", grade: "critical", state: "통제(정적)", judgment: "met" },
  { risk: "planner public 노출", grade: "critical", state: "통제", judgment: "met" },
  { risk: "Answer Assistant 접근 확대", grade: "critical", state: "통제", judgment: "met" },
  { risk: "AI red-team Critical 실패", grade: "critical", state: "통제(정적)", judgment: "met" },
  { risk: "PII·민감정보 저장", grade: "critical", state: "통제", judgment: "met" },
  { risk: "prompt/response 원문 저장", grade: "critical", state: "통제", judgment: "met" },
  { risk: "secret/env/API key 노출", grade: "critical", state: "통제(문서)", judgment: "met" },
  { risk: "build CI migrate 자동 실행", grade: "critical", state: "통제", judgment: "met" },
  { risk: "결제/회원가입 노출", grade: "critical", state: "통제", judgment: "met" },
  { risk: "청구서류 오류 가능성", grade: "high", state: "잔존", judgment: "운영 점검" },
  { risk: "업무 링크 만료", grade: "high", state: "잔존", judgment: "PR147" },
  { risk: "약관·개인정보 미확정", grade: "high", state: "잔존", judgment: "PR142" },
  { risk: "런타임 smoke/E2E 부재", grade: "high", state: "gap", judgment: "PR154·PR155" },
  { risk: "AA secret classifier partial", grade: "high", state: "partial", judgment: "PR156·PR148-C" },
  { risk: "content_admin bulk 경계", grade: "high", state: "잔존", judgment: "PR139" },
  { risk: "고객지원 실운영 지연", grade: "high", state: "잔존", judgment: "PR143" },
  { risk: "모바일 사용성", grade: "medium", state: "수용", judgment: "베타 범위" },
  { risk: "문구 오탈자", grade: "low", state: "수용", judgment: "지속 수정" },
] as const;

export const PRE_LAUNCH_REQUIRED: readonly {
  id: string;
  condition: string;
  required: boolean;
  status: LaunchCheckStatus;
}[] = [
  { id: "c0", condition: "Critical 0", required: true, status: "met" },
  { id: "smoke", condition: "public smoke(정적)", required: true, status: "met" },
  { id: "admin", condition: "admin regression(정적)", required: true, status: "met" },
  { id: "aa", condition: "AA red-team(정적)", required: true, status: "met" },
  { id: "route", condition: "public/admin/planner 분리", required: true, status: "met" },
  { id: "aa-gate", condition: "verified+allowlist", required: true, status: "met" },
  { id: "audit", condition: "usage audit metadata-only", required: true, status: "met" },
  { id: "pii", condition: "PII 입력 금지 안내", required: true, status: "met" },
  { id: "claim", condition: "청구·데이터 책임", required: true, status: "met" },
  { id: "support", condition: "PR143 지원·장애", required: true, status: "met" },
  { id: "op", condition: "PR152 운영자 체크리스트", required: true, status: "met" },
  { id: "notice", condition: "PR153 사용자 안내", required: true, status: "met" },
  { id: "halt", condition: "즉시 중단 기준", required: true, status: "met" },
  { id: "build", condition: "build/CI 안전", required: true, status: "met" },
  { id: "nopay", condition: "결제·가입·발송 없음", required: true, status: "met" },
  { id: "codex", condition: "Codex 제한검수", required: true, status: "pending" },
  { id: "rt", condition: "런타임 HTTP smoke/E2E", required: false, status: "gap" },
  { id: "legal", condition: "약관·개인정보(법무)", required: true, status: "partial" },
] as const;

export const IN_FLIGHT_HALT_CRITERIA: readonly { situation: string; action: string }[] = [
  { situation: "public admin/planner 접근", action: "즉시 중단" },
  { situation: "미검수·비공개 public 노출", action: "즉시 중단" },
  { situation: "운영 데이터 public 노출", action: "즉시 중단" },
  { situation: "일반 planner AA 접근", action: "즉시 중단" },
  { situation: "allowlist 없이 AA 접근", action: "즉시 중단" },
  { situation: "AI 지급 확정·PII 유도·가입 유도", action: "AI 중단 검토" },
  { situation: "prompt injection·secret 노출", action: "즉시 중단" },
  { situation: "build migrate 운영 DB", action: "즉시 중단" },
  { situation: "결제/가입 의도치 않게 노출", action: "즉시 중단" },
] as const;

export const LIMITED_BETA_OPS_FINAL: readonly { item: string; rule: string }[] = [
  { item: "대상", rule: "소수·수동 승인" },
  { item: "회원가입", rule: "확대 금지" },
  { item: "초대", rule: "PR157에서 실행하지 않음" },
  { item: "기능", rule: "FEATURE_LAUNCH_FINAL allow/conditional만" },
  { item: "Answer Assistant", rule: "verified+allowlist·provider stub" },
  { item: "PII", rule: "입력·저장 금지" },
  { item: "장애", rule: "PR143" },
  { item: "기록", rule: "metadata 중심" },
  { item: "중단", rule: "Critical 즉시" },
  { item: "확대", rule: "PR160 이후" },
  { item: "유료화", rule: "보류" },
] as const;

export const LAUNCH_VERDICT_COPY: Record<
  BetaLaunchVerdict,
  { summary: string; conditions: string }
> = {
  launch: {
    summary:
      "Critical/High 해소·Codex 통과·smoke/regression/red-team·운영자·안내 완료 시에만 해당.",
    conditions: "별도 승인·수동 절차·정식 공개/유료화 아님.",
  },
  conditional_launch: {
    summary:
      "Critical 0, High·정보 gap 일부 잔존. 소수·수동·기능 제한·즉시 중단 전제로 조건부 검토 가능.",
    conditions: "Codex 제한검수·High 보완 완료 전 실제 실행 보류.",
  },
  hold: {
    summary: "핵심 영역 실행 전 확인 부족으로 실행 보류.",
    conditions: "보완 PR 우선.",
  },
  no_go: {
    summary: "Critical 존재 시 실행 불가.",
    conditions: "보완·재검수 후 재판단.",
  },
};

export const PR157_LAUNCH_VERDICTS = {
  /** 제한 베타 실행 가능성 (문서 판단) */
  limitedBetaLaunch: "conditional_launch" as BetaLaunchVerdict,
  /** Codex 전 Launch 금지 원칙 */
  overallUntilCodex: "conditional_launch" as BetaLaunchVerdict,
  /** PR157 시점 즉시 실행 — Codex·High·런타임 gap */
  immediateExecution: "hold" as BetaLaunchVerdict,
  publicBeta: "no_go" as BetaLaunchVerdict,
  paidBeta: "no_go" as BetaLaunchVerdict,
  formalMonetization: "no_go" as BetaLaunchVerdict,
} as const;

export const PR157_OPEN_HIGH_COUNT = FINAL_LAUNCH_RISKS.filter(
  (r) => r.grade === "high",
).length;

export const PR158_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백 수집", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Beta Incident Drill", purpose: "장애 리허설", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
  { id: "PR161", title: "Data Freshness Review", purpose: "최신성 점검", risk: "High", codex: "조건부" },
  { id: "PR162", title: "User Support Inbox", purpose: "제보 운영", risk: "High", codex: "조건부" },
  { id: "PR164", title: "AI Safety Hardening", purpose: "AA 보강", risk: "Critical", codex: "필수" },
  { id: "PR165", title: "Payment Legal Readiness", purpose: "유료화 법무", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "PR140~PR156 종합 누락",
  "Launch/Conditional/Hold/No-Go 적절성",
  "Critical/High 분류",
  "smoke·regression·red-team 반영",
  "public/admin/planner·AA 제한",
  "audit metadata-only",
  "PII·secret·build/CI",
  "결제/가입/발송 부재",
  "실행 전 필수·중단 기준",
  "PR158 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 미세 취향",
] as const;

export const PR157_LINKED_HUBS = [
  "PR-156-ANSWER-ASSISTANT-RED-TEAM-OPS.md",
  "PR-155-ADMIN-ACCESS-REGRESSION-OPS.md",
  "PR-154-PUBLIC-SMOKE-EXPANSION-OPS.md",
  "PR-150-EXTERNAL-RELEASE-DECISION-OPS.md",
] as const;

export const PR157_TEST_FILES = [
  "tests/ops/pr157-beta-launch-decision.test.ts",
  "tests/ops/pr156-answer-assistant-red-team.test.ts",
  "tests/ops/pr155-admin-access-regression.test.ts",
  "tests/ops/pr154-public-smoke-expansion.test.ts",
] as const;

export const PR150_CRITICAL_BASELINE = PR150_OPEN_CRITICAL_COUNT;
