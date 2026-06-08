/**
 * Payment legal readiness ops standards (PR-165). Review/docs only — no billing, PG, or pricing finalization.
 */

import { PR160_EXPANSION_VERDICTS } from "@/lib/ops/beta-expansion-decision";
import { PR164_SAFETY_VERDICTS } from "@/lib/ops/ai-safety-hardening";
import {
  PR145_FORBIDDEN_PHRASES,
  PR145_OVERALL_VERDICTS,
} from "@/lib/ops/payment-feasibility";

export const PR165_SCOPE_NOTICE =
  "유료화 **법무·결제·환불·개인정보 준비도 재검토**입니다. 결제 기능·PG 연동·가격표·구독·환불정책 확정·회원가입 확대·DB/schema 변경은 포함하지 않습니다.";

export const PR165_FORBIDDEN_DOC_CONTENT =
  "문서에 카드번호·실제 가격·PG 계약·API key·webhook secret·고객 결제 원문·법무 검토 완료 단정을 넣지 않습니다.";

export type LegalReadinessStatus =
  | "ready"
  | "conditional"
  | "not_ready"
  | "blocked"
  | "review_needed";

export const LEGAL_READINESS_STATUS_LABEL: Record<LegalReadinessStatus, string> = {
  ready: "Ready",
  conditional: "Conditional Ready",
  not_ready: "Not Ready",
  blocked: "Blocked",
  review_needed: "검토 필요",
};

export type ReviewItemStatus = "review_needed" | "required_met" | "required_partial" | "required_gap";

export const REVIEW_ITEM_STATUS_LABEL: Record<ReviewItemStatus, string> = {
  review_needed: "검토 필요",
  required_met: "필수(조건부 충족)",
  required_partial: "조건부",
  required_gap: "미완료",
};

export const PR165_OPEN_CRITICAL_COUNT = 0;

export const PR165_ENTRY_CONDITIONS: readonly {
  id: string;
  condition: string;
  result: string;
  met: boolean;
}[] = [
  {
    id: "pr145",
    condition: "PR145 Payment Feasibility Plan",
    result: PR145_OVERALL_VERDICTS.feasibilityReview,
    met: true,
  },
  {
    id: "pr160",
    condition: "PR160 유료화 보류 분리",
    result: PR160_EXPANSION_VERDICTS.paidBeta,
    met: PR160_EXPANSION_VERDICTS.paidBeta === "stop",
  },
  {
    id: "pr164",
    condition: "PR164 AA safety 유지",
    result: PR164_SAFETY_VERDICTS.outputSafetyRules,
    met: PR164_SAFETY_VERDICTS.accessGuardIntegrity === "ready",
  },
  {
    id: "impl",
    condition: "결제 구현 없이 문서화만",
    result: "가능",
    met: true,
  },
  {
    id: "legal",
    condition: "법무·세무·결제 확정 표현 없음",
    result: "검토 필요만",
    met: true,
  },
] as const;

/** Monetization stage separation — PR165 does not authorize paid launch. */
export const MONETIZATION_STAGE_DECISIONS: readonly {
  stage: string;
  meaning: string;
  pr165Judgment: string;
}[] = [
  {
    stage: "제한 베타",
    meaning: "소수 사용자 기능 검증",
    pr165Judgment: "유료화와 분리·현재 단계",
  },
  {
    stage: "공개 베타",
    meaning: "더 넓은 사용자 검증",
    pr165Judgment: "별도 PR·법무 검토 전 Go 금지",
  },
  {
    stage: "유료 베타",
    meaning: "결제 전제 제한 운영",
    pr165Judgment: "법무·결제·환불 검토 전 보류",
  },
  {
    stage: "정식 유료화",
    meaning: "가격·약관·결제·지원 확정",
    pr165Judgment: "PR165에서 Go 판단 금지",
  },
] as const;

export const LEGAL_REVIEW_CHECKLIST: readonly {
  id: string;
  item: string;
  criteria: string;
  status: ReviewItemStatus;
}[] = [
  { id: "terms", item: "이용약관", criteria: "유료 범위·책임 제한·금지 행위", status: "review_needed" },
  { id: "privacy", item: "개인정보처리방침", criteria: "수집·보관·제3자·파기", status: "review_needed" },
  { id: "refund", item: "환불·취소", criteria: "결제 취소·중도 해지·환불 예외", status: "review_needed" },
  { id: "ecommerce", item: "전자상거래 고지", criteria: "사업자·결제 조건·청약철회", status: "review_needed" },
  { id: "support", item: "고객지원", criteria: "문의·장애·환불 요청", status: "review_needed" },
  { id: "insurance-expr", item: "보험 관련 표현", criteria: "지급 확정·가입 유도·해지 권유 금지", status: "required_met" },
  { id: "aa-notice", item: "Answer Assistant 고지", criteria: "최종 판단 아님·PII 입력 금지", status: "required_met" },
  { id: "data-accuracy", item: "데이터 정확성", criteria: "보험사 공식 확인 필요", status: "required_met" },
  { id: "liability", item: "책임 제한", criteria: "정보 제공 도구·최종 판단 아님", status: "review_needed" },
  { id: "minor-proxy", item: "미성년자·대리 사용", criteria: "사용 자격·제한", status: "review_needed" },
] as const;

