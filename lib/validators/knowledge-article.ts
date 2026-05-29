// Validation helpers for KnowledgeArticle admin writes. No Prisma/React deps.

export const PROHIBITED_PHRASES = [
  "지급됩니다",
  "받을 수 있습니다",
  "청구하면 나옵니다",
  "이 서류면 충분합니다",
  "진단서를 올려주세요",
  "주민등록번호를 입력하세요",
  "고객 자료를 업로드하세요",
  "보험금 지급됩니다",
  "무조건 받을 수 있습니다",
  "확정",
  "100%",
] as const;

export type ProhibitedPhrase = (typeof PROHIBITED_PHRASES)[number];

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

export interface ProhibitedPhraseHit {
  field: string;
  phrase: ProhibitedPhrase;
}

export function scanFieldsForProhibitedPhrases(
  fields: Record<string, string | null | undefined>,
): ProhibitedPhraseHit | null {
  for (const [field, value] of Object.entries(fields)) {
    const phrase = findProhibitedPhrase(value);
    if (phrase) return { field, phrase };
  }
  return null;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 120;

export function isValidSlug(value: string): boolean {
  if (value.length === 0 || value.length > SLUG_MAX_LENGTH) return false;
  return SLUG_PATTERN.test(value);
}

export function parseCommaSeparatedList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
