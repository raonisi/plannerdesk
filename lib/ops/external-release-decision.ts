/**
 * External release decision — PR140~PR149 synthesis (PR-150). Decision only — no launch.
 */

import {
  RELEASE_VERDICT_LABEL,
  type ReleaseVerdict,
} from "@/lib/ops/external-release-readiness";

export type { ReleaseVerdict };

export const PR150_SCOPE_NOTICE =
  "PR140~PR149 결과를 종합한 최종 외부 공개 여부 판단입니다. 실제 배포·외부 공개·role·allowlist·운영 DB 변경은 포함하지 않습니다.";

export const PR150_FORBIDDEN_DOC_CONTENT =
  "판단 문서에 secret·고객정보·실제 가격·PG 계약·allowlist 실값을 넣지 않습니다.";

export type PrReadinessStatus = "complete" | "partial" | "blocked";

export const PR140_TO_149_ENTRY: readonly {
  pr: string;
  topic: string;
  hub: string;
  status: PrReadinessStatus;
  verdict: string;
}[] = [
  { pr: "PR140", topic: "외부 공개/유료화 분리", hub: "PR-140-EXTERNAL-RELEASE-READINESS-OPS.md", status: "complete", verdict: "판단만" },
  { pr: "PR141", topic: "제한 베타 범위", hub: "PR-141-LIMITED-BETA-OPS.md", status: "complete", verdict: "conditional" },
  { pr: "PR142", topic: "약관·개인정보 계획", hub: "PR-142-TERMS-PRIVACY-PLAN-OPS.md", status: "partial", verdict: "법무 미확정" },
  { pr: "PR143", topic: "고객지원·장애", hub: "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md", status: "complete", verdict: "playbook" },
  { pr: "PR144", topic: "landing 안전성", hub: "PR-144-PUBLIC-LANDING-SAFETY-OPS.md", status: "complete", verdict: "conditional" },
  { pr: "PR145", topic: "결제 보류", hub: "PR-145-PAYMENT-FEASIBILITY-OPS.md", status: "complete", verdict: "no_go 실행" },
  { pr: "PR146", topic: "베타/AI 분리", hub: "PR-146-BETA-ACCESS-REQUEST-FLOW-OPS.md", status: "complete", verdict: "설계만" },
  { pr: "PR147", topic: "데이터 책임", hub: "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md", status: "complete", verdict: "conditional" },
  { pr: "PR148", topic: "AA 제한 정책", hub: "PR-148-AI-LIMITED-BETA-POLICY-OPS.md", status: "complete", verdict: "conditional" },
  { pr: "PR149", topic: "보안 최종 감사", hub: "PR-149-SECURITY-FINAL-AUDIT-OPS.md", status: "complete", verdict: "conditional" },
] as const;

export const RELEASE_STAGE_FINAL: readonly {
  stage: string;
  verdict: ReleaseVerdict;
  basis: string;
  conditions: string;
}[] = [
  { stage: "내부 운영 유지", verdict: "go", basis: "PR140~149 문서·admin 운영 가능", conditions: "현재 단계 유지" },
  {
    stage: "외부 제한 베타",
    verdict: "conditional_go",
    basis: "Critical(정적) 0 · visibility·RBAC·AA 제한 유지",
    conditions: "High 보완·Codex·Antigravity·운영자 수동 승인",
  },
  {
    stage: "공개 베타",
    verdict: "no_go",
    basis: "PR150 원칙: 제한 베타 운영·추가 검증 전 보류",
    conditions: "제한 베타 안정화·PR154 smoke·PR157 판단 후",
  },
  { stage: "유료 베타", verdict: "no_go", basis: "PR145·PR142 미완", conditions: "결제·약관·환불·지원" },
  { stage: "정식 유료화", verdict: "no_go", basis: "PR150에서 Go 불가", conditions: "전체 체크리스트+법무" },
] as const;

