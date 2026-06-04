/**
 * Beta access request flow design copy (PR-146). Design only — no form, no allowlist change.
 */

import { BETA_USER_FORBIDDEN_PHRASES } from "@/lib/ops/limited-beta-readiness";

export const PR146_SCOPE_NOTICE =
  "제한 베타 **신청 흐름 설계**입니다. 신청 폼, waitlist DB, 자동 승인, 대량 초대, 이메일/SMS, allowlist·role 실제 변경은 포함하지 않습니다.";

export const PR146_FORBIDDEN_DOC_CONTENT =
  "설계 문서에 고객정보·상담 원문·secret·token·env·초대 링크 실값을 넣지 않습니다.";

export type BetaRequestStatus =
  | "draft"
  | "received"
  | "needs_review"
  | "needs_more_info"
  | "approved_pending_access"
  | "approved_limited"
  | "rejected"
  | "paused"
  | "revoked"
  | "closed";

export const BETA_REQUEST_STATUS_LABEL: Record<BetaRequestStatus, string> = {
  draft: "draft (내부 준비)",
  received: "received (접수 가정)",
  needs_review: "needs_review",
  needs_more_info: "needs_more_info",
  approved_pending_access: "approved_pending_access",
  approved_limited: "approved_limited",
  rejected: "rejected",
  paused: "paused",
  revoked: "revoked",
  closed: "closed",
};

export const BETA_REQUEST_FLOW_STEPS: readonly {
  step: number;
  title: string;
  pr146: string;
}[] = [
  { step: 1, title: "관심 표현", pr146: "문서 기준만" },
  { step: 2, title: "기본 적합성 검토", pr146: "수동 검토 기준" },
  { step: 3, title: "개인정보 수집 제한", pr146: "필수 고지" },
  { step: 4, title: "기능 범위 안내", pr146: "PR-141·PR-144" },
  { step: 5, title: "운영자 수동 승인", pr146: "자동 승인 금지" },
  { step: 6, title: "접근 부여 전 확인", pr146: "visibility·권한 체크" },
  { step: 7, title: "베타 운영", pr146: "PR-143 연계" },
  { step: 8, title: "접근 해제", pr146: "revoked 기준" },
  { step: 9, title: "재검토", pr146: "별도 검토" },
] as const;

export const APPLICANT_REVIEW_ROWS: readonly {
  item: string;
  criteria: string;
  required: boolean;
}[] = [
  { item: "설계사 여부", criteria: "보험 영업 실무 사용 목적", required: true },
  { item: "사용 목적", criteria: "보험사·청구·지식·링크 탐색", required: true },
  { item: "민감정보 이해", criteria: "고객정보·민감정보 입력 금지", required: true },
  { item: "피드백 가능성", criteria: "오류 제보·사용성", required: false },
  { item: "보안 이해", criteria: "계정 공유·내부정보 공유 금지", required: true },
  { item: "AI 기능 이해", criteria: "AA 별도 제한", required: true },
  { item: "유료화 오해 방지", criteria: "현재 유료 서비스 아님", required: true },
  { item: "중단 가능성", criteria: "베타 중단 수용", required: true },
] as const;

export const HOLD_REJECT_TRIGGERS: readonly {
  trigger: string;
  action: "hold" | "reject";
}[] = [
  { trigger: "고객정보 입력 요구", action: "reject" },
  { trigger: "자동 가입·전체 기능 즉시 사용 요구", action: "reject" },
  { trigger: "Answer Assistant 전면 사용 요구", action: "reject" },
  { trigger: "관리자 기능 접근 요구", action: "reject" },
  { trigger: "최신성 100%·지급 확정 요구", action: "reject" },
  { trigger: "계정 공유 목적", action: "reject" },
  { trigger: "책임 범위 오해", action: "hold" },
  { trigger: "사용 목적 불명확", action: "hold" },
  { trigger: "운영 리스크 확인 전", action: "hold" },
] as const;

