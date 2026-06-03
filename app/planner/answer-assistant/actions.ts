"use server";

import { generateInternalAnswerDraft } from "@/lib/answer-assistant/generate-draft";
import {
  VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES,
  VERIFIED_ANSWER_ASSIST_PAGE_NOTICES,
} from "@/lib/answer-assistant/constants";
import { isAnswerAssistantVerifiedPreviewEnabled } from "@/lib/answer-assistant/feature-gate";
import {
  checkVerifiedAnswerAssistantRateLimit,
  consumeVerifiedAnswerAssistantRateLimit,
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
  outcome: "success" | "blocked",
  result: AnswerAssistantDraftResult,
  extra?: {
    rateLimitHit?: boolean;
    isAdminTester?: boolean;
  },
): void {
  logAnswerAssistantUsage({
    timestamp: new Date().toISOString(),
    userId,
    audience: "verified_planner",
    outcome,
    blockedReason: result.ok ? undefined : result.blockedReason,
    candidateCount: result.candidateCount,
    evidenceSourceIds: buildEvidenceSourceIds(result.evidence),
    providerErrorCode:
      !result.ok && result.blockedReason === "PROVIDER_NOT_CONFIGURED"
        ? "PROVIDER_NOT_CONFIGURED"
        : !result.ok && result.blockedReason === "PROVIDER_ERROR"
          ? "PROVIDER_ERROR"
          : undefined,
    rateLimitHit: extra?.rateLimitHit,
    isAdminTester: extra?.isAdminTester,
  });
}

export async function generateVerifiedAnswerAssistantDraftAction(
  formData: FormData,
): Promise<AnswerAssistantDraftResult> {
  const access = await getVerifiedAnswerAssistantAccess();

  if (access.status === "locked") {
    return blockedResult(
      "UNAUTHORIZED",
      "로그인이 필요합니다.",
    );
  }

  if (access.status === "denied") {
    const result = blockedResult("UNAUTHORIZED", access.denyReason);
    return result;
  }

  if (
    !isAnswerAssistantVerifiedPreviewEnabled() ||
    access.status === "feature_disabled" ||
    !access.canGenerate
  ) {
    const result = blockedResult(
      "FEATURE_DISABLED",
      VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.FEATURE_DISABLED,
    );
    logVerifiedUsage(access.userId, "blocked", result);
    return result;
  }

  const rateLimit = checkVerifiedAnswerAssistantRateLimit(access.userId);
  if (!rateLimit.allowed) {
    const message =
      rateLimit.reason === "minute"
        ? VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.RATE_LIMIT_MINUTE(
            rateLimit.retryAfterSeconds,
          )
        : VERIFIED_ANSWER_ASSIST_BLOCKED_MESSAGES.RATE_LIMIT_DAY(
            rateLimit.retryAfterSeconds,
          );
    const result = blockedResult("RATE_LIMIT_EXCEEDED", message);
    logVerifiedUsage(access.userId, "blocked", result, { rateLimitHit: true });
    return result;
  }

  consumeVerifiedAnswerAssistantRateLimit(access.userId);

  const input = parseAnswerAssistantFormData(formData);
  const result = await generateInternalAnswerDraft(input, {
    audience: "verified_planner",
  });

  logVerifiedUsage(access.userId, result.ok ? "success" : "blocked", result, {
    isAdminTester: access.isAdminTester,
  });

  return result;
}

export async function getVerifiedAnswerAssistantPreviewNotice(): Promise<string> {
  if (isAnswerAssistantVerifiedPreviewEnabled()) {
    return "";
  }
  return VERIFIED_ANSWER_ASSIST_PAGE_NOTICES.previewDisabled;
}