export const FEATURE_RELEASE_FINAL: readonly {
  feature: string;
  limitedBeta: "allow" | "hold" | "forbid";
  openCondition: string;
  holdCondition: string;
}[] = [
  { feature: "보험사 디렉터리", limitedBeta: "allow", openCondition: "검수·isPublished·출처 고지", holdCondition: "미검수 노출" },
  { feature: "청구서류", limitedBeta: "allow", openCondition: "지급 비확정·공식 확인 고지", holdCondition: "서류 오류·고지 부족" },
  { feature: "지식 아카이브", limitedBeta: "allow", openCondition: "상담 보조 고지", holdCondition: "가입 유도·공포 조장" },
  { feature: "업무 링크", limitedBeta: "allow", openCondition: "접근·만료 고지", holdCondition: "링크 오류 반복" },
  { feature: "고급 통합 검색", limitedBeta: "allow", openCondition: "공개 정보만", holdCondition: "미검수 결과" },
  { feature: "통합 업무 대시보드", limitedBeta: "hold", openCondition: "역할 분리 확인", holdCondition: "관리자 정보 노출" },
  { feature: "즐겨찾기", limitedBeta: "allow", openCondition: "PII 저장 없음", holdCondition: "고객정보 저장" },
  { feature: "Answer Assistant", limitedBeta: "hold", openCondition: "verified+allowlist·PR148", holdCondition: "접근 확대·원문 저장" },
  { feature: "관리자·bulk·운영 리포트", limitedBeta: "forbid", openCondition: "—", holdCondition: "외부 노출 시 No-Go" },
] as const;

export type RiskGrade = "critical" | "high" | "medium" | "low";

export const FINAL_RISK_REGISTER: readonly {
  risk: string;
  grade: RiskGrade;
  state: string;
  judgment: string;
}[] = [
  { risk: "비공개 데이터 public 노출", grade: "critical", state: "통제(정적)", judgment: "met — visibility guard" },
  { risk: "admin 권한 우회", grade: "critical", state: "통제", judgment: "met — getAdminAccess" },
  { risk: "AA 접근 확대", grade: "critical", state: "통제", judgment: "met — allowlist" },
  { risk: "audit 원문 저장", grade: "critical", state: "통제", judgment: "met — schema" },
  { risk: "secret 노출", grade: "critical", state: "통제", judgment: "met — 문서·CI" },
  { risk: "build migrate 자동 실행", grade: "critical", state: "통제", judgment: "met — package.json" },
  { risk: "결제/가입 무단 추가", grade: "critical", state: "통제", judgment: "met — no routes" },
  { risk: "청구서류 오류", grade: "high", state: "잔존", judgment: "운영 점검·PR147" },
  { risk: "링크 만료 반복", grade: "high", state: "잔존", judgment: "PR134·PR147" },
  { risk: "약관·개인정보 미확정", grade: "high", state: "잔존", judgment: "PR142" },
  { risk: "AA hardening 미완", grade: "high", state: "잔존", judgment: "PR148-B~H" },
  { risk: "content_admin bulk 경계", grade: "high", state: "잔존", judgment: "PR139·PR149" },
  { risk: "모바일 UI", grade: "medium", state: "수용", judgment: "베타 범위 외 우선" },
  { risk: "문구 오탈자", grade: "low", state: "수용", judgment: "지속 수정" },
] as const;

export const PRE_RELEASE_REQUIRED: readonly {
  id: string;
  condition: string;
  required: boolean;
  status: "met" | "partial" | "pending";
}[] = [
  { id: "c0", condition: "Critical 리스크 0개(정적)", required: true, status: "met" },
  { id: "vis", condition: "public visibility 안전", required: true, status: "met" },
  { id: "route", condition: "public/planner/admin 분리", required: true, status: "met" },
  { id: "aa", condition: "AA verified+allowlist", required: true, status: "met" },
  { id: "audit", condition: "usage audit metadata-only", required: true, status: "met" },
  { id: "pii", condition: "PII 입력 금지 안내", required: true, status: "met" },
  { id: "claim", condition: "청구·데이터 책임 고지", required: true, status: "met" },
  { id: "support", condition: "PR143 지원·장애", required: true, status: "met" },
  { id: "halt", condition: "Critical 중단 기준", required: true, status: "met" },
  { id: "nopay", condition: "결제·가입·발송 없음", required: true, status: "met" },
  { id: "build", condition: "build/CI 안전", required: true, status: "met" },
  { id: "ag", condition: "Antigravity 최종 검수", required: true, status: "pending" },
  { id: "codex", condition: "Codex 제한검수", required: true, status: "pending" },
  { id: "legal", condition: "약관·개인정보(법무)", required: true, status: "partial" },
] as const;