export const PII_FORBIDDEN_AT_INTAKE: readonly string[] = [
  "고객명",
  "주민번호",
  "연락처(고객)",
  "주소",
  "계약번호",
  "보험증권 번호",
  "병력 상세",
  "진단명 원문",
  "상담 원문 전체",
  "가족정보",
  "계좌정보",
  "결제정보",
  "신분증 이미지",
  "보험증권 이미지",
  "secret/token/env",
] as const;

export const PII_ALLOWED_CANDIDATES: readonly {
  field: string;
  note: string;
}[] = [
  { field: "신청자 이름 또는 별칭", note: "법무·개인정보 검토 필요" },
  { field: "업무용 이메일", note: "법무·개인정보 검토 필요" },
  { field: "소속·활동 형태", note: "민감정보 없이 요약" },
  { field: "사용 목적", note: "요약만" },
  { field: "피드백 가능 여부", note: "선택" },
  { field: "개인정보 입력 금지 동의", note: "법무 검토 필요" },
] as const;

export const ACCESS_SCOPE_ROWS: readonly {
  scope: string;
  rule: string;
  betaOk: boolean;
  aaSeparate: boolean;
}[] = [
  { scope: "public 정보", rule: "검수 완료 공개만", betaOk: true, aaSeparate: false },
  { scope: "planner 기능", rule: "제한 베타 허용 후", betaOk: true, aaSeparate: false },
  { scope: "admin·운영·bulk", rule: "외부 베타 금지", betaOk: false, aaSeparate: false },
  { scope: "Answer Assistant", rule: "verified + allowlist 별도", betaOk: false, aaSeparate: true },
  { scope: "결제/유료", rule: "PR145 보류", betaOk: false, aaSeparate: false },
] as const;

export const BETA_USER_NOTICE_GOOD: readonly string[] = [
  "PlannerDesk는 현재 제한 베타 준비 단계입니다.",
  "베타 접근은 운영자 수동 검토 후 제한적으로 허용됩니다.",
  "검수 완료된 공개 정보와 운영 기준을 중심으로 제공됩니다.",
  "고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는 입력하지 마세요.",
  "청구서류와 업무 링크는 보험사 정책과 공식 페이지 변경에 따라 달라질 수 있습니다.",
  "보험금 지급 여부는 약관, 사고 내용, 제출 서류, 보험사 심사 기준에 따라 달라질 수 있습니다.",
  "Answer Assistant는 별도 허용된 사용자에게만 제한적으로 제공됩니다.",
  "운영 리스크가 확인되면 베타 접근이 일시 중단될 수 있습니다.",
] as const;

export const BETA_USER_NOTICE_FORBIDDEN: readonly string[] = [
  ...BETA_USER_FORBIDDEN_PHRASES,
  "누구나 자동 승인",
  "전체 기능 즉시 사용",
  "신청 즉시 가입 완료",
  "관리자 기능 체험 가능",
] as const;

export const APPROVAL_CRITERIA: readonly { criterion: string; detail: string }[] = [
  { criterion: "사용 목적 명확", detail: "설계사 업무·청구·지식 탐색" },
  { criterion: "PII 금지 이해", detail: "고객·민감정보 미입력" },
  { criterion: "제한 기능 이해", detail: "admin·AA·유료 제한" },
  { criterion: "오류 제보 가능", detail: "PR-143 연계" },
  { criterion: "중단 수용", detail: "PR-141 halt" },
] as const;

export const REVOCATION_ROWS: readonly {
  situation: string;
  action: string;
}[] = [
  { situation: "PII 입력 시도", action: "안내·필요 시 revoked" },
  { situation: "고객정보 저장·공유", action: "revoked 후보" },
  { situation: "admin 접근 시도", action: "revoked 후보" },
  { situation: "계정 공유", action: "revoked" },
  { situation: "스크래핑·자동화", action: "revoked" },
  { situation: "AA 우회 시도", action: "즉시 제한" },
  { situation: "운영 Critical", action: "전체 베타 중단 가능" },
  { situation: "장기 미사용", action: "보류·해제 검토" },
] as const;

