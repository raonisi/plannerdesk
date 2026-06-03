// VERIFIED_PLANNER answer assistant feature gates (PR-97-B / PR-98 / PR-99-B).
// Default OFF — never enable in code. Explicit env + allowlist for beta only.

import { isVerifiedAnswerAssistantAllowlistConfigured } from "./allowlist";

/** Code default when beta env is unset. Must stay false. */
export const ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT = false;

/** @deprecated Use ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT */
export const ANSWER_ASSISTANT_VERIFIED_PREVIEW_CODE_DEFAULT =
  ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT;

/** @deprecated Use ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT */
export const ANSWER_ASSISTANT_VERIFIED_PREVIEW_ENABLED =
  ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT;

function parseBooleanEnv(
  raw: string | undefined,
  defaultValue: boolean,
): boolean {
  if (!raw) {
    return defaultValue;
  }
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  return defaultValue;
}

/**
 * Primary allowlist beta flag (PR-99-B).
 * ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=true only after operator sign-off.
 */
export function isAnswerAssistantVerifiedBetaEnabled(): boolean {
  return parseBooleanEnv(
    process.env.ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED,
    ANSWER_ASSISTANT_VERIFIED_BETA_CODE_DEFAULT,
  );
}

/**
 * Legacy preview flag — still honored but allowlist is required (PR-99-B).
 * Prefer ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED for new deployments.
 */
function isLegacyVerifiedPreviewFlagEnabled(): boolean {
  return parseBooleanEnv(
    process.env.ANSWER_ASSISTANT_VERIFIED_PREVIEW,
    false,
  );
}

/** Raw gate ON (beta or legacy). Does not imply users can generate. */
export function isAnswerAssistantVerifiedGateEnvEnabled(): boolean {
  return (
    isAnswerAssistantVerifiedBetaEnabled() || isLegacyVerifiedPreviewFlagEnabled()
  );
}

/**
 * Effective gate for verified route/actions.
 * Gate ON without allowlist returns false — prevents allowlist-less activation.
 */
export function isAnswerAssistantVerifiedPreviewEnabled(): boolean {
  if (!isAnswerAssistantVerifiedGateEnvEnabled()) {
    return false;
  }
  return isVerifiedAnswerAssistantAllowlistConfigured();
}

/**
 * When preview/beta gate is enabled, admins may test UX on allowlisted beta only.
 * Does not bypass Safety Gate, Retrieval whitelist, or Output Safety.
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

export const VERIFIED_BETA_NOT_CONFIGURED_MESSAGE =
  "제한 beta가 활성화되었으나 allowlist가 비어 있어 초안 생성을 실행하지 않습니다. 운영자가 파일럿 userId allowlist를 설정한 뒤 다시 시도해 주세요.";
