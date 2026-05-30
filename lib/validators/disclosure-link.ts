// Validation helpers for DisclosureLink admin writes (PR-72).

export const PROHIBITED_PHRASES = [
  "보험금 지급됩니다",
  "받을 수 있습니다",
  "청구하면 나옵니다",
  "무조건 보장",
  "지급 확정",
] as const;

export type ProhibitedPhrase = (typeof PROHIBITED_PHRASES)[number];

const BLOCKED_URL_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:"];

function normalizeInput(value: string): string {
  return value.normalize("NFKC");
}

export function findProhibitedPhrase(
  value: string | null | undefined,
): ProhibitedPhrase | null {
  if (!value) return null;
  const text = normalizeInput(value);
  for (const phrase of PROHIBITED_PHRASES) {
    if (text.includes(phrase)) return phrase;
  }
  return null;
}

export function scanFieldsForProhibitedPhrases(
  fields: Record<string, string | null | undefined>,
): { field: string; phrase: ProhibitedPhrase } | null {
  for (const [field, value] of Object.entries(fields)) {
    const phrase = findProhibitedPhrase(value);
    if (phrase) return { field, phrase };
  }
  return null;
}

export function isValidAdminUrl(value: string): boolean {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  for (const blocked of BLOCKED_URL_PROTOCOLS) {
    if (lower.startsWith(blocked)) return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 4_000;
export const SOURCE_NAME_MAX_LENGTH = 200;
export const ADMIN_MEMO_MAX_LENGTH = 2_000;
export const SORT_ORDER_MIN = -10_000;
export const SORT_ORDER_MAX = 10_000;

export function clampSortOrder(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(SORT_ORDER_MAX, Math.max(SORT_ORDER_MIN, Math.trunc(value)));
}
