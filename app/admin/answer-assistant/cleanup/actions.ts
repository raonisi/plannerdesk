"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/auth/access";
import { ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE } from "@/lib/answer-assistant/retention-config";
import {
  executeAnswerAssistantRetentionCleanup,
  logRetentionCleanupDryRun,
  previewAnswerAssistantRetentionCleanup,
  type RetentionCleanupTargetCounts,
} from "@/lib/answer-assistant/retention-cleanup";

export async function refreshRetentionCleanupPreviewAction(): Promise<void> {
  const session = await requireAdminAccess();
  const userId = session.user?.id;
  if (!userId) return;

  const preview = await previewAnswerAssistantRetentionCleanup();
  await logRetentionCleanupDryRun(preview, userId);
  revalidatePath("/admin/answer-assistant/cleanup");
  revalidatePath("/admin/answer-assistant/audit");
  revalidatePath("/admin/answer-assistant/feedback");
}

export async function executeRetentionCleanupAction(
  formData: FormData,
): Promise<void> {
  const session = await requireAdminAccess();
  const userId = session.user?.id;
  if (!userId) {
    throw new Error("관리자 세션을 확인할 수 없습니다.");
  }

  const confirm = String(formData.get("confirm") ?? "").trim();
  if (confirm !== ANSWER_ASSISTANT_CLEANUP_CONFIRM_PHRASE) {
    throw new Error("확인 문구가 일치하지 않습니다.");
  }

  const expected: RetentionCleanupTargetCounts = {
    rateLimitState: parseIntOrZero(formData.get("rateLimitState")),
    usageAudit: parseIntOrZero(formData.get("usageAudit")),
    feedbackStandard: parseIntOrZero(formData.get("feedbackStandard")),
    feedbackCritical: parseIntOrZero(formData.get("feedbackCritical")),
    cleanupLog: parseIntOrZero(formData.get("cleanupLog")),
  };

  const result = await executeAnswerAssistantRetentionCleanup(
    expected,
    userId,
  );
  if (!result.ok) {
    throw new Error(result.message);
  }

  revalidatePath("/admin/answer-assistant/cleanup");
  revalidatePath("/admin/answer-assistant/audit");
  revalidatePath("/admin/answer-assistant/feedback");
}

function parseIntOrZero(value: FormDataEntryValue | null): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
