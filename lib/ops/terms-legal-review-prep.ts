/**
 * Terms legal review prep ops standards (PR-174). Legal handoff docs only — no terms/privacy/refund
 * finalization, PII collection expansion, billing, or schema changes.
 */

import { PR172_REVIEW_VERDICTS } from "@/lib/ops/beta-review-summary";
import { PR170_ARCHITECTURE_VERDICTS } from "@/lib/ops/payment-architecture-plan";
import { PR171_POLICY_VERDICTS } from "@/lib/ops/refund-support-policy-plan";
import {
  AA_NOTICE_DRAFT_PLAN,
  DATA_RESPONSIBILITY_DRAFT_PLAN,
  LEGAL_REVIEW_REQUIRED_ITEMS,
  PRIVACY_POLICY_DRAFT_PLAN,
  PR169_DRAFT_VERDICTS,
  SUPPORT_REPORT_NOTICE_DRAFT_PLAN,
  TERMS_OF_SERVICE_DRAFT_PLAN,
  TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS,
  TERMS_PRIVACY_NO_GO_CRITERIA,
} from "@/lib/ops/terms-privacy-draft-plan";

export const PR174_SCOPE_NOTICE =
  "약관·개인정보·데이터 책임·Answer Assistant·오류 제보·환불·결제 관련 **법무 검토 전달용 초안 후보**입니다. 약관 확정·개인정보처리방침 확정·환불정책 확정·결제정책 확정·결제 구현·PII 수집 구조 추가·회원가입 확대·운영 DB 접근은 포함하지 않습니다.";

export const PR174_FORBIDDEN_DOC_CONTENT =
  "문서에 법무 검토 완료·약관 확정·개인정보처리방침 확정·환불 보장·결제 가능·즉시 적용 가능·준수 완료 표현을 넣지 않습니다.";

export type LegalPrepStatus =
  | "ready"
  | "conditional"
  | "not_ready"
  | "blocked"
  | "review_needed";

export const LEGAL_PREP_STATUS_LABEL: Record<LegalPrepStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
  review_needed: "검토 필요",
};

export type DraftCandidateStatus = "review_needed" | "required" | "info_gap";

export const DRAFT_CANDIDATE_STATUS_LABEL: Record<DraftCandidateStatus, string> = {
  review_needed: "검토 필요",
  required: "필수",
  info_gap: "정보 부족",
};

export const PR174_OPEN_CRITICAL_COUNT = 0;

export const PR174_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr169",
    condition: "PR169 약관·개인정보 초안 계획",
    result: PR169_DRAFT_VERDICTS.termsPrivacyDraftPlan,
    met: PR169_DRAFT_VERDICTS.draftScopeDefined === "ready",
  },
  {
    id: "pr170",
    condition: "PR170 결제 구조 계획",
    result: PR170_ARCHITECTURE_VERDICTS.paymentArchitecturePlan,
    met: PR170_ARCHITECTURE_VERDICTS.billingImplementation === "blocked",
  },
  {
    id: "pr171",
    condition: "PR171 환불·지원 정책 계획",
    result: PR171_POLICY_VERDICTS.refundSupportPolicyPlan,
    met: PR171_POLICY_VERDICTS.refundImplementation === "blocked",
  },
  {
    id: "pr172",
    condition: "PR172 베타 종합 보고",
    result: PR172_REVIEW_VERDICTS.betaReviewSummary,
    met: PR172_REVIEW_VERDICTS.synthesisComplete === "ready",
  },
  {
    id: "pr173",
    condition: "PR173 공개 준비(work-tools·테스트 등)",
    result: "조건부 진행",
    met: true,
  },
  {
    id: "no-final",
    condition: "약관·개인정보·환불·결제 확정 없음",
    result: "blocked",
    met: PR169_DRAFT_VERDICTS.legalFinalization === "blocked",
  },
  {
    id: "no-billing",
    condition: "결제·PG·checkout 구현 없음",
    result: "blocked",
    met: PR170_ARCHITECTURE_VERDICTS.billingImplementation === "blocked",
  },
] as const;

export const TERMS_OF_SERVICE_DRAFT_CANDIDATES: readonly {
  id: string;
  item: string;
  draftDirection: string;
  legalReview: "required" | "critical";
}[] = TERMS_OF_SERVICE_DRAFT_PLAN.map((r) => ({
  id: r.id,
  item: r.item,
  draftDirection: r.purpose,
  legalReview:
    r.status === "review_needed" || r.id === "liability" || r.id === "dispute"
      ? ("critical" as const)
      : ("required" as const),
}));

