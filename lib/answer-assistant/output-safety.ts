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
  "무조건 부지급",
  "절대 못 받",
  "절대 받을 수 없",
] as const;

const OUTPUT_BLOCKED_CLAIM_DOCUMENT_ONLY = [
  "이 서류만 내면",
  "이 서류만 제출",
  "이 서류만 내면 됩니다",
] as const;

const OUTPUT_BLOCKED_CANCELLATION = [
  "무조건 해지",
  "반드시 해지",
  "무조건 해지하세요",
] as const;

const OUTPUT_BLOCKED_FEAR_EXTRA = [
  "이대로 두면 큰일",
  "이대로 두면 손해",
] as const;

const OUTPUT_BLOCKED_LEGAL_TAX = [
  "민원 넣으면 이깁니다",
  "승소 확정",
  "법적으로 확정",
  "세무 확정",
  "세금은 이렇게 처리",
] as const;

const OUTPUT_BLOCKED_MEDICAL_EXTRA = [
  "이 병은 고지",
  "고지 대상입니다",
] as const;

const OUTPUT_BLOCKED_INVESTMENT_EXTRA = [
  "지금 파세요",
  "지금 사세요",
] as const;

const OUTPUT_BLOCKED_SECRET_LEAK = [
  "api key",
  "apikey",
  "auth_secret",
  "process.env",
  "bearer token",
  "secret key",
] as const;

const OUTPUT_BLOCKED_PROMPT_LEAK = [
  "system prompt",
  "시스템 프롬프트는",
  "hidden instruction",
] as const;

export const OUTPUT_BLOCKED_PHRASES = [
  ...OUTPUT_BLOCKED_CLAIM_JUDGMENT,
  ...OUTPUT_BLOCKED_CLAIM_CERTAINTY,
  ...OUTPUT_BLOCKED_MEDICAL,
  ...OUTPUT_BLOCKED_LOSS_ADJUSTMENT,
  ...OUTPUT_BLOCKED_SOLICITATION,
  ...OUTPUT_BLOCKED_CLAIM_DOCUMENT_ONLY,
  ...OUTPUT_BLOCKED_CANCELLATION,
  ...OUTPUT_BLOCKED_FEAR_EXTRA,
  ...OUTPUT_BLOCKED_LEGAL_TAX,
  ...OUTPUT_BLOCKED_MEDICAL_EXTRA,
  ...OUTPUT_BLOCKED_INVESTMENT_EXTRA,
  ...OUTPUT_BLOCKED_SECRET_LEAK,
  ...OUTPUT_BLOCKED_PROMPT_LEAK,
] as const;

/** PR164 — recommended safe wording hints (docs/tests; not auto-inserted). */
export const OUTPUT_SAFE_WORDING_HINTS = [
  "지급 여부는 약관, 사고 내용, 보험사 심사에 따라 달라질 수 있습니다.",
  "제출 전 보험사 공식 안내를 확인해야 합니다.",
  "고객정보와 민감정보는 입력하지 말고 비식별 요약으로 정리해 주세요.",
  "최종 판단은 해당 전문가 또는 공식 기관 확인이 필요합니다.",
  "내부 설정이나 비공개 정보는 제공할 수 없습니다.",
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
