// Verified answer assistant release readiness checks (PR-98 / PR-99-A / PR-99-B).

import {
  evaluateAllowlistBetaLaunchReadiness,
  isVerifiedAnswerAssistantAllowlistBetaOperational,
} from "./allowlist-beta";
import { isVerifiedAnswerAssistantAllowlistConfigured } from "./allowlist";
import {
  isAnswerAssistantVerifiedBetaEnabled,
  isAnswerAssistantVerifiedGateEnvEnabled,
} from "./feature-gate";
import {
  getAnswerAssistantRateLimitBackend,
  getAnswerAssistantUsageAuditBackend,
} from "./rate-limit-config";

export function isVerifiedAnswerAssistantRateLimitDurable(): boolean {
  return getAnswerAssistantRateLimitBackend() === "durable";
}

export function isVerifiedAnswerAssistantUsageAuditPersistent(): boolean {
  return getAnswerAssistantUsageAuditBackend() === "durable";
}

export type VerifiedAnswerAssistantReleaseVerdict =
  | "no_go"
  | "allowlist_pilot_only"
  | "ready_for_allowlist_activation";

export function evaluateVerifiedAnswerAssistantReleaseReadiness(): {
  verdict: VerifiedAnswerAssistantReleaseVerdict;
  blockers: string[];
  warnings: string[];
} {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!isVerifiedAnswerAssistantRateLimitDurable()) {
    blockers.push(
      "persistent rate limit store absent (memory backend — production full release No-Go)",
    );
  }

  if (!isVerifiedAnswerAssistantUsageAuditPersistent()) {
    warnings.push(
      "persistent usage audit absent (memory backend — allowlist pilot only)",
    );
  }

  if (!isVerifiedAnswerAssistantAllowlistConfigured()) {
    warnings.push(
      "ANSWER_ASSISTANT_VERIFIED_ALLOWLIST unset or empty — no verified planner can generate",
    );
  }

  if (isAnswerAssistantVerifiedGateEnvEnabled()) {
    warnings.push(
      "Verified answer assistant gate env is ON — confirm allowlist beta operator checklist",
    );
  }

  if (
    isAnswerAssistantVerifiedBetaEnabled() &&
    !isVerifiedAnswerAssistantAllowlistConfigured()
  ) {
    blockers.push(
      "ANSWER_ASSISTANT_VERIFIED_BETA_ENABLED=true without allowlist — beta must not run",
    );
  }

  const betaLaunch = evaluateAllowlistBetaLaunchReadiness();
  for (const blocker of betaLaunch.blockers) {
    if (!blockers.includes(blocker)) {
      blockers.push(blocker);
    }
  }

  if (isVerifiedAnswerAssistantAllowlistBetaOperational()) {
    warnings.push(
      "Allowlist beta is operational — monitor rate limits, usage audit, and rollback path",
    );
  }

  let verdict: VerifiedAnswerAssistantReleaseVerdict = "no_go";
  if (blockers.length === 0 && warnings.length > 0) {
    verdict = "allowlist_pilot_only";
  } else if (blockers.length === 0 && warnings.length === 0) {
    verdict = "ready_for_allowlist_activation";
  }

  return { verdict, blockers, warnings };
}