export const PRIVACY_POLICY_DRAFT_CANDIDATES: readonly {
  id: string;
  item: string;
  draftDirection: string;
  status: DraftCandidateStatus;
}[] = PRIVACY_POLICY_DRAFT_PLAN.map((r) => ({
  id: r.id,
  item: r.item,
  draftDirection: r.purpose,
  status:
    r.id === "collection" || r.id === "third-party" || r.id === "processor"
      ? ("info_gap" as DraftCandidateStatus)
      : r.status === "required"
        ? ("required" as DraftCandidateStatus)
        : ("review_needed" as DraftCandidateStatus),
}));

export const DATA_RESPONSIBILITY_DRAFT_CANDIDATES = DATA_RESPONSIBILITY_DRAFT_PLAN;

export const AA_NOTICE_DRAFT_CANDIDATES = AA_NOTICE_DRAFT_PLAN;

export const SUPPORT_REPORT_DRAFT_CANDIDATES = SUPPORT_REPORT_NOTICE_DRAFT_PLAN;

export const REFUND_CANCEL_LEGAL_QUESTIONS: readonly {
  id: string;
  question: string;
  status: DraftCandidateStatus;
}[] = [
  {
    id: "immediate-cancel",
    question: "결제 직후 취소 기준을 어떻게 둘 것인가",
    status: "review_needed",
  },
  {
    id: "mid-term-end",
    question: "구독 중도 해지 시 이용 종료 시점을 어떻게 볼 것인가",
    status: "review_needed",
  },
  {
    id: "partial-refund",
    question: "부분 환불 기준을 기간 기준으로 둘 것인가, 사용량 기준으로 둘 것인가",
    status: "review_needed",
  },
  {
    id: "incident-comp",
    question: "장애 발생 시 환불 또는 보상 기준을 둘 것인가",
    status: "review_needed",
  },
  {
    id: "data-error-refund",
    question: "데이터 오류가 환불 사유가 되는지 여부",
    status: "review_needed",
  },
  {
    id: "aa-safety-refund",
    question: "Answer Assistant safety failure가 환불 사유가 되는지 여부",
    status: "review_needed",
  },
  {
    id: "refund-deadline",
    question: "환불 처리 기한과 고객지원 책임 범위를 어떻게 정할 것인가",
    status: "review_needed",
  },
  {
    id: "invoice-tax",
    question: "영수증·세금계산서 발행 책임 범위는 어떻게 정할 것인가",
    status: "review_needed",
  },
] as const;

export const PAYMENT_PG_LEGAL_QUESTIONS: readonly {
  id: string;
  question: string;
  status: DraftCandidateStatus;
}[] = [
  {
    id: "pg-processor",
    question: "PG 이용 시 개인정보 처리 위탁 고지가 필요한가",
    status: "review_needed",
  },
  {
    id: "no-card-store",
    question: "결제정보를 직접 저장하지 않는 구조에서 약관 문구는 어떻게 작성해야 하는가",
    status: "review_needed",
  },
  {
    id: "recurring-notice",
    question: "정기결제 사전 고지와 해지 고지 요건은 무엇인가",
    status: "review_needed",
  },
  {
    id: "price-change",
    question: "가격 변경 시 사전 고지 기간과 적용 기준은 무엇인가",
    status: "review_needed",
  },
  {
    id: "payment-fail",
    question: "결제 실패 시 기능 제한 안내 문구는 어떻게 작성해야 하는가",
    status: "review_needed",
  },
  {
    id: "refund-flow",
    question: "환불 요청 처리 절차는 어떤 방식으로 고지해야 하는가",
    status: "review_needed",
  },
  {
    id: "free-paid-split",
    question: "유료 플랜과 무료 기능의 구분을 어떻게 표시해야 하는가",
    status: "review_needed",
  },
  {
    id: "ecommerce-notice",
    question: "사업자 정보, 통신판매, 전자상거래 고지 필요 여부는 무엇인가",
    status: "info_gap",
  },
] as const;

export const INSURANCE_DOMAIN_FORBIDDEN_EXPRESSIONS: readonly {
  phrase: string;
  reason: string;
}[] = [
  { phrase: "보험금이 지급됩니다", reason: "지급 확정 오인" },
  { phrase: "보험금을 받을 수 있습니다", reason: "지급 가능성 확정 오인" },
  { phrase: "예상 보험금", reason: "청구 금액 산정 오인" },
  { phrase: "환급 예상", reason: "지급액 예측 오인" },
  { phrase: "이 서류만 내면 됩니다", reason: "청구 심사 단순화 오인" },
  { phrase: "무조건 지급", reason: "허위·과장 위험" },
  { phrase: "무조건 부지급", reason: "부당 단정 위험" },
  { phrase: "반드시 가입해야 합니다", reason: "가입 유도 위험" },
  { phrase: "해지하는 게 맞습니다", reason: "해지 권유 위험" },
  { phrase: "지금 안 하면 손해입니다", reason: "공포 조장 위험" },
  { phrase: "AI가 최종 판단합니다", reason: "보조 도구 원칙 위반" },
] as const;

