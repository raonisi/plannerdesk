/**
 * Payment architecture plan ops standards (PR-170). Design/review docs only — no billing, PG, routes, or schema.
 */

import { PR164_SAFETY_VERDICTS } from "@/lib/ops/ai-safety-hardening";
import {
  PR145_FORBIDDEN_PHRASES,
  PR145_OVERALL_VERDICTS,
} from "@/lib/ops/payment-feasibility";
import { PR165_READINESS_VERDICTS } from "@/lib/ops/payment-legal-readiness";
import { PR169_DRAFT_VERDICTS } from "@/lib/ops/terms-privacy-draft-plan";

export const PR170_SCOPE_NOTICE =
  "결제 **구조 설계·검토 계획**입니다. 결제 기능·PG 연동·checkout/billing/subscription·webhook·가격표·구독·유료 role·결제정보 저장·DB/schema/package 변경은 포함하지 않습니다.";

export const PR170_FORBIDDEN_DOC_CONTENT =
  "문서에 카드번호·계좌정보·PG API key·webhook secret·실제 가격·구독 플랜 확정·결제 토큰 예시를 넣지 않습니다.";

export type ArchitecturePlanStatus =
  | "ready"
  | "conditional"
  | "not_ready"
  | "blocked"
  | "review_needed";

export const ARCHITECTURE_PLAN_STATUS_LABEL: Record<ArchitecturePlanStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
  review_needed: "검토 필요",
};

export type ReviewItemStatus = "review_needed" | "required" | "deferred" | "legal_review";

export const REVIEW_ITEM_STATUS_LABEL: Record<ReviewItemStatus, string> = {
  review_needed: "검토 필요",
  required: "필수",
  deferred: "보류",
  legal_review: "법무 검토 필요",
};

export const PR170_OPEN_CRITICAL_COUNT = 0;

export const PR170_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr165",
    condition: "PR165 결제·PG·환불 검토",
    result: PR165_READINESS_VERDICTS.paymentLegalReadiness,
    met: PR165_READINESS_VERDICTS.documentationComplete === "ready",
  },
  {
    id: "pr169",
    condition: "PR169 약관·개인정보·환불 초안",
    result: PR169_DRAFT_VERDICTS.draftScopeDefined,
    met: PR169_DRAFT_VERDICTS.billingImplementation === "blocked",
  },
  {
    id: "no-impl",
    condition: "결제 구현 없이 문서화만",
    result: "가능",
    met: true,
  },
  {
    id: "no-store",
    condition: "결제정보 직접 저장 금지",
    result: "원칙 유지",
    met: true,
  },
  {
    id: "no-schema",
    condition: "DB/schema/package 변경 불필요",
    result: "가능",
    met: true,
  },
] as const;

export const PAYMENT_ARCHITECTURE_PRINCIPLES: readonly {
  id: string;
  principle: string;
  rule: string;
}[] = [
  { id: "review-first", principle: "구현 전 검토", rule: "PR170은 구현이 아니라 구조 검토" },
  { id: "no-pan-store", principle: "결제정보 비저장", rule: "카드·계좌·인증정보 직접 저장 금지" },
  { id: "pg-delegate", principle: "PG 위임", rule: "결제·민감정보는 PG 기준 검토" },
  { id: "rbac-split", principle: "권한 분리", rule: "결제 상태와 admin/planner 혼동 금지" },
  { id: "refund-split", principle: "환불 분리", rule: "환불·취소·해지는 PR171" },
  { id: "pii-min", principle: "개인정보 최소화", rule: "결제 관련 최소 수집" },
  { id: "security", principle: "보안 우선", rule: "webhook·secret·signature 별도 설계" },
  { id: "no-price", principle: "유료화 보류", rule: "가격표·구독 플랜 확정 금지" },
  { id: "aa-safety", principle: "AI safety 유지", rule: "유료 기능이어도 AA 기준 유지" },
  { id: "legal", principle: "법무 검토 필수", rule: "약관·개인정보·환불·전자상거래 고지" },
] as const;