export const PAYMENT_PG_CHECKLIST: readonly {
  id: string;
  item: string;
  criteria: string;
  status: ReviewItemStatus;
}[] = [
  { id: "pg-select", item: "PG사 선정", criteria: "수수료·정산·환불·보안", status: "review_needed" },
  { id: "methods", item: "결제수단", criteria: "카드·계좌·간편결제", status: "review_needed" },
  { id: "recurring", item: "정기결제", criteria: "구독·해지·갱신 고지", status: "review_needed" },
  { id: "receipt", item: "영수증/세금계산서", criteria: "발행 방식·책임", status: "review_needed" },
  { id: "fail", item: "결제 실패", criteria: "재시도·이용 제한·안내", status: "review_needed" },
  { id: "refund-op", item: "환불 처리", criteria: "부분·전액·기간", status: "review_needed" },
  { id: "price-change", item: "가격 변경", criteria: "사전 고지·적용 시점", status: "review_needed" },
  { id: "security", item: "보안", criteria: "결제정보 직접 저장 금지", status: "required_met" },
  { id: "pii-min", item: "개인정보", criteria: "결제 관련 최소 수집", status: "required_met" },
  { id: "ops-log", item: "운영 로그", criteria: "결제 원문·카드정보 저장 금지", status: "required_met" },
] as const;

export const PRICING_POLICY_REVIEW: readonly {
  id: string;
  item: string;
  criteria: string;
  pr165Judgment: string;
}[] = [
  { id: "free", item: "무료 플랜", criteria: "제한 기능·범위", pr165Judgment: "확정 금지" },
  { id: "paid", item: "유료 플랜", criteria: "대상·기능", pr165Judgment: "확정 금지" },
  { id: "team", item: "팀/지점 플랜", criteria: "조직 권한", pr165Judgment: "검토 필요" },
  { id: "aa-bill", item: "Answer Assistant 과금", criteria: "안전·사용량·제한", pr165Judgment: "검토 필요" },
  { id: "freshness", item: "데이터 업데이트", criteria: "최신성 비용", pr165Judgment: "검토 필요" },
  { id: "refund-rule", item: "환불 기준", criteria: "기간·사용량·장애", pr165Judgment: "검토 필요" },
  { id: "promo", item: "할인·프로모션", criteria: "표시·광고 리스크", pr165Judgment: "검토 필요" },
  { id: "price-public", item: "가격표 공개", criteria: "법무·결제 검토 후", pr165Judgment: "PR165 금지" },
] as const;

export const MONETIZATION_FORBIDDEN_EXPRESSIONS: readonly {
  phrase: string;
  reason: string;
}[] = [
  { phrase: "지금 결제하면 바로 사용 가능", reason: "결제 기능 미구현" },
  { phrase: "유료 플랜 확정", reason: "가격정책 미확정" },
  { phrase: "환불 보장", reason: "환불정책 미확정" },
  { phrase: "보험금 청구 성공률 향상 보장", reason: "과장·오인" },
  { phrase: "보험금 지급 가능성 판단", reason: "지급 확정 오인" },
  { phrase: "AI가 최종 판단", reason: "AA 보조 원칙 위반" },
  { phrase: "가입 전환율 보장", reason: "성과 보장 위험" },
  { phrase: "고객DB 매출 보장", reason: "영업 성과 보장 위험" },
  { phrase: "모든 보험사 최신 정보 보장", reason: "최신성 보장 불가" },
  { phrase: "법무 검토 완료", reason: "공식 확인 전 금지" },
] as const;

