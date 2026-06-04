/**
 * Limited external beta readiness copy (PR-141). Preparation only — no launch, no signup form.
 */

export const PR141_SCOPE_NOTICE =
  "제한 베타는 소수 검증 설계사에 대한 수동 승인·운영자 온보딩만 전제합니다. 실제 외부 공개 실행, 회원가입 확대, 자동 승인, 베타 신청 폼, 결제, allowlist 변경은 하지 않습니다.";

export const PR141_FORBIDDEN_DOC_CONTENT =
  "베타 문서에 고객정보·상담 원문·secret·token·env·초대 링크 토큰·실제 연락처를 넣지 않습니다.";

export type BetaReadinessVerdict = "ready" | "conditional" | "hold" | "no_go";

export const BETA_READINESS_VERDICT_LABEL: Record<BetaReadinessVerdict, string> = {
  ready: "제한 베타 가능",
  conditional: "조건부 가능",
  hold: "보류",
  no_go: "No-Go",
};

/** PR140 limited_beta = conditional_go — PR141 operationalizes gates. */
export const PR141_OVERALL_VERDICT: BetaReadinessVerdict = "conditional";

export const PR141_OVERALL_CONDITIONS = [
  "PR140 제한 베타 Conditional Go 전제",
  "PR117 런타임 smoke·OPS/FB Critical 0",
  "베타 대상 수동 승인·자동 가입 없음",
  "PR146 베타 신청 UI는 별도 PR",
] as const;

export type BetaScopeCell = "allowed" | "conditional" | "restricted" | "forbidden";

export const BETA_SCOPE_ROWS: readonly {
  id: string;
  label: string;
  scope: BetaScopeCell;
  criterion: string;
}[] = [
  {
    id: "directory",
    label: "보험사 디렉터리",
    scope: "conditional",
    criterion: "검수 완료·isPublished·PUBLIC_VERIFICATION",
  },
  {
    id: "claim-docs",
    label: "청구서류",
    scope: "conditional",
    criterion: "공식 출처·검수; 오류 시 High",
  },
  {
    id: "knowledge",
    label: "지식 아카이브",
    scope: "conditional",
    criterion: "PR125 문구·미검수 미노출",
  },
  {
    id: "work-links",
    label: "업무 링크/전산",
    scope: "restricted",
    criterion: "확인 완료만; 접근 권한 안내",
  },
  {
    id: "search",
    label: "고급 통합 검색",
    scope: "conditional",
    criterion: "PR132 미검수/비공개 미노출",
  },
  {
    id: "dashboard",
    label: "통합 업무 대시보드",
    scope: "conditional",
    criterion: "PR131 public/planner/admin 분리",
  },
  {
    id: "favorites",
    label: "즐겨찾기",
    scope: "restricted",
    criterion: "PR135 local id only; PII 없음",
  },
  {
    id: "admin",
    label: "관리자 기능",
    scope: "forbidden",
    criterion: "getAdminAccess",
  },
  {
    id: "ops-panels",
    label: "운영 리포트/리마인더",
    scope: "forbidden",
    criterion: "admin only",
  },
  {
    id: "change-history",
    label: "변경 이력",
    scope: "forbidden",
    criterion: "admin metadata",
  },
  {
    id: "admin-bulk",
    label: "Admin bulk",
    scope: "forbidden",
    criterion: "super_admin 운영",
  },
  {
    id: "answer-assistant",
    label: "Answer Assistant",
    scope: "restricted",
    criterion: "verified_planner + allowlist; 확대 금지",
  },
] as const;

export const BETA_USER_CRITERIA: readonly { label: string; rule: string }[] = [
  { label: "대상", rule: "신뢰 가능한 소수 외부 설계사" },
  { label: "승인", rule: "운영자 수동 검토·승인 (자동 승인 금지)" },
  { label: "가입 확대", rule: "금지 — 공개 가입 폼 없음" },
  { label: "개인정보", rule: "신규 수집·입력 유도 금지" },
  { label: "이용 목적", rule: "기능 검증·오류 제보·실무 사용성" },
  { label: "Answer Assistant", rule: "allowlist verified만; admin 아님" },
  { label: "관리자", rule: "접근 금지" },
  { label: "중단", rule: "Critical 시 즉시 이용 제한 가능" },
] as const;

