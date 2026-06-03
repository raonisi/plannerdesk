// Verified answer assistant release readiness checks (PR-98 / PR-99-A).

import { isVerifiedAnswerAssistantAllowlistConfigured } from "./allowlist";
import { isAnswerAssistantVerifiedPreviewEnabled } from "./feature-gate";
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

  if (isAnswerAssistantVerifiedPreviewEnabled()) {
    warnings.push(
      "ANSWER_ASSISTANT_VERIFIED_PREVIEW is true — verify allowlist and operator sign-off",
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
