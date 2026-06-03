// Allowlist-based verified answer assistant release (PR-98).
// No DB schema — comma-separated userId list via env only.

/**
 * Parses ANSWER_ASSISTANT_VERIFIED_ALLOWLIST (comma-separated userIds).
 * Empty or unset means no verified planner is allowlisted.
 */
export function getAnswerAssistantVerifiedAllowlistUserIds(): ReadonlySet<string> {
  const raw = process.env.ANSWER_ASSISTANT_VERIFIED_ALLOWLIST?.trim();
  if (!raw) {
    return new Set();
  }

  const ids = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return new Set(ids);
}

export function isVerifiedAnswerAssistantAllowlistConfigured(): boolean {
  return getAnswerAssistantVerifiedAllowlistUserIds().size > 0;
}

export function isUserOnVerifiedAnswerAssistantAllowlist(userId: string): boolean {
  const allowlist = getAnswerAssistantVerifiedAllowlistUserIds();
  if (allowlist.size === 0) {
    return false;
  }
  return allowlist.has(userId);
}

/** Never expose raw allowlist to clients — server-side only. */
export function getVerifiedAnswerAssistantAllowlistCount(): number {
  return getAnswerAssistantVerifiedAllowlistUserIds().size;
}