export type BetaAccessCheckStatus = "met" | "partial" | "gap";

export const BETA_ACCESS_READINESS_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: BetaAccessCheckStatus;
  note: string;
}[] = [
  { id: "flow", item: "신청 흐름", criterion: "수동 검토 문서", status: "met", note: "PR146" },
  { id: "form", item: "신청 폼", criterion: "미구현", status: "met", note: "PR146-B 후보" },
  { id: "pii", item: "개인정보 수집", criterion: "구조 없음", status: "met", note: "—" },
  { id: "auto", item: "자동 승인", criterion: "없음", status: "met", note: "—" },
  { id: "bulk-invite", item: "대량 초대", criterion: "없음", status: "met", note: "—" },
  { id: "allowlist", item: "allowlist 변경", criterion: "실제 변경 없음", status: "met", note: "—" },
  { id: "role", item: "role 변경", criterion: "실제 변경 없음", status: "met", note: "—" },
  { id: "visibility", item: "public visibility", criterion: "미검수 미노출", status: "met", note: "guard" },
  { id: "admin-leak", item: "관리자 정보", criterion: "베타 사용자 미노출", status: "met", note: "—" },
  { id: "aa", item: "Answer Assistant", criterion: "베타≠AA", status: "met", note: "PR-148" },
  { id: "paid", item: "결제", criterion: "연결 없음", status: "met", note: "PR145" },
  { id: "copy", item: "안내 문구", criterion: "확정·100% 금지", status: "met", note: "—" },
  { id: "halt", item: "중단·해제", criterion: "기준 존재", status: "met", note: "PR-141·146" },
  { id: "legal", item: "신청 수집 필드", criterion: "법무 미확정", status: "partial", note: "PII_ALLOWED 후보" },
  { id: "secrets", item: "secret", criterion: "미노출", status: "met", note: "—" },
] as const;

export const PR146_DEFERRED_PRS: readonly {
  id: string;
  title: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR146-B", title: "Beta Request Form Plan", risk: "High", codex: "필요 가능" },
  { id: "PR146-C", title: "Beta Request Data Model Plan", risk: "Critical", codex: "필수" },
  { id: "PR146-D", title: "Manual Approval Admin UI Plan", risk: "Critical", codex: "필수" },
  { id: "PR146-E", title: "Invite Email Safety Plan", risk: "High", codex: "조건부" },
  { id: "PR146-F", title: "Beta Access RBAC Plan", risk: "Critical", codex: "필수" },
  { id: "PR146-G", title: "Beta Audit Log Plan", risk: "High", codex: "필요 가능" },
  { id: "PR148", title: "AI Limited Beta Policy", risk: "Critical", codex: "필수" },
  { id: "PR149", title: "Security Final Audit", risk: "Critical", codex: "필수" },
  { id: "PR150", title: "External Release Decision", risk: "Critical", codex: "필수" },
] as const;

export const PR146_DEFERRED_IMPLEMENTATION = [
  "베타 신청 폼 UI",
  "BetaRequest/waitlist Prisma model",
  "자동 승인·대량 초대",
  "초대 이메일/SMS/webhook",
  "allowlist·role 자동 부여",
] as const;

export const PR146_LINKED_DOCS = [
  "PR-141-LIMITED-BETA-OPS.md",
  "PR-141-MANUAL-APPROVAL-FLOW.md",
  "PR-142-TERMS-PRIVACY-PLAN-OPS.md",
  "PR-143-SUPPORT-INCIDENT-PLAYBOOK-OPS.md",
  "PR-144-PUBLIC-LANDING-SAFETY-OPS.md",
] as const;
