// Generated draft output safety scan (PR-94).

const OUTPUT_BLOCKED_PHRASES = [
  "지급됩니다",
  "받을 수 있습니다",
  "면책입니다",
  "부지급입니다",
  "보장됩니다",
  "진단서상 가능합니다",
  "손해사정 결과가 맞습니다",
  "무조건 가입",
  "100% 보장",
  "확정 지급",
  "해지하면 큰일",
  "보험금 지급됩니다",
  "반드시 보장",
  "지급 확정",
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