export const BETA_USER_GUIDANCE: readonly string[] = [
  "현재 PlannerDesk는 제한 베타 단계입니다.",
  "검수 완료된 공개 정보 중심으로 제공됩니다.",
  "보험금 지급 여부는 약관, 사고 내용, 보험사 심사에 따라 달라질 수 있습니다.",
  "고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.",
  "링크와 청구 정보는 공식 출처 기준으로 지속 점검 중입니다.",
  "오류를 발견하면 운영 이슈(PR-129)로 제보해 주세요.",
] as const;

export const BETA_USER_FORBIDDEN_PHRASES: readonly string[] = [
  "정식 출시 완료",
  "유료 서비스 시작",
  "보험금 지급 확정",
  "무조건 지급",
  "가입하면 해결",
  "최신 정보 100% 보장",
  "고객정보를 입력하면 더 정확합니다",
  "모든 설계사 자동 가입 가능",
  "AI 상담 전면 공개",
] as const;

export type BetaOpsStatus =
  | "preparing"
  | "internal_review"
  | "limited_beta_ready"
  | "conditional"
  | "hold"
  | "paused"
  | "re_review";

export const BETA_OPS_STATUS_ROWS: readonly {
  status: BetaOpsStatus;
  label: string;
  meaning: string;
  action: string;
}[] = [
  {
    status: "preparing",
    label: "준비 중",
    meaning: "체크리스트 정리",
    action: "공개 실행 금지",
  },
  {
    status: "internal_review",
    label: "내부 검토",
    meaning: "visibility·권한 확인",
    action: "PR141 체크리스트",
  },
  {
    status: "limited_beta_ready",
    label: "제한 베타 가능",
    meaning: "소수 수동 승인",
    action: "조건·안내 문구 적용",
  },
  {
    status: "conditional",
    label: "조건부 가능",
    meaning: "High 보완 필요",
    action: "PR134·PR124·PR117",
  },
  {
    status: "hold",
    label: "보류",
    meaning: "정보 부족·리스크",
    action: "추가 검증",
  },
  {
    status: "paused",
    label: "중단",
    meaning: "Critical 발생",
    action: "즉시 공개 중단",
  },
  {
    status: "re_review",
    label: "재검토",
    meaning: "수정 후 판단",
    action: "Antigravity/Codex",
  },
] as const;

export const BETA_ISSUE_ROWS: readonly {
  issue: string;
  severity: "critical" | "high" | "medium" | "low";
  action: string;
}[] = [
  {
    issue: "미검수/비공개 데이터 노출",
    severity: "critical",
    action: "즉시 중단",
  },
  { issue: "권한 우회", severity: "critical", action: "즉시 중단" },
  { issue: "관리자 정보 노출", severity: "critical", action: "즉시 중단" },
  { issue: "개인정보 저장 위험", severity: "critical", action: "즉시 중단" },
  { issue: "Answer Assistant 우회", severity: "critical", action: "즉시 중단" },
  { issue: "잘못된 청구정보", severity: "high", action: "빠른 수정 PR" },
  { issue: "링크 오류", severity: "high", action: "PR134 점검" },
  { issue: "검색 결과 오류", severity: "high", action: "PR132 후속" },
  { issue: "모바일 UI", severity: "medium", action: "UX 보완" },
  { issue: "문구 오해", severity: "high", action: "문구 수정" },
  { issue: "단순 오탈자", severity: "low", action: "backlog" },
] as const;

export type ChecklistStatus = "met" | "partial" | "gap";

