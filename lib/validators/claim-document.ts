// Validation helpers for the ClaimDocument admin write path. The two
// concerns gated here are:
//
//  1. Slug shape — admin slugs must be URL-safe so the future public read
//     (PR-39) can use them directly in stable cross-links.
//  2. Prohibited-phrase deny-list — claim-document copy must never imply
//     payout guarantee, claim outcome certainty, fear-based marketing, or
//     final coverage judgment. The canonical list lives in
//     docs/CLAIM_DOCUMENT_MODEL_PLAN.md Section I; this module mirrors it.
//
// The module is dependency-free so the actions, form, and future server
// handlers can reuse it without pulling in Prisma or React.

export const PROHIBITED_PHRASES = [
  "보험금 지급됩니다",
  "무조건 받을 수 있습니다",
  "청구하면 나옵니다",
  "확정",
  "100%",
  "지금 안 하면 못 받습니다",
] as const;

export type ProhibitedPhrase = (typeof PROHIBITED_PHRASES)[number];

// NFKC normalization so width-variant copies of "100%" (e.g. fullwidth
// digits) do not slip past the deny-list when an admin pastes content from
// a PDF. The match is a substring check; we never want a clever spacing
// trick to evade the gate.
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

// Kebab-case ASCII slug. Future PR-39 will use this slug as the URL path
// segment for the public claim-document detail view, so we require a shape
// that is safe to render without escaping.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

export function isValidSlug(value: string): boolean {
  if (value.length === 0 || value.length > SLUG_MAX_LENGTH) return false;
  return SLUG_PATTERN.test(value);
}