export const PG_REVIEW_CHECKLIST: readonly {
  id: string;
  item: string;
  criteria: string;
  status: ReviewItemStatus;
}[] = [
  { id: "provider", item: "PG 후보", criteria: "국내 결제·정산·수수료·보안", status: "review_needed" },
  { id: "methods", item: "결제수단", criteria: "카드·계좌·간편·정기결제", status: "review_needed" },
  { id: "settlement", item: "정산 구조", criteria: "주기·수수료·취소·환불", status: "review_needed" },
  { id: "webhook", item: "webhook", criteria: "성공·실패·환불 이벤트", status: "review_needed" },
  { id: "secret", item: "secret 관리", criteria: "webhook secret·API key", status: "review_needed" },
  { id: "no-store", item: "결제정보 저장", criteria: "직접 저장 금지", status: "required" },
  { id: "fail", item: "결제 실패", criteria: "재시도·안내·이용 제한", status: "review_needed" },
  { id: "refund", item: "환불 처리", criteria: "부분·전액·중도 해지", status: "deferred" },
  { id: "invoice", item: "세금계산서·영수증", criteria: "발행·책임", status: "review_needed" },
  { id: "processor", item: "개인정보 위탁", criteria: "PG·호스팅·이메일", status: "legal_review" },
] as const;

export const PAYMENT_DATA_NON_STORAGE_RULES: readonly {
  id: string;
  item: string;
  rule: string;
}[] = [
  { id: "pan", item: "카드번호", rule: "직접 저장 금지" },
  { id: "cvc", item: "CVC", rule: "저장 금지" },
  { id: "account", item: "계좌정보", rule: "직접 저장 금지" },
  { id: "auth", item: "결제 인증정보", rule: "저장 금지" },
  { id: "token", item: "PG token", rule: "보안 검토 전 직접 저장 금지" },
  { id: "wh-secret", item: "webhook secret", rule: "env/secret manager·문서 값 기록 금지" },
  { id: "receipt", item: "결제 영수증 원문", rule: "PII 검토 전 저장 금지" },
  { id: "log", item: "결제 로그", rule: "metadata 중심 검토" },
  { id: "refund-log", item: "환불 로그", rule: "고객정보 최소화" },
  { id: "ops-access", item: "운영자 접근", rule: "결제정보 직접 접근 금지" },
] as const;

export const SUBSCRIPTION_RBAC_REVIEW_ITEMS: readonly {
  id: string;
  item: string;
  criteria: string;
  pr170Judgment: ReviewItemStatus;
}[] = [
  { id: "free", item: "무료 사용자", criteria: "제공 범위", pr170Judgment: "deferred" },
  { id: "paid", item: "유료 사용자", criteria: "제공 기능", pr170Judgment: "deferred" },
  { id: "team", item: "팀/지점 구독", criteria: "조직 단위 권한", pr170Judgment: "review_needed" },
  { id: "admin", item: "관리자 권한", criteria: "결제 권한 분리", pr170Judgment: "required" },
  { id: "planner", item: "planner 권한", criteria: "결제 상태 혼동 금지", pr170Judgment: "required" },
  { id: "aa", item: "Answer Assistant", criteria: "verified + allowlist 유지", pr170Judgment: "required" },
  { id: "fail-access", item: "결제 실패 시 권한", criteria: "제한 방식", pr170Judgment: "deferred" },
  { id: "refund-access", item: "환불 시 권한", criteria: "이용 제한 시점", pr170Judgment: "deferred" },
  { id: "renewal", item: "구독 갱신", criteria: "사전 고지", pr170Judgment: "review_needed" },
  { id: "cancel", item: "구독 해지", criteria: "해지 후 이용 범위", pr170Judgment: "deferred" },
] as const;