export const LIMITED_BETA_CHECKLIST: readonly {
  id: string;
  label: string;
  status: ChecklistStatus;
  note: string;
}[] = [
  { id: "visibility", label: "public visibility", status: "met", note: "getPublic*" },
  { id: "rbac", label: "Auth/RBAC 분리", status: "met", note: "PR139" },
  { id: "admin-leak", label: "관리자 정보 미노출", status: "met", note: "PR131~138" },
  { id: "data", label: "데이터 품질 기준", status: "partial", note: "PR122·124" },
  { id: "links", label: "링크 신뢰도", status: "partial", note: "PR134 수동" },
  { id: "search", label: "검색 안전성", status: "met", note: "PR132" },
  { id: "dashboard", label: "대시보드 분리", status: "met", note: "PR131" },
  { id: "aa", label: "Answer Assistant 제한", status: "met", note: "PR137 allowlist" },
  { id: "pii", label: "개인정보 수집 없음", status: "met", note: "신규 폼 없음" },
  { id: "errors", label: "오류 상태 안전", status: "met", note: "secret/stack 미노출" },
  { id: "mobile", label: "모바일", status: "partial", note: "실기기 gap" },
  { id: "ops-issues", label: "운영 이슈 흐름", status: "met", note: "PR129" },
  { id: "rollback", label: "중단 기준", status: "met", note: "PR141·PR115" },
  { id: "verify", label: "lint/typecheck/test/build", status: "met", note: "PR105" },
  { id: "runtime-smoke", label: "PR117 HTTP smoke", status: "gap", note: "G1 운영자" },
  { id: "manual-approval", label: "수동 승인 절차 문서", status: "met", note: "PR141·PR129" },
] as const;

export const BETA_HALT_ROWS: readonly { situation: string; action: string }[] = [
  { situation: "미검수/비공개 public 노출", action: "즉시 중단" },
  { situation: "관리자 정보 public 노출", action: "즉시 중단" },
  { situation: "권한 우회", action: "즉시 중단" },
  { situation: "개인정보·민감정보 저장 위험", action: "즉시 중단" },
  { situation: "secret/token/env 노출", action: "즉시 중단" },
  { situation: "AA allowlist 우회", action: "즉시 중단" },
  { situation: "보험금 지급 확정 표현", action: "긴급 수정" },
  { situation: "청구정보 반복 오류", action: "공개 범위 축소" },
  { situation: "링크 오류 반복", action: "링크 제한·점검" },
  { situation: "운영자 대응 불가", action: "베타 보류" },
] as const;

export const BETA_DEFERRED_FEATURES: readonly {
  feature: string;
  reason: string;
  followUp: string;
}[] = [
  { feature: "베타 신청 폼·자동 승인", reason: "PII·가입 확대", followUp: "PR146" },
  { feature: "대량 초대·마케팅 발송", reason: "개인정보·스팸", followUp: "PR138-B" },
  { feature: "Answer Assistant 공개 확대", reason: "Critical", followUp: "PR148" },
  { feature: "결제·유료 문구", reason: "법무·PG", followUp: "PR145" },
  { feature: "공개 베타 전체", reason: "제한 베타 안정 후", followUp: "PR150" },
] as const;

export const BETA_MANUAL_APPROVAL_FLOW: readonly string[] = [
  "1. 운영자가 PR141 체크리스트·PR140 Conditional Go 확인",
  "2. 베타 후보는 기존 계정·수동 role/검증 (자동 가입 없음)",
  "3. PR-129 OPS Registry에 베타 온보딩·이슈 채널 기록",
  "4. Answer Assistant는 allowlist env 수동만 (PR141에서 변경 금지)",
  "5. Critical 이슈 시 BETA_HALT 기준으로 즉시 중단",
] as const;

export const SCOPE_CELL_LABEL: Record<BetaScopeCell, string> = {
  allowed: "공개 가능",
  conditional: "조건부",
  restricted: "제한",
  forbidden: "금지",
};
