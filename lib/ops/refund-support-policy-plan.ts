/**
 * Refund & support policy plan ops standards (PR-171). Policy/docs only — no refund, inbox, billing, or schema.
 */

import { PR164_SAFETY_VERDICTS } from "@/lib/ops/ai-safety-hardening";
import {
  PAYMENT_DATA_NON_STORAGE_RULES,
  PAYMENT_FAILURE_REFUND_LINKS,
  PR170_ARCHITECTURE_VERDICTS,
} from "@/lib/ops/payment-architecture-plan";
import { PR165_READINESS_VERDICTS } from "@/lib/ops/payment-legal-readiness";
import {
  AA_REPORT_HANDLING,
  REPORT_RECORD_ALLOW_DENY,
} from "@/lib/ops/user-support-inbox-plan";
import {
  PR169_DRAFT_VERDICTS,
  REFUND_CANCEL_REVIEW_ITEMS,
} from "@/lib/ops/terms-privacy-draft-plan";

export const PR171_SCOPE_NOTICE =
  "환불·취소·해지·장애 보상·고객지원 **정책 검토 계획**입니다. 환불 기능·결제·PG·인박스·알림 발송·결제정보 저장·DB/schema/package 변경은 포함하지 않습니다.";

export const PR171_FORBIDDEN_DOC_CONTENT =
  "문서에 환불 보장·처리 기한 확정·카드번호·계좌정보·고객 상담 원문·법무 검토 완료 표현을 넣지 않습니다.";

export type PolicyPlanStatus =
  | "ready"
  | "conditional"
  | "not_ready"
  | "blocked"
  | "review_needed";

export const POLICY_PLAN_STATUS_LABEL: Record<PolicyPlanStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
  review_needed: "검토 필요",
};

export type PolicyItemStatus = "review_needed" | "draft_candidate" | "required";

export const POLICY_ITEM_STATUS_LABEL: Record<PolicyItemStatus, string> = {
  review_needed: "검토 필요",
  draft_candidate: "초안 가능",
  required: "필수",
};

export const PR171_OPEN_CRITICAL_COUNT = 0;

export const PR171_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr170",
    condition: "PR170 환불·해지 PR171 분리",
    result: PAYMENT_FAILURE_REFUND_LINKS.every((l) => l.followUpPr === "PR171")
      ? "분리됨"
      : "미분리",
    met: PAYMENT_FAILURE_REFUND_LINKS.every((l) => l.followUpPr === "PR171"),
  },
  {
    id: "pr169",
    condition: "PR169 환불·취소·해지 검토",
    result: String(REFUND_CANCEL_REVIEW_ITEMS.length),
    met: REFUND_CANCEL_REVIEW_ITEMS.every((r) => r.pr169Judgment === "review_needed"),
  },
  {
    id: "pr165",
    condition: "PR165 고객지원·환불 검토",
    result: PR165_READINESS_VERDICTS.paymentLegalReadiness,
    met: PR165_READINESS_VERDICTS.documentationComplete === "ready",
  },
  {
    id: "no-refund",
    condition: "환불 기능 없이 문서화만",
    result: "가능",
    met: true,
  },
  {
    id: "no-inbox",
    condition: "고객지원 시스템 없이 문서화만",
    result: "가능",
    met: true,
  },
  {
    id: "no-schema",
    condition: "DB/schema/package 변경 불필요",
    result: "가능",
    met: true,
  },
] as const;

export const REFUND_SUPPORT_POLICY_PRINCIPLES: readonly {
  id: string;
  principle: string;
  rule: string;
}[] = [
  { id: "review", principle: "구현 전 검토", rule: "PR171은 정책 계획·기능 구현 아님" },
  { id: "legal", principle: "법무 검토 필수", rule: "환불·취소·해지 확정 금지" },
  { id: "no-pan", principle: "결제정보 비저장", rule: "카드·계좌·토큰 직접 저장 금지" },
  { id: "pii-min", principle: "개인정보 최소화", rule: "고객지원 metadata 중심" },
  { id: "no-raw", principle: "원문 저장 금지", rule: "상담·prompt/response 원문 금지" },
  { id: "incident", principle: "장애 기준 분리", rule: "기술·데이터·AI safety 구분" },
  { id: "support-split", principle: "고객지원 분리", rule: "문의·환불·오류 제보 구분" },
  { id: "rbac", principle: "권한 분리", rule: "결제 상태와 admin/planner 혼동 금지" },
  { id: "no-price", principle: "유료화 보류", rule: "가격·구독·환불 확정 금지" },
  { id: "no-go", principle: "No-Go 우선", rule: "기준 미확정 시 결제 도입 금지" },
] as const;