export const LIMITED_BETA_OPS_CONDITIONS: readonly { item: string; rule: string }[] = [
  { item: "대상", rule: "소수 검증 설계사·수동 승인" },
  { item: "자동 가입", rule: "금지" },
  { item: "기능", rule: "FEATURE_RELEASE_FINAL allow/hold" },
  { item: "Answer Assistant", rule: "별도 allowlist·PR148" },
  { item: "PII", rule: "입력·저장 금지" },
  { item: "오류 제보", rule: "PR143" },
  { item: "Critical", rule: "즉시 중단·rollback" },
  { item: "유료화", rule: "PR150 이후에도 보류" },
] as const;

export const PR150_DECISION_CRITERIA: readonly { verdict: ReleaseVerdict; criteria: string }[] = [
  { verdict: "go", criteria: "Critical·High 0, Codex 완료, 운영자 Go" },
  { verdict: "conditional_go", criteria: "Critical 0, High 분리·제한 베타만" },
  { verdict: "no_go", criteria: "Critical 존재 또는 실행 조건 미충족" },
] as const;

export const PR150_FINAL_VERDICTS = {
  internalOps: "go" as ReleaseVerdict,
  limitedExternalBeta: "conditional_go" as ReleaseVerdict,
  publicBeta: "no_go" as ReleaseVerdict,
  paidBeta: "no_go" as ReleaseVerdict,
  formalMonetization: "no_go" as ReleaseVerdict,
  /** Codex·Antigravity 전 최종 Go 불가 */
  overallUntilCodex: "conditional_go" as ReleaseVerdict,
} as const;

/** Open Critical defects from static PR149 audit — not used as Go evidence alone. */
export const PR150_OPEN_CRITICAL_COUNT = 0;

export const PR151_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR151", title: "External Beta Dry Run", purpose: "공개 전 dry-run", risk: "High", codex: "필수" },
  { id: "PR152", title: "Beta Operator Checklist", purpose: "운영자 체크리스트", risk: "Medium~High", codex: "조건부" },
  { id: "PR153", title: "Beta User Notice Pack", purpose: "베타 안내문", risk: "Medium~High", codex: "조건부" },
  { id: "PR154", title: "Public Smoke Expansion", purpose: "public smoke", risk: "High", codex: "조건부" },
  { id: "PR155", title: "Admin Access Regression", purpose: "admin 회귀", risk: "Critical", codex: "필수" },
  { id: "PR156", title: "AA Red-Team Test", purpose: "AI safety", risk: "Critical", codex: "필수" },
  { id: "PR157", title: "Beta Launch Decision", purpose: "실행 여부", risk: "Critical", codex: "필수" },
  { id: "PR158", title: "Beta Feedback Loop", purpose: "피드백 운영", risk: "High", codex: "조건부" },
  { id: "PR159", title: "Incident Drill", purpose: "장애 리허설", risk: "High", codex: "조건부" },
  { id: "PR160", title: "Beta Expansion Decision", purpose: "베타 확대", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "PR140~PR149 누락",
  "Go/Conditional/No-Go 적절성",
  "public visibility·RBAC·route 분리",
  "Answer Assistant allowlist",
  "audit metadata-only",
  "PII·secret·build/CI",
  "제한 베타 vs 공개/유료 베타 분리",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "Low 오탈자",
  "UI 취향",
] as const;

export const PR150_LINKED_HUBS = [
  "PR-140-EXTERNAL-RELEASE-READINESS-OPS.md",
  "PR-149-SECURITY-FINAL-AUDIT-OPS.md",
  "PR-148-AI-LIMITED-BETA-POLICY-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
] as const;

export { RELEASE_VERDICT_LABEL } from "@/lib/ops/external-release-readiness";
