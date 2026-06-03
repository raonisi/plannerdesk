"use server";

import { requireAdminAccess } from "@/lib/auth/access";
import { generateInternalAnswerDraft } from "@/lib/answer-assistant/generate-draft";
import {
  parseAnswerAssistantFormData,
} from "@/lib/answer-assistant/validation";
import type { AnswerAssistantDraftResult } from "@/lib/answer-assistant/types";

export async function generateAnswerAssistantDraftAction(
  formData: FormData,
): Promise<AnswerAssistantDraftResult> {
  try {
    await requireAdminAccess();
  } catch {
    return {
      ok: false,
      blockedReason: "VALIDATION",
      message: "관리자 권한이 필요합니다.",
      evidence: [],
      warnings: [],
      candidateCount: 0,
      safetyGatePassed: false,
      retrievalCompleted: false,
    };
  }

  const input = parseAnswerAssistantFormData(formData);
  return generateInternalAnswerDraft(input);
}