export const REFUND_POLICY_REVIEW_ITEMS: readonly {
  id: string;
  item: string;
  reviewBasis: string;
  status: PolicyItemStatus;
}[] = [
  { id: "cancel", item: "결제 취소", reviewBasis: "결제 직후 취소 가능 기준", status: "review_needed" },
  { id: "full", item: "전액 환불", reviewBasis: "사용 전·장애·중복 결제", status: "review_needed" },
  { id: "partial", item: "부분 환불", reviewBasis: "기간·사용량·정산", status: "review_needed" },
  { id: "mid", item: "중도 해지", reviewBasis: "구독 기간 중 해지", status: "review_needed" },
  { id: "recurring", item: "정기결제 해지", reviewBasis: "다음 결제일 전 해지", status: "review_needed" },
  { id: "fail", item: "결제 실패", reviewBasis: "재시도·안내·이용 제한", status: "review_needed" },
  { id: "dup", item: "중복 결제", reviewBasis: "확인·취소·환불", status: "review_needed" },
  { id: "incident", item: "장애 보상", reviewBasis: "장애 범위·보상 여부", status: "review_needed" },
  { id: "data", item: "데이터 오류", reviewBasis: "환불 연결 여부", status: "review_needed" },
  { id: "aa", item: "AI safety failure", reviewBasis: "기능 제한·환불 검토", status: "review_needed" },
  { id: "sla", item: "환불 처리 기한", reviewBasis: "접수 후 처리 기간", status: "review_needed" },
  { id: "deny", item: "환불 불가 조건", reviewBasis: "법무 검토 전 확정 금지", status: "review_needed" },
] as const;

export const CUSTOMER_SUPPORT_POLICY_ITEMS: readonly {
  id: string;
  item: string;
  reviewBasis: string;
  status: PolicyItemStatus;
}[] = [
  { id: "types", item: "문의 유형", reviewBasis: "결제·환불·오류·데이터·AI·계정", status: "review_needed" },
  { id: "intake", item: "접수 방식", reviewBasis: "구현 전 문서 기준만", status: "review_needed" },
  { id: "status", item: "처리 상태", reviewBasis: "접수·확인중·보류·완료·반려", status: "review_needed" },
  { id: "severity", item: "긴급도", reviewBasis: "Critical/High/Medium/Low", status: "draft_candidate" },
  { id: "no-pii", item: "개인정보 금지", reviewBasis: "고객정보·민감정보 입력 금지", status: "required" },
  { id: "no-pay", item: "결제정보 금지", reviewBasis: "카드·계좌 입력 금지", status: "required" },
  { id: "no-attach", item: "첨부 금지", reviewBasis: "신분증·증권·진단서", status: "required" },
  { id: "sla", item: "처리 기한", reviewBasis: "확정 금지·운영 검토", status: "review_needed" },
  { id: "notice", item: "장애 공지", reviewBasis: "알림 구현 없이 문서", status: "review_needed" },
  { id: "record", item: "기록 기준", reviewBasis: "metadata-only", status: "required" },
  { id: "no-guarantee", item: "고객지원 책임", reviewBasis: "해결 보장 표현 금지", status: "required" },
] as const;

export const SUPPORT_RECORD_ALLOW_DENY: readonly {
  field: string;
  allowed: string;
  forbidden: string;
}[] = [
  { field: "문의 유형", allowed: "결제/환불/오류/AI safety", forbidden: "상담 원문" },
  { field: "발생 화면", allowed: "route·화면명", forbidden: "PII 캡처" },
  { field: "사용자 구분", allowed: "public/planner/admin/cohort", forbidden: "실명·연락처·주민번호" },
  { field: "결제 이슈", allowed: "상태 유형·오류 유형", forbidden: "카드번호·계좌" },
  { field: "환불 이슈", allowed: "요청 유형·상태", forbidden: "결제정보 전문" },
  { field: "AI safety", allowed: "유형·차단 여부", forbidden: "prompt/response 원문" },
  { field: "데이터 오류", allowed: "보험사명·문서 유형", forbidden: "고객 사고 상세" },
  { field: "처리 상태", allowed: "접수/확인중/보류/완료", forbidden: "민감 로그 전문" },
  { field: "후속 PR", allowed: "후보명·위험도", forbidden: "secret 로그" },
  { field: "시간", allowed: "접수일·처리일", forbidden: "불필요 개인 활동 로그" },
] as const;

