"use server";

import { generateInternalAnswerDraft } from "@/lib/answer-assistant/generate-draft";
import { isAnswerDraftProviderConfigured } from "@/lib/answer-assistant/provider";
import {
  VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES,
  VERIFIED_ANSWER_ASSIST_PAGE_NOTICES,
} from "@/lib/answer-assistant/constants";
import { isAnswerAssistantVerifiedPreviewEnabled } from "@/lib/answer-assistant/feature-gate";
import {
  checkVerifiedAnswerAssistantRateLimit,
  consumeVerifiedAnswerAssistantRateLimit,
  recordVerifiedAnswerAssistantBlockedAttempt,
} from "@/lib/answer-assistant/rate-limit";
import {
  buildEvidenceSourceIds,
  logAnswerAssistantUsage,
} from "@/lib/answer-assistant/usage-log";
import { parseAnswerAssistantFormData } from "@/lib/answer-assistant/validation";
import { getVerifiedAnswerAssistantAccess } from "@/lib/answer-assistant/verified-access";
import type {
  AnswerAssistantBlockedReason,
  AnswerAssistantDraftResult,
  AnswerAssistantInput,
} from "@/lib/answer-assistant/types";

function blockedResult(
  blockedReason: AnswerAssistantBlockedReason,
  message: string,
): AnswerAssistantDraftResult {
  return {
    ok: false,
    blockedReason,
    message,
    evidence: [],
    warnings: [],
    candidateCount: 0,
    safetyGatePassed: false,
    retrievalCompleted: false,
  };
}

function logVerifiedUsage(
  userId: string,
  input: AnswerAssistantInput,
  outcome: "success" | "blocked",
  result: AnswerAssistantDraftResult,
  extra?: {
    rateLimitBlocked?: boolean;
    isAdminTester?: boolean;
  },
): void {
  logAnswerAssistantUsage({
    timestamp: new Date().toISOString(),
    userId,
    audience: "verified_planner",
    outcome,
    requestPurpose: input.purpose,
    blockedReason: result.ok ? undefined : result.blockedReason,
    candidateCount: result.candidateCount,
    evidenceSourceIds: buildEvidenceSourceIds(result.evidence),
    outputSafetyBlocked:
      !result.ok && result.blockedReason === "OUTPUT_SAFETY_BLOCKED",
    providerConfigured: isAnswerDraftProviderConfigured(),
    providerErrorCode:
      !result.ok && result.blockedReason === "PROVIDER_NOT_CONFIGURED"
        ? "PROVIDER_NOT_CONFIGURED"
        : !result.ok && result.blockedReason === "PROVIDER_ERROR"
          ? "PROVIDER_ERROR"
          : undefined,
    rateLimitBlocked: extra?.rateLimitBlocked,
    isAdminTester: extra?.isAdminTester,
  });
}

export async function generateVerifiedAnswerAssistantDraftAction(
  formData: FormData,
): Promise<AnswerAssistantDraftResult> {
  // 1. Login + role + verification + allowlist (via access resolver)
  const access = await getVerifiedAnswerAssistantAccess();

  if (access.status === "locked") {
    return blockedResult("UNAUTHORIZED", "로그인이 필요합니다.");
  }

  if (access.status === "denied") {
    return blockedResult("UNAUTHORIZED", access.denyReason);
  }

  // 2. Feature gate
  if (
    !isAnswerAssistantVerifiedPreviewEnabled() ||
    access.status === "feature_disabled"
  ) {
    const userId =
      access.status === "feature_disabled" ? access.userId : "unknown";
    const result = blockedResult(
      "FEATURE_DISABLED",
      VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.FEATURE_DISABLED,
    );
    if (access.status === "feature_disabled") {
      logVerifiedUsage(userId, parseAnswerAssistantFormData(formData), "blocked", result);
    }
    return result;
  }

  // 3. Allowlist (verified planners only — admin tester bypasses in access)
  if (access.status === "not_allowlisted") {
    const result = blockedResult(
      "NOT_ALLOWLISTED",
      VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.NOT_ALLOWLISTED,
    );
    logVerifiedUsage(
      access.userId,
      parseAnswerAssistantFormData(formData),
      "blocked",
      result,
    );
    return result;
  }

  if (access.status !== "authenticated" || !access.canGenerate) {
    return blockedResult(
      "UNAUTHORIZED",
      VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.UNAUTHORIZED,
    );
  }

  const input = parseAnswerAssistantFormData(formData);

  // 6. Rate limit (before Safety Gate / provider)
  const rateLimit = checkVerifiedAnswerAssistantRateLimit(access.userId);
  if (!rateLimit.allowed) {
    const message =
      rateLimit.reason === "minute"
        ? VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.RATE_LIMIT_MINUTE(
            rateLimit.retryAfterSeconds,
          )
        : rateLimit.reason === "day"
          ? VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.RATE_LIMIT_DAY(
              rateLimit.retryAfterSeconds,
            )
          : VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.RATE_LIMIT_ABUSE(
              rateLimit.retryAfterSeconds,
            );
    const result = blockedResult("RATE_LIMIT_EXCEEDED", message);
    logVerifiedUsage(access.userId, input, "blocked", result, {
      rateLimitBlocked: true,
    });
    return result;
  }

  consumeVerifiedAnswerAssistantRateLimit(access.userId);

  // 7–12. Safety Gate, Retrieval, provider, Output Safety (generateInternalAnswerDraft)
  const result = await generateInternalAnswerDraft(input, {
    audience: "verified_planner",
  });

  if (
    !result.ok &&
    result.safetyGatePassed === false &&
    result.blockedReason
  ) {
    recordVerifiedAnswerAssistantBlockedAttempt(
      access.userId,
      result.blockedReason,
    );
  }

  logVerifiedUsage(
    access.userId,
    input,
    result.ok ? "success" : "blocked",
    result,
    { isAdminTester: access.isAdminTester },
  );

  return result;
}

export async function getVerifiedAnswerAssistantPreviewNotice(): Promise<string> {
  if (isAnswerAssistantVerifiedPreviewEnabled()) {
    return "";
  }
  return VERIFIED_ANSWER_ASSIST_PAGE_NOTICES.previewDisabled;
}
