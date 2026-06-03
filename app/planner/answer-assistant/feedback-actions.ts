"use server";

import { isVerifiedAnswerAssistantAllowlistBetaOperational } from "@/lib/answer-assistant/allowlist-beta";
import { persistBetaSafetyFeedback } from "@/lib/answer-assistant/beta-feedback-persist";
import {
  BETA_FEEDBACK_ERROR_MESSAGES,
  validateBetaFeedbackSubmit,
} from "@/lib/answer-assistant/beta-feedback-validation";
import { getVerifiedAnswerAssistantAccess } from "@/lib/answer-assistant/verified-access";

export type SubmitBetaFeedbackResult =
  | { ok: true; feedbackId: string }
  | { ok: false; message: string };

export async function submitAnswerAssistantBetaFeedbackAction(
  formData: FormData,
): Promise<SubmitBetaFeedbackResult> {
  const access = await getVerifiedAnswerAssistantAccess();

  if (
    access.status !== "authenticated" ||
    !access.canGenerate ||
    access.isAdminTester
  ) {
    return { ok: false, message: "beta 피드백은 allowlist 파일럿 사용자만 제출할 수 있습니다." };
  }

  if (!isVerifiedAnswerAssistantAllowlistBetaOperational()) {
    return { ok: false, message: "현재 beta 운영이 활성화되어 있지 않습니다." };
  }

  const validation = validateBetaFeedbackSubmit({
    feedbackType: String(formData.get("feedbackType") ?? ""),
    safetySignal: String(formData.get("safetySignal") ?? ""),
    severity: String(formData.get("severity") ?? ""),
    usefulness: String(formData.get("usefulness") ?? ""),
    noteCategory: String(formData.get("noteCategory") ?? ""),
    shortNote: String(formData.get("shortNote") ?? ""),
    usageAuditId: String(formData.get("usageAuditId") ?? ""),
  });

  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      message:
        validation.message ?? BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
    };
  }

  return persistBetaSafetyFeedback(access.userId, validation.data);
}