export const LEGAL_BETA_NO_GO_CRITERIA: readonly {
  id: string;
  situation: string;
  judgment: string;
}[] = [
  ...TERMS_PRIVACY_NO_GO_CRITERIA,
  {
    id: "refund-policy-final",
    situation: "환불정책 확정 표현 존재",
    judgment: "No-Go",
  },
  {
    id: "payment-policy-final",
    situation: "결제정책 확정 표현 존재",
    judgment: "No-Go",
  },
  {
    id: "checkout-impl",
    situation: "PG·checkout·billing·subscription 구현 존재",
    judgment: "No-Go",
  },
  {
    id: "compensation-guarantee",
    situation: "환불·보상 보장 표현 존재",
    judgment: "No-Go",
  },
  {
    id: "support-sla-guarantee",
    situation: "고객지원 해결 보장 표현 존재",
    judgment: "No-Go",
  },
  {
    id: "data-final-without-source",
    situation: "공식 출처 확인 전 데이터 확정 표현 존재",
    judgment: "No-Go",
  },
] as const;

export const LEGAL_REVIEWER_QUESTIONS: readonly {
  id: string;
  question: string;
}[] = [
  {
    id: "q1",
    question:
      'PlannerDesk의 서비스 성격을 "보험설계사 업무 보조 도구"로 정의하는 것이 적절한가?',
  },
  {
    id: "q2",
    question: "public / planner / admin 권한 구분을 약관에 어떻게 반영해야 하는가?",
  },
  {
    id: "q3",
    question: "청구서류와 보험사 정보 제공 시 책임 제한 문구는 어느 수준이 적절한가?",
  },
  {
    id: "q4",
    question:
      "Answer Assistant를 사용할 때 개인정보 입력 금지와 최종 판단 아님 고지를 어떻게 표시해야 하는가?",
  },
  {
    id: "q5",
    question: "오류 제보와 고객지원 기록에서 수집 가능한 최소 정보 범위는 어디까지인가?",
  },
  {
    id: "q6",
    question: "향후 유료화 시 전자상거래, 통신판매, 환불, 정기결제 고지 요건은 무엇인가?",
  },
  {
    id: "q7",
    question:
      "결제정보를 직접 저장하지 않는 PG 위임 구조에서 개인정보처리방침에 포함해야 할 항목은 무엇인가?",
  },
  {
    id: "q8",
    question:
      "데이터 오류나 서비스 장애가 환불 또는 보상과 연결되는 기준은 어떻게 정해야 하는가?",
  },
  {
    id: "q9",
    question: "보험금 지급 확정 오인을 막기 위해 금지해야 할 표현 범위는 어디까지인가?",
  },
  {
    id: "q10",
    question: "공개 베타 전 반드시 선행되어야 할 법무 문서와 고지 화면은 무엇인가?",
  },
] as const;

export const PR175_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  {
    id: "PR175",
    title: "Payment Provider Comparison",
    purpose: "PG 후보 비교 문서",
    risk: "High",
    codex: "조건부",
  },
  {
    id: "PR176",
    title: "Billing Data Architecture Review",
    purpose: "결제 데이터 구조 검토",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR177",
    title: "Support Operations Design",
    purpose: "실제 고객지원 운영 설계",
    risk: "High",
    codex: "조건부",
  },
  {
    id: "PR178",
    title: "Public Beta Gate Checklist",
    purpose: "공개 베타 실행 전 gate checklist",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR179",
    title: "Public Access Regression Suite",
    purpose: "public/planner/admin 접근 회귀 검증",
    risk: "Critical",
    codex: "필수",
  },
  {
    id: "PR180",
    title: "AI Safety Regression Suite",
    purpose: "Answer Assistant safety 회귀 검증",
    risk: "Critical",
    codex: "필수",
  },
] as const;

export const LEGAL_REVIEW_INFO_GAPS: readonly {
  id: string;
  item: string;
  note: string;
}[] = [
  {
    id: "pii-inventory",
    item: "실제 수집 개인정보 항목 인벤토리",
    note: "Auth·로그·지원 기록 기준 운영 확인 필요 — 법무 확인 전 확정 금지",
  },
  {
    id: "processors",
    item: "처리 위탁·제3자 제공 목록",
    note: "호스팅·인증·향후 PG 벤더 — 검토 필요",
  },
  {
    id: "retention",
    item: "보관·파기 기간",
    note: "법무 검토 필요",
  },
  {
    id: "business-info",
    item: "사업자·통신판매 고지 정보",
    note: "유료화 전 정보 부족",
  },
  {
    id: "jurisdiction",
    item: "분쟁·관할 조항",
    note: "법무 검토 필요",
  },
  {
    id: "pg-vendor",
    item: "PG 후보 및 위탁 범위",
    note: "PR175 이후 검토",
  },
] as const;