export const MONETIZATION_PREREQUISITES: readonly {
  id: string;
  condition: string;
  required: boolean;
  status: ReviewItemStatus;
}[] = [
  { id: "terms-done", condition: "약관 검토 완료", required: true, status: "required_gap" },
  { id: "privacy-done", condition: "개인정보처리방침 검토 완료", required: true, status: "required_gap" },
  { id: "refund-done", condition: "환불·취소 기준 검토 완료", required: true, status: "required_gap" },
  { id: "pg-done", condition: "PG 계약·보안 검토 완료", required: true, status: "required_gap" },
  { id: "no-card-store", condition: "결제정보 직접 저장 금지 구조", required: true, status: "required_met" },
  { id: "pricing-done", condition: "가격정책 검토 완료", required: true, status: "required_gap" },
  { id: "support-ops", condition: "고객지원 운영 기준", required: true, status: "required_partial" },
  { id: "data-fresh", condition: "데이터 최신성 운영 기준", required: true, status: "required_partial" },
  { id: "aa-safety", condition: "Answer Assistant safety", required: true, status: "required_partial" },
  { id: "rbac-split", condition: "public/admin 권한 분리", required: true, status: "required_partial" },
  { id: "beta-metrics", condition: "베타 지표 검토", required: true, status: "required_gap" },
  { id: "codex", condition: "Codex 제한검수", required: true, status: "required_gap" },
] as const;

export const MONETIZATION_NO_GO_CRITERIA: readonly {
  situation: string;
  judgment: string;
}[] = [
  { situation: "약관·개인정보·환불 기준 미확정", judgment: "No-Go" },
  { situation: "결제정보 저장 구조 불명확", judgment: "No-Go" },
  { situation: "PG 보안 검토 미완료", judgment: "No-Go" },
  { situation: "보험금 지급 확정 표현 존재", judgment: "No-Go" },
  { situation: "개인정보 입력 유도 문구 존재", judgment: "No-Go" },
  { situation: "Answer Assistant safety 실패", judgment: "No-Go" },
  { situation: "public/admin 권한 분리 실패", judgment: "No-Go" },
  { situation: "데이터 최신성 운영 기준 부재", judgment: "No-Go" },
  { situation: "고객지원·환불 대응 기준 부재", judgment: "No-Go" },
  { situation: "가격표·구독 플랜 임의 확정", judgment: "No-Go" },
  { situation: "법무·세무 확인 없이 유료화 안내", judgment: "No-Go" },
] as const;

/** Answer Assistant if monetized — additional safety requirements (docs only). */
export const AA_PAID_SAFETY_REQUIREMENTS: readonly {
  id: string;
  requirement: string;
  basis: string;
}[] = [
  { id: "access", requirement: "verified planner + allowlist 유지", basis: "PR148·PR164" },
  { id: "no-payout", requirement: "지급 확정·가입 유도 출력 차단 유지", basis: "output-safety" },
  { id: "no-pii", requirement: "PII 입력·출력 차단·metadata-only audit", basis: "usage-log" },
  { id: "no-provider-raw", requirement: "prompt/response 원문 저장 없음", basis: "PR164" },
  { id: "disclaimer", requirement: "유료 이용 시에도 최종 판단·공식 확인 고지", basis: "PR147·PR153" },
  { id: "usage-limit", requirement: "과금 전 사용량·rate limit·disable 기준", basis: "rollback-disable" },
  { id: "refund-scope", requirement: "AI 오류 환불 범위는 법무 검토 후", basis: "검토 필요" },
] as const;

export const INSURANCE_TOOL_DISCLAIMER_ROWS: readonly {
  topic: string;
  requiredNotice: string;
  status: ReviewItemStatus;
}[] = [
  { topic: "보험금 판단", requiredNotice: "지급 여부는 약관·보험사 심사에 따름", status: "required_met" },
  { topic: "청구서류", requiredNotice: "보험사 공식 안내 확인 필요", status: "required_met" },
  { topic: "상품 비교", requiredNotice: "가입·해지 유도 금지·기준 비교", status: "required_met" },
  { topic: "데이터", requiredNotice: "최신성·정확성 보장 없음", status: "required_partial" },
  { topic: "유료 표시", requiredNotice: "성과·수익 보장 표현 금지", status: "required_met" },
] as const;

export type ReadinessChecklistStatus = "met" | "partial" | "pending" | "gap";

