// Allowlist beta operational control (PR-99-B).
// Not full VERIFIED_PLANNER release — gate ON + allowlist required.

import {
  isVerifiedAnswerAssistantAllowlistConfigured,
  isUserOnVerifiedAnswerAssistantAllowlist,
} from "./allowlist";
import {
  isAnswerAssistantVerifiedBetaEnabled,
  isAnswerAssistantVerifiedGateEnvEnabled,
} from "./feature-gate";

export type AllowlistBetaOperationalStatus =
  | "disabled"
  | "not_configured"
  | "operational";

/** Gate env is on but allowlist is empty — beta must not run. */
export function getAllowlistBetaOperationalStatus(): AllowlistBetaOperationalStatus {
  if (!isAnswerAssistantVerifiedGateEnvEnabled()) {
    return "disabled";
  }
  if (!isVerifiedAnswerAssistantAllowlistConfigured()) {
    return "not_configured";
  }
  return "operational";
}

/** True only when beta/preview gate is ON and allowlist has at least one userId. */
export function isVerifiedAnswerAssistantAllowlistBetaOperational(): boolean {
  return getAllowlistBetaOperationalStatus() === "operational";
}

/** Allowlisted verified planner may generate (not admin-only shell view). */
export function canVerifiedPlannerUseAllowlistBeta(userId: string): boolean {
  return (
    isVerifiedAnswerAssistantAllowlistBetaOperational() &&
    isUserOnVerifiedAnswerAssistantAllowlist(userId)
  );
}

export const ALLOWLIST_BETA_ROLLBACK_STEPS = [
  "Set ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=false",
  "Set ANSWER_ASSISTANT_VERIFIED_PREVIEW=false (legacy)",
  "Clear ANSWER_ASSISTANT_VERIFIED_ALLOWLIST or remove pilot userIds",
  "Redeploy or reload environment",
  "Verify /planner/answer-assistant shows disabled state and server actions return FEATURE_DISABLED",
] as const;

export const ALLOWLIST_BETA_OPERATOR_CHECKLIST = [
  "PR-99-A-QA 또는 Antigravity 검수 sign-off 완료",
  "ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=true (명시적 설정만)",
  "ANSWER_ASSISTANT_VERIFIED_ALLOWLIST에 파일럿 userId만 등록 (PII 금지)",
  "ANSWER_ASSISTANT_RATE_LIMIT_BACKEND=durable (production)",
  "ANSWER_ASSISTANT_USAGE_AUDIT_BACKEND=durable (production)",
  "allowlist에 포함되지 않은 VERIFIED_PLANNER 접근 차단 확인",
  "GENERAL_USER / 비로그인 / public route 부재 확인",
  "고객·카카오·이메일 자동 발송·커뮤니티 자동 댓글 UI 부재 확인",
  "Output Safety·Prompt Injection·rate limit abuse 모니터링 경로 확인",
  "rollback 절차 공유 (ALLOWLIST_BETA_ROLLBACK_STEPS)",
] as const;

export function evaluateAllowlistBetaLaunchReadiness(): {
  ready: boolean;
  blockers: string[];
  warnings: string[];
} {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!isAnswerAssistantVerifiedBetaEnabled()) {
    warnings.push("ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED is not true (expected until launch)");
  }

  if (!isVerifiedAnswerAssistantAllowlistConfigured()) {
    blockers.push("ANSWER_ASSISTANT_VERIFIED_ALLOWLIST is empty — cannot start beta");
  }

  if (
    isAnswerAssistantVerifiedBetaEnabled() &&
    !isVerifiedAnswerAssistantAllowlistConfigured()
  ) {
    blockers.push("Beta gate must not be ON without allowlist (PR-99-B policy)");
  }

  return {
    ready: blockers.length === 0 && isVerifiedAnswerAssistantAllowlistBetaOperational(),
    blockers,
    warnings,
  };
}