export const INCIDENT_COMPENSATION_REVIEW: readonly {
  id: string;
  incidentType: string;
  reviewBasis: string;
  refundLink: string;
}[] = [
  { id: "outage", incidentType: "전체 서비스 장애", reviewBasis: "사용 불가 시간·영향", refundLink: "검토 필요" },
  { id: "feature", incidentType: "특정 기능 장애", reviewBasis: "중요도·대체 가능성", refundLink: "검토 필요" },
  { id: "payment", incidentType: "결제 장애", reviewBasis: "중복·실패 처리", refundLink: "검토 필요" },
  { id: "data", incidentType: "데이터 오류", reviewBasis: "공식 출처·업무 영향", refundLink: "검토 필요" },
  { id: "claim", incidentType: "청구서류 오류", reviewBasis: "공식 확인·안내 영향", refundLink: "검토 필요" },
  { id: "aa", incidentType: "AI safety failure", reviewBasis: "위험 응답·차단 실패", refundLink: "검토 필요" },
  { id: "rbac", incidentType: "권한 오류", reviewBasis: "public/admin/planner 경계", refundLink: "Critical" },
  { id: "pii", incidentType: "개인정보 위험", reviewBasis: "저장·노출 가능성", refundLink: "Critical" },
  { id: "secret", incidentType: "secret 노출", reviewBasis: "API key/env/token", refundLink: "Critical" },
] as const;

export const AA_SUPPORT_REFUND_LINKS: readonly {
  id: string;
  situation: string;
  action: string;
  refundLink: string;
}[] = [
  { id: "payout", situation: "보험금 지급 확정 출력", action: "safety hotfix 또는 중단", refundLink: "검토 필요" },
  { id: "pii", situation: "개인정보 입력 유도", action: "즉시 제한 검토", refundLink: "검토 필요" },
  { id: "signup", situation: "가입·해지 유도", action: "output safety 보완", refundLink: "검토 필요" },
  { id: "fear", situation: "공포 조장", action: "safety rule 보강", refundLink: "검토 필요" },
  { id: "pro", situation: "법률·의료·세무 확정", action: "전문 판단 차단", refundLink: "검토 필요" },
  { id: "inject", situation: "prompt injection 성공", action: "중단 또는 guard 보완", refundLink: "검토 필요" },
  { id: "secret", situation: "secret 요청 응답", action: "즉시 중단", refundLink: "Critical" },
  { id: "quality", situation: "반복 품질 저하", action: "안내·safety 보완", refundLink: "검토 필요" },
  { id: "quota", situation: "사용량 제한 오류", action: "정책 검토", refundLink: "검토 필요" },
] as const;

export const REFUND_SUPPORT_FORBIDDEN_EXPRESSIONS: readonly {
  phrase: string;
  reason: string;
}[] = [
  { phrase: "무조건 환불됩니다", reason: "환불정책 미확정" },
  { phrase: "절대 환불 불가입니다", reason: "법무 검토 전 단정 금지" },
  { phrase: "장애 발생 시 전액 보상", reason: "보상정책 미확정" },
  { phrase: "24시간 내 반드시 처리", reason: "처리 기준 미확정" },
  { phrase: "결제정보를 입력해 주세요", reason: "결제정보 수집 위험" },
  { phrase: "카드번호를 남겨 주세요", reason: "결제정보 수집 금지" },
  { phrase: "상담 내용을 그대로 보내 주세요", reason: "원문 저장 위험" },
  { phrase: "AI 답변 오류는 모두 보상됩니다", reason: "책임 범위 미확정" },
  { phrase: "유료 고객은 보험금 판단 가능", reason: "지급 확정 오인" },
  { phrase: "결제하면 모든 기능 사용 가능", reason: "기능 범위 미확정" },
  { phrase: "환불정책 확정", reason: "법무 검토 전 금지" },
  { phrase: "법무 검토 완료", reason: "확정 표현 금지" },
] as const;

export const REFUND_SUPPORT_NO_GO: readonly {
  id: string;
  situation: string;
  judgment: string;
}[] = [
  { id: "refund-final", situation: "환불정책 확정 표현", judgment: "No-Go" },
  { id: "cancel-final", situation: "취소·해지 기준 확정 표현", judgment: "No-Go" },
  { id: "pan-store", situation: "결제정보 입력·저장 구조", judgment: "No-Go" },
  { id: "pii-record", situation: "지원 기록에 PII·민감정보 허용", judgment: "No-Go" },
  { id: "raw-store", situation: "prompt/response 원문 저장 가능성", judgment: "No-Go" },
  { id: "comp-final", situation: "장애 보상 기준 검토 없이 확정", judgment: "No-Go" },
  { id: "aa-refund", situation: "AI safety 환불 기준 단정", judgment: "No-Go" },
  { id: "billing", situation: "결제·PG 연동 존재", judgment: "No-Go" },
  { id: "inbox", situation: "인박스·알림 자동화 구현", judgment: "No-Go" },
  { id: "legal-done", situation: "법무 검토 완료 표현", judgment: "No-Go" },
  { id: "schema", situation: "DB/schema/package 변경", judgment: "No-Go" },
] as const;

