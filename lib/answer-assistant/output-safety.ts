// Generated draft output safety scan (PR-94 / PR-97-A).

const OUTPUT_BLOCKED_CLAIM_JUDGMENT = [
  "지급됩니다",
  "받을 수 있습니다",
  "보장됩니다",
  "청구 가능합니다",
  "면책입니다",
  "부지급입니다",
  "받을 가능성이 높습니다",
  "지급 가능성이 높습니다",
  "얼마 받을 수 있습니다",
  "보험금 지급됩니다",
  "반드시 보장",
  "지급 확정",
] as const;

const OUTPUT_BLOCKED_MEDICAL = [
  "진단서상 가능합니다",
  "이 진단이면 해당됩니다",
  "이 수술명은 보장됩니다",
  "의료적으로 해당됩니다",
] as const;

const OUTPUT_BLOCKED_LOSS_ADJUSTMENT = [
  "손해사정 결과가 맞습니다",
  "부지급이 타당합니다",
  "보험사 판단이 맞습니다",
  "분쟁하면 이깁니다",
] as const;

const OUTPUT_BLOCKED_SOLICITATION = [
  "무조건 가입",
  "반드시 가입",
  "100% 보장",
  "확정 지급",
  "지금 안 하면 손해",
  "해지하면 큰일",
  "가입하면 해결",
  "수익 보장",
  "지금 매수",
  "지금 매도",
  "고지를 안 해도",
  "고객을 이렇게 설득",
] as const;

const OUTPUT_BLOCKED_CLAIM_CERTAINTY = [
  "무조건 지급",
  "반드시 지급",
  "보험금 확정",
] as const;

export const OUTPUT_BLOCKED_PHRASES = [
  ...OUTPUT_BLOCKED_CLAIM_JUDGMENT,
  ...OUTPUT_BLOCKED_CLAIM_CERTAINTY,
  ...OUTPUT_BLOCKED_MEDICAL,
  ...OUTPUT_BLOCKED_LOSS_ADJUSTMENT,
  ...OUTPUT_BLOCKED_SOLICITATION,
] as const;

const RESIDENT_ID_PATTERN = /\b\d{6}-\d{7}\b/;
const PHONE_PATTERN = /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b/;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const CONTRACT_CONTEXT_PATTERN =
  /(계약번호|증권번호|계좌번호|고객번호)[^0-9]{0,16}\d{4,}/i;

function normalizeForScan(value: string): string {
  return value.normalize("NFKC").toLowerCase();
}

export function validateGeneratedDraft(text: string): {
  ok: boolean;
  matchedPhrase?: string;
} {
  const normalized = normalizeForScan(text);

  for (const phrase of OUTPUT_BLOCKED_PHRASES) {
    if (normalized.includes(phrase.toLowerCase())) {
      return { ok: false, matchedPhrase: phrase };
    }
  }

  if (
    RESIDENT_ID_PATTERN.test(text) ||
    PHONE_PATTERN.test(text) ||
    EMAIL_PATTERN.test(text) ||
    CONTRACT_CONTEXT_PATTERN.test(text)
  ) {
    return { ok: false, matchedPhrase: "민감정보 패턴" };
  }

  return { ok: true };
}
