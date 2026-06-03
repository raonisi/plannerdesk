// VERIFIED_PLANNER answer assistant preview feature gate (PR-97-B).
// Default OFF — traffic must not open until a follow-up QA + Go sign-off PR.

/** Code constant default. Do not enable without operational sign-off. */
export const ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED = false;

/**
 * When preview is enabled, admins may use the verified route for UX testing.
 * Does not bypass Safety Gate, Retrieval whitelist, or Output Safety Scan.
 */
export const ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST = true;

export function isAnswerAssistantVerifiedPreviewEnabled(): boolean {
  return ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED;
}

export function canAdminTestVerifiedAnswerAssistant(): boolean {
  return (
    isAnswerAssistantVerifiedPreviewEnabled() &&
    ALLOW_ADMIN_VERIFIED_ANSWER_ASSISTANT_TEST
  );
}

export const VERIFIED_PREVIEW_DISABLED_MESSAGE =
  "현재 검증 설계사 제한 공개는 비활성화되어 있습니다. 기능 준비가 완료되면 별도 공지 후 단계적으로 제공됩니다.";