export const AA_PAID_ARCHITECTURE_CRITERIA: readonly {
  id: string;
  item: string;
  rule: string;
}[] = [
  { id: "access", item: "접근 기준", rule: "유료화와 별개 verified + allowlist" },
  { id: "safety", item: "안전 기준", rule: "지급·가입·해지·공포 금지" },
  { id: "pii", item: "개인정보", rule: "고객정보·민감정보 입력 금지" },
  { id: "raw", item: "원문 저장", rule: "prompt/response/상담 원문 금지" },
  { id: "usage", item: "사용량 제한", rule: "과금 전 별도 검토" },
  { id: "failure", item: "safety failure", rule: "기능 제한 또는 중단" },
  { id: "notice", item: "유료 안내", rule: "AI 최종 판단 표현 금지" },
  { id: "duty", item: "책임 고지", rule: "약관·공식 자료 확인" },
] as const;

export const PAYMENT_FAILURE_REFUND_LINKS: readonly {
  id: string;
  situation: string;
  reviewBasis: string;
  followUpPr: string;
}[] = [
  { id: "fail", situation: "결제 실패", reviewBasis: "재시도·안내·권한", followUpPr: "PR171" },
  { id: "dup", situation: "중복 결제", reviewBasis: "고객지원 처리", followUpPr: "PR171" },
  { id: "partial", situation: "부분 환불", reviewBasis: "기간·사용량", followUpPr: "PR171" },
  { id: "full", situation: "전액 환불", reviewBasis: "취소 가능 기간", followUpPr: "PR171" },
  { id: "mid", situation: "중도 해지", reviewBasis: "종료 시점·이용 범위", followUpPr: "PR171" },
  { id: "renew-fail", situation: "구독 갱신 실패", reviewBasis: "사전 안내·제한", followUpPr: "PR171" },
  { id: "incident", situation: "장애 환불", reviewBasis: "장애·보상 범위", followUpPr: "PR171" },
  { id: "inquiry", situation: "결제 문의", reviewBasis: "고객지원 접수", followUpPr: "PR171" },
] as const;

export const PAYMENT_ARCHITECTURE_NO_GO: readonly {
  id: string;
  situation: string;
  judgment: string;
}[] = [
  { id: "terms", situation: "약관·개인정보 검토 미완료", judgment: "No-Go" },
  { id: "refund", situation: "환불·취소·해지 기준 미정", judgment: "No-Go" },
  { id: "pan-store", situation: "결제정보 직접 저장 가능성", judgment: "No-Go" },
  { id: "secret", situation: "PG secret 관리 기준 없음", judgment: "No-Go" },
  { id: "webhook", situation: "webhook 검증 기준 없음", judgment: "No-Go" },
  { id: "price", situation: "가격표·구독 플랜 임의 확정", judgment: "No-Go" },
  { id: "fail-rbac", situation: "결제 실패 시 권한 기준 없음", judgment: "No-Go" },
  { id: "processor", situation: "개인정보 위탁 기준 미정", judgment: "No-Go" },
  { id: "aa-safety", situation: "Answer Assistant safety 미충족", judgment: "No-Go" },
  { id: "rbac", situation: "public/admin/planner 분리 불명확", judgment: "No-Go" },
  { id: "support", situation: "고객지원·환불 처리 기준 없음", judgment: "No-Go" },
  { id: "legal-copy", situation: "법무 검토 전 결제 문구 노출", judgment: "No-Go" },
] as const;

export const PR171_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR171", title: "Refund & Support Policy Plan", purpose: "환불·지원 정책", risk: "Critical", codex: "필수" },
  { id: "PR172", title: "Beta Review Summary", purpose: "베타 종합 보고", risk: "High", codex: "조건부" },
  { id: "PR173", title: "Public Release Readiness Review", purpose: "공개 베타 검토", risk: "Critical", codex: "필수" },
  { id: "PR174", title: "Terms Legal Review Prep", purpose: "법무 검토 전달", risk: "Critical", codex: "필수" },
  { id: "PR175", title: "Payment Provider Comparison", purpose: "PG 후보 비교", risk: "High", codex: "조건부" },
  { id: "PR176", title: "Billing Data Architecture Review", purpose: "결제 데이터 구조", risk: "Critical", codex: "필수" },
] as const;

