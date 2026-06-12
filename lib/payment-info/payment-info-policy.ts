/**
 * PR-BS-17: Card payment / premium payment reference info policy gate (no PG, no customer payment storage).
 *
 * Distinction:
 * - Insurer premium card/auto-transfer/virtual-account **reference** info → gated by this module
 * - PlannerDesk PG subscription billing → out of scope (PR170/PR175); no checkout/billing routes
 */

export const PAYMENT_INFO_HIGH_RISK_TYPES = [
  "paymentInfo",
  "cardPayment",
  "premiumPayment",
  "autoTransfer",
  "virtualAccount",
  "customerCenterPayment",
  "faxPayment",
] as const;

export type PaymentInfoHighRiskType = (typeof PAYMENT_INFO_HIGH_RISK_TYPES)[number];

export const PAYMENT_INFO_FORBIDDEN_FIELDS = [
  "cardNumber",
  "cvc",
  "accountNumber",
  "paymentPassword",
  "paymentToken",
  "customerName",
  "residentNumber",
  "phone",
  "contractNumber",
  "policyNumber",
  "customerPremium",
  "paymentHistory",
] as const;

export type PaymentInfoForbiddenField = (typeof PAYMENT_INFO_FORBIDDEN_FIELDS)[number];

export const PAYMENT_INFO_FORBIDDEN_PHRASES = [
  "카드납 가능합니다",
  "무조건 카드납 됩니다",
  "이 카드로 납입하면 됩니다",
  "이 번호로 전화하면 됩니다",
  "이 방법만 쓰면 됩니다",
  "항상 최신",
  "100% 정확",
  "공식 확정",
  "보험료 납입 문제 없습니다",
  "고객 결제정보를 입력하세요",
] as const;

export const PAYMENT_INFO_ALLOWED_NOTICES = [
  "보험사 정책과 상품·채널에 따라 납입 가능 여부가 달라질 수 있습니다.",
  "고객 안내 전 보험사 공식 출처와 최근 확인일을 다시 확인하세요.",
  "카드납·납입 조건은 업무 참고용 정보이며 확정 안내가 아닙니다.",
  "고객 결제정보, 카드번호, 계좌번호는 PlannerDesk에 입력하거나 저장하지 마세요.",
] as const;

/** PlannerDesk SaaS billing vs insurer premium reference (documentation + tests). */
export const PLANNERDESK_PG_SCOPE_NOTICE =
  "PlannerDesk 유료 구독·PG 결제(checkout/billing)는 보험사 보험료 카드납·납입 참고 정보와 별개이며, 이번 단계에서 구현하지 않습니다.";

const PLANNER_READY_STATUSES = new Set(["verified", "published"]);

export function isPaymentInfoHighRiskType(type: string): boolean {
  return (PAYMENT_INFO_HIGH_RISK_TYPES as readonly string[]).includes(type);
}

export type PaymentInfoVisibilityCandidate = {
  infoType: string;
  reviewStatus?: string;
  visibilityScope?: string;
  officialSourceUrl?: string | null;
  lastVerifiedAt?: string | null;
  riskLevel?: string;
};

/** Payment-info categories are not public display candidates (PR-BS-17 default). */
export function isPaymentInfoPublicVisible(
  _candidate?: PaymentInfoVisibilityCandidate,
): boolean {
  if (_candidate && isPaymentInfoHighRiskType(_candidate.infoType)) {
    return false;
  }
  return false;
}

export type PaymentInfoPlannerCandidate = PaymentInfoVisibilityCandidate & {
  reviewStatus: string;
  visibilityScope: string;
  officialSourceUrl: string | null;
  lastVerifiedAt: string | null;
  riskLevel: string;
};

export function isPaymentInfoPlannerCandidate(
  candidate: PaymentInfoPlannerCandidate,
): boolean {
  if (!isPaymentInfoHighRiskType(candidate.infoType)) {
    return false;
  }
  if (!PLANNER_READY_STATUSES.has(candidate.reviewStatus)) {
    return false;
  }
  if (candidate.visibilityScope !== "planner") {
    return false;
  }
  if (!candidate.officialSourceUrl?.trim()) {
    return false;
  }
  if (!candidate.lastVerifiedAt?.trim()) {
    return false;
  }
  if (candidate.riskLevel !== "high") {
    return false;
  }
  return true;
}

export function buildPaymentInfoDisplayNotice(): string {
  return PAYMENT_INFO_ALLOWED_NOTICES.join(" ");
}

export function containsForbiddenPaymentInfoPhrase(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return PAYMENT_INFO_FORBIDDEN_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function projectionIncludesForbiddenPaymentField(
  record: Record<string, unknown>,
): boolean {
  return PAYMENT_INFO_FORBIDDEN_FIELDS.some((field) => field in record);
}

export function stripForbiddenPaymentFields<T extends Record<string, unknown>>(
  record: T,
): Omit<T, PaymentInfoForbiddenField> {
  const out = { ...record };
  for (const field of PAYMENT_INFO_FORBIDDEN_FIELDS) {
    delete (out as Record<string, unknown>)[field];
  }
  return out as Omit<T, PaymentInfoForbiddenField>;
}
