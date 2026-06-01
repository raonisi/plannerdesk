// Plain-text sanitization for CorrectionRequest title/message (PR-80).

const HTML_TAG_PATTERN = /<[a-z!/][^>]*>/i;
const SCRIPT_PATTERN = /<script\b/i;

/** Reject dangerous markup; strip remaining tags if any angle brackets remain. */
export function sanitizeCorrectionPlainText(value: string): {
  text: string;
  blocked: boolean;
} {
  const normalized = value.normalize("NFKC").replace(/\0/g, "");
  if (SCRIPT_PATTERN.test(normalized) || HTML_TAG_PATTERN.test(normalized)) {
    return { text: "", blocked: true };
  }
  const withoutTags = normalized.replace(/<[^>]*>/g, "");
  const collapsedNewlines = withoutTags
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n");
  return { text: collapsedNewlines.trim(), blocked: false };
}
