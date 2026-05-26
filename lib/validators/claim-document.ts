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
  "\ubcf4\ud5d8\uae08 \uc9c0\uae09\ub429\ub2c8\ub2e4",
  "\ubb34\uc870\uac74 \ubc1b\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4",
  "\uccad\uad6c\ud558\uba74 \ub098\uc635\ub2c8\ub2e4",
  "\ud655\uc815",
  "100%",
  "\uc9c0\uae08 \uc548 \ud558\uba74 \ubabb \ubc1b\uc2b5\ub2c8\ub2e4",
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