export const PR172_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR172", title: "Beta Review Summary", purpose: "베타 종합 보고", risk: "High", codex: "조건부" },
  { id: "PR173", title: "Public Release Readiness Review", purpose: "공개 베타 검토", risk: "Critical", codex: "필수" },
  { id: "PR174", title: "Terms Legal Review Prep", purpose: "법무 검토 전달", risk: "Critical", codex: "필수" },
  { id: "PR175", title: "Payment Provider Comparison", purpose: "PG 후보 비교", risk: "High", codex: "조건부" },
  { id: "PR176", title: "Billing Data Architecture Review", purpose: "결제 데이터 구조", risk: "Critical", codex: "필수" },
  { id: "PR177", title: "Support Operations Design", purpose: "고객지원 운영 설계", risk: "High", codex: "조건부" },
] as const;

export type PolicyChecklistStatus = "met" | "partial" | "pending" | "gap";

export const REFUND_SUPPORT_POLICY_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: PolicyChecklistStatus;
}[] = [
  { id: "principles", item: "기본 원칙", criterion: "10 principles", status: "met" },
  { id: "refund", item: "환불 검토", criterion: "12항목", status: "met" },
  { id: "support", item: "고객지원 검토", criterion: "11항목", status: "met" },
  { id: "record", item: "기록 허용/금지", criterion: "10 fields", status: "met" },
  { id: "incident", item: "장애·보상", criterion: "9유형", status: "met" },
  { id: "aa-link", item: "AA 지원 연결", criterion: "9상황", status: "met" },
  { id: "forbidden", item: "금지 표현", criterion: "문서화", status: "met" },
  { id: "no-go", item: "No-Go", criterion: "11항목", status: "met" },
  { id: "no-refund", item: "환불 기능", criterion: "PR171 미실행", status: "met" },
  { id: "no-inbox", item: "인박스·알림", criterion: "없음", status: "met" },
  { id: "no-pan", item: "결제정보 저장", criterion: "비저장 원칙", status: "met" },
  { id: "legal-final", item: "법무 확정", criterion: "별도 PR174", status: "gap" },
  { id: "live-refund", item: "live 환불 실행", criterion: "후속 PR만", status: "pending" },
  { id: "pr172", item: "PR172 Beta Review", criterion: "종합 보고", status: "met" },
] as const;

export const PR171_POLICY_VERDICTS = {
  refundSupportPolicyPlan: "conditional" as PolicyPlanStatus,
  policyScopeDefined: "ready" as PolicyPlanStatus,
  refundImplementation: "blocked" as PolicyPlanStatus,
  supportSystemImplementation: "blocked" as PolicyPlanStatus,
} as const;

export const PR171_PREP_TARGETS = {
  paymentArchitecture: "lib/ops/payment-architecture-plan.ts",
  termsPrivacy: "lib/ops/terms-privacy-draft-plan.ts",
  paymentLegal: "lib/ops/payment-legal-readiness.ts",
  inboxPlan: "lib/ops/user-support-inbox-plan.ts",
  aiSafety: "lib/ops/ai-safety-hardening.ts",
  nonStorageRules: PAYMENT_DATA_NON_STORAGE_RULES.length,
  inboxAllowDeny: REPORT_RECORD_ALLOW_DENY.length,
  aaReportTypes: AA_REPORT_HANDLING.length,
  architectureBlocked: PR170_ARCHITECTURE_VERDICTS.billingImplementation,
  termsBlocked: PR169_DRAFT_VERDICTS.billingImplementation,
  aaGuard: PR164_SAFETY_VERDICTS.accessGuardIntegrity,
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "환불·결제 기능 구현 부재",
  "PG·webhook·인박스·알림 부재",
  "환불정책 확정 부재",
  "결제정보 직접 저장 부재",
  "PII·원문 저장 부재",
  "metadata-only 지원 기록",
  "AA safety 연결",
  "No-Go 기준",
  "PR172 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "처리 상태 필드명",
  "후속 PR 번호 가정",
] as const;

export const PR171_LINKED_HUBS = [
  "PR-165-PAYMENT-LEGAL-READINESS-OPS.md",
  "PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md",
  "PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md",
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
  "PR-159-BETA-INCIDENT-DRILL-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
] as const;

export const PR171_FORBIDDEN_PHRASES: readonly string[] =
  REFUND_SUPPORT_FORBIDDEN_EXPRESSIONS.map((r) => r.phrase);

export const PR171_TEST_FILES = [
  "tests/ops/pr171-refund-support-policy-plan.test.ts",
  "tests/ops/pr170-payment-architecture-plan.test.ts",
  "tests/ops/pr162-user-support-inbox-plan.test.ts",
] as const;