export const PAYMENT_LEGAL_READINESS_CHECKLIST: readonly {
  id: string;
  item: string;
  criterion: string;
  status: ReadinessChecklistStatus;
}[] = [
  { id: "no-billing", item: "결제 기능 없음", criterion: "checkout/billing route 없음", status: "met" },
  { id: "no-pg", item: "PG 연동 없음", criterion: "API·webhook 없음", status: "met" },
  { id: "no-price", item: "가격표 확정 없음", criterion: "PR165 금지", status: "met" },
  { id: "legal-doc", item: "법무 체크리스트", criterion: "검토 필요 표시", status: "met" },
  { id: "pg-doc", item: "결제/PG 체크리스트", criterion: "검토 필요 표시", status: "met" },
  { id: "forbidden-expr", item: "금지 표현 기준", criterion: "문서화", status: "met" },
  { id: "no-go", item: "No-Go 기준", criterion: "문서화", status: "met" },
  { id: "aa-paid", item: "AA 유료 safety", criterion: "추가 기준 문서", status: "met" },
  { id: "terms-final", item: "약관 확정", criterion: "법무", status: "gap" },
  { id: "refund-final", item: "환불 확정", criterion: "법무", status: "gap" },
  { id: "codex", item: "Codex 검수", criterion: "PR165 후", status: "pending" },
  { id: "pr169-draft", item: "PR169 Draft Plan", criterion: "약관 초안 계획", status: "met" },
  { id: "pr170-arch", item: "PR170 Architecture Plan", criterion: "결제 구조 계획", status: "met" },
  { id: "pr171-policy", item: "PR171 Refund & Support Plan", criterion: "환불·지원 정책", status: "met" },
  { id: "paid-launch", item: "실제 유료화 실행", criterion: "PR172~ 이후", status: "pending" },
] as const;

export const PR165_READINESS_VERDICTS = {
  paymentLegalReadiness: "conditional" as LegalReadinessStatus,
  actualMonetizationGo: "not_ready" as LegalReadinessStatus,
  documentationComplete: "ready" as LegalReadinessStatus,
  billingImplementation: "blocked" as LegalReadinessStatus,
} as const;

export const PR166_FOLLOW_UP_PRS: readonly {
  id: string;
  title: string;
  purpose: string;
  risk: string;
  codex: string;
}[] = [
  { id: "PR166", title: "Beta Cohort Control", purpose: "베타 대상군 관리", risk: "High", codex: "조건부" },
  { id: "PR167", title: "Beta Metrics Review", purpose: "지표 검토", risk: "High", codex: "조건부" },
  { id: "PR168", title: "Data Correction Workflow", purpose: "수정 workflow", risk: "High", codex: "조건부" },
  { id: "PR169", title: "Terms & Privacy Draft Plan", purpose: "약관·개인정보 초안", risk: "Critical", codex: "필수" },
  { id: "PR170", title: "Payment Architecture Plan", purpose: "결제 구조 설계", risk: "Critical", codex: "필수" },
  { id: "PR171", title: "Refund & Support Policy Plan", purpose: "환불·지원 정책", risk: "Critical", codex: "필수" },
] as const;

export const CODEX_REVIEW_SCOPE: readonly string[] = [
  "결제·PG·billing 구현 부재",
  "가격표·구독 확정 부재",
  "법무·세무·결제 확정 표현 부재",
  "유료화 금지 표현 기준",
  "개인정보·결제정보 저장 구조 부재",
  "Answer Assistant safety 유지",
  "DB/schema/package 부재",
  "No-Go 기준 적절성",
  "PR166 진입",
] as const;

export const CODEX_EXCLUDED_SCOPE: readonly string[] = [
  "문구 스타일",
  "표 포맷",
  "후속 PR 번호 가정",
] as const;

export const PR165_LINKED_HUBS = [
  "PR-145-PAYMENT-FEASIBILITY-OPS.md",
  "PR-147-DATA-RESPONSIBILITY-NOTICE-OPS.md",
  "PR-153-BETA-USER-NOTICE-PACK-OPS.md",
  "PR-160-BETA-EXPANSION-DECISION-OPS.md",
  "PR-164-AI-SAFETY-HARDENING-OPS.md",
] as const;

export const PR165_CODE_REFERENCES = {
  paymentFeasibility: "lib/ops/payment-feasibility.ts",
  paymentLegal: "lib/ops/payment-legal-readiness.ts",
  aiSafety: "lib/ops/ai-safety-hardening.ts",
  betaExpansion: "lib/ops/beta-expansion-decision.ts",
  dataResponsibility: "lib/ops/data-responsibility-notice.ts",
} as const;

/** Extends PR145 forbidden phrases for PR165 static scans. */
export const PR165_FORBIDDEN_PHRASES: readonly string[] = [
  ...PR145_FORBIDDEN_PHRASES,
  "지금 결제하면",
  "유료 플랜 확정",
  "보험금 청구 성공률",
  "가입 전환율 보장",
  "AI가 최종 판단",
] as const;

export const PR165_TEST_FILES = [
  "tests/ops/pr165-payment-legal-readiness.test.ts",
  "tests/ops/pr145-payment-feasibility.test.ts",
] as const;