export type LegalPrepChecklistStatus = "met" | "partial" | "pending" | "gap";

export const LEGAL_REVIEW_PREP_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: LegalPrepChecklistStatus;
}[] = [
  { id: "tos", item: "이용약관 초안 후보", criterion: "12항목", status: "met" },
  { id: "privacy", item: "개인정보 초안 후보", criterion: "11항목", status: "met" },
  { id: "data", item: "데이터 책임 고지", criterion: "9항목", status: "met" },
  { id: "aa", item: "Answer Assistant 고지", criterion: "8항목", status: "met" },
  { id: "support", item: "오류 제보·고객지원", criterion: "8항목", status: "met" },
  { id: "refund-q", item: "환불·취소·해지 질문", criterion: "8항목", status: "met" },
  { id: "pg-q", item: "결제/PG 질문", criterion: "8항목", status: "met" },
  { id: "forbidden", item: "보험 도메인 금지 표현", criterion: "11항목", status: "met" },
  { id: "nogo", item: "법무 No-Go", criterion: "16항목", status: "met" },
  { id: "reviewer-q", item: "법무 검토자 질문", criterion: "10항목", status: "met" },
  { id: "no-final", item: "약관·개인정보 확정", criterion: "blocked", status: "met" },
  { id: "no-billing", item: "결제 구현", criterion: "blocked", status: "met" },
  { id: "legal-done", item: "법무 검토 완료", criterion: "별도 법무 프로세스", status: "gap" },
  { id: "live-terms", item: "live 약관 게시", criterion: "후속 PR만", status: "pending" },
  { id: "pr178", item: "PR178 연결", criterion: "공개 베타 gate", status: "pending" },
] as const;

export const PR174_REVIEW_VERDICTS = {
  legalReviewPrep: "conditional" as LegalPrepStatus,
  handoffPacket: "ready" as LegalPrepStatus,
  termsFinalization: "blocked" as LegalPrepStatus,
  privacyFinalization: "blocked" as LegalPrepStatus,
  refundPolicyFinalization: "blocked" as LegalPrepStatus,
  paymentPolicyFinalization: "blocked" as LegalPrepStatus,
  publicBetaLegalGo: "blocked" as LegalPrepStatus,
} as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "약관·개인정보·환불·결제 확정 부재",
  "법무 검토 완료 표현 부재",
  "PII 수집 구조 추가 부재",
  "prompt/response 원문 저장 부재",
  "보험금 지급 확정 표현 부재",
  "결제/PG/checkout 구현 부재",
  "법무 No-Go 기준",
  "법무 검토자 질문",
  "PR175/PR178 후속 연결",
  "정보 부족 항목 표시",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "초안 필드명",
  "후속 PR 번호 가정",
  "실제 법률 자문 결론",
] as const;

export const PR174_LINKED_HUBS = [
  "PR-169-TERMS-PRIVACY-DRAFT-PLAN-OPS.md",
  "PR-170-PAYMENT-ARCHITECTURE-PLAN-OPS.md",
  "PR-171-REFUND-SUPPORT-POLICY-PLAN-OPS.md",
  "PR-172-BETA-REVIEW-SUMMARY-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
  "PR-162-USER-SUPPORT-INBOX-PLAN-OPS.md",
] as const;

export const PR174_SOURCE_PR_SUMMARY: readonly {
  id: string;
  title: string;
  role: string;
}[] = [
  { id: "PR169", title: "Terms & Privacy Draft Plan", role: "초안 계획·금지 표현" },
  { id: "PR170", title: "Payment Architecture Plan", role: "결제 구조·비저장 원칙" },
  { id: "PR171", title: "Refund & Support Policy Plan", role: "환불·지원 검토" },
  { id: "PR172", title: "Beta Review Summary", role: "베타 종합·PR173 진입" },
  { id: "PR173", title: "Public Release Readiness", role: "work-tools·테스트·보안 보강" },
] as const;

export const PR174_FORBIDDEN_PHRASES: readonly string[] = [
  ...TERMS_PRIVACY_FORBIDDEN_EXPRESSIONS.map((r) => r.phrase),
  "즉시 적용 가능",
  "준수 완료",
  "환불정책 확정",
  "결제정책 확정",
];

export const PR174_TEST_FILES = [
  "tests/ops/pr174-terms-legal-review-prep.test.ts",
  "tests/ops/pr169-terms-privacy-draft-plan.test.ts",
  "tests/ops/pr171-refund-support-policy-plan.test.ts",
] as const;

export const LEGAL_REVIEW_REQUIRED_HANDOFF = LEGAL_REVIEW_REQUIRED_ITEMS;
