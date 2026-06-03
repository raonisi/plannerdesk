// VERIFIED_PLANNER answer assistant preview feature gate (PR-97-B / PR-98).
// Default OFF — never enable in code. Explicit env only after operational sign-off.

/** Code default when ANSWER_ASSISTANT_VERIFIED_PREVIEW env is unset. Must stay false. */
export const ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT = false;

/** @deprecated Use ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT — kept for tests. */
export const ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED =
  ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT;

/**
 * Public boolean config (not a secret).
 * Set ANSWER_ASSISTANT_VERIFIED_PREVIEW=true only after PR-98 Go + allowlist configured.
 */
export function isAnswerAssistantVerifiedPreviewEnabled(): boolean {
  const raw = process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW?.trim().toLowerCase();
  if (!raw) {
    return ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT;
  }
  if (raw === "true" || raw === "1") {
    return true;
  }
  if (raw === "false" || raw === "0") {
    return false;
  }
  return ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT;
}

/**
 * When preview is enabled, admins may use the verified route for UX testing.
 * Does not bypass allowlist for verified planners, Safety Gate, or Output Safety.
 */
export const ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST = true;

export function canAdminTestVerifiedAnswerAssistant(): boolean {
  return (
    isAnswerAssistantVerifiedPreviewEnabled() &&
    ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST
  );
}

export const VERIFIED_PREVIEW_DISABLED_MESSAGE =
  "현재 검증 설계사 제한 공개는 비활성화되어 있습니다. 기능 준비가 완료되면 별도 공지 후 단계적으로 제공됩니다.";