export type ArchitectureChecklistStatus = "met" | "partial" | "pending" | "gap";

export const PAYMENT_ARCHITECTURE_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: ArchitectureChecklistStatus;
}[] = [
  { id: "principles", item: "기본 원칙", criterion: "10 principles", status: "met" },
  { id: "pg", item: "PG 체크리스트", criterion: "10항목", status: "met" },
  { id: "no-store", item: "결제정보 비저장", criterion: "10 rules", status: "met" },
  { id: "rbac", item: "권한·구독 검토", criterion: "10항목", status: "met" },
  { id: "aa-paid", item: "AA 유료화 기준", criterion: "8항목", status: "met" },
  { id: "refund-link", item: "환불 연결", criterion: "PR171 분리", status: "met" },
  { id: "no-go", item: "No-Go", criterion: "12항목", status: "met" },
  { id: "no-billing", item: "결제 구현", criterion: "PR170 미실행", status: "met" },
  { id: "no-pg", item: "PG 연동", criterion: "없음", status: "met" },
  { id: "no-route", item: "checkout/billing", criterion: "route 없음", status: "met" },
  { id: "no-schema", item: "schema 변경", criterion: "없음", status: "met" },
  { id: "live-billing", item: "live 결제", criterion: "후속 PR만", status: "pending" },
  { id: "pg-select", item: "PG 후보 확정", criterion: "PR175", status: "gap" },
] as const;

export const PR170_ARCHITECTURE_VERDICTS = {
  paymentArchitecturePlan: "conditional" as ArchitecturePlanStatus,
  architectureReviewDefined: "ready" as ArchitecturePlanStatus,
  billingImplementation: "blocked" as ArchitecturePlanStatus,
  paymentDataStorage: "blocked" as ArchitecturePlanStatus,
} as const;

export const PR170_CODE_REFERENCES = {
  paymentFeasibility: "lib/ops/payment-feasibility.ts",
  paymentLegal: "lib/ops/payment-legal-readiness.ts",
  termsPrivacyDraft: "lib/ops/terms-privacy-draft-plan.ts",
  aiSafety: "lib/ops/ai-safety-hardening.ts",
  rbac: "lib/auth/rbac.ts",
  aaAccess: "lib/answer-assistant/verified-access.ts",
  aaSafetyVerdict: PR164_SAFETY_VERDICTS.accessGuardIntegrity,
  feasibilityVerdict: PR145_OVERALL_VERDICTS.feasibilityReview,
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "결제·PG·webhook 구현 부재",
  "checkout/billing/subscription route 부재",
  "가격표·구독·유료 role 확정 부재",
  "결제정보 직접 저장 구조 부재",
  "Auth/RBAC 변경 부재",
  "AA 접근 확대 부재",
  "DB/schema/package 부재",
  "결제정보 비저장 원칙",
  "No-Go 기준",
  "PR171 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "PG 후보 상표 나열",
  "후속 PR 번호 가정",
] as const;

/** PG SDK names — for static scans only; not installed. */
export const PG_SDK_FORBIDDEN: readonly string[] = [
  "stripe",
  "tosspayments",
  "iamport",
  "portone",
  "nicepay",
] as const;

export const PR170_LINKED_HUBS = [
  "PR-145-PAYMENT-FEASIBILITY-OPS.md",
  "PR-165-PAYMENT-LEGAL-READINESS-OPS.md",
  "PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
] as const;

export const PR170_FORBIDDEN_PHRASES: readonly string[] = [
  ...PR145_FORBIDDEN_PHRASES,
  "지금 결제하면",
  "카드번호를 입력",
  "구독 플랜 확정",
] as const;

export const PR170_TEST_FILES = [
  "tests/ops/pr170-payment-architecture-plan.test.ts",
  "tests/ops/pr165-payment-legal-readiness.test.ts",
  "tests/ops/pr169-terms-privacy-draft-plan.test.ts",
] as const;
