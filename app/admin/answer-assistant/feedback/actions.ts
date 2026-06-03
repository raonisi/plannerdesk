"use server";

import type { AnswerAssistantFeedbackReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/auth/access";
import { BETA_FEEDBACK_ADMIN_MEMO_MAX_LENGTH } from "@/lib/answer-assistant/beta-feedback-constants";
import { prisma } from "@/lib/prisma";

const REVIEW_STATUSES = new Set<string>([
  "new",
  "triaged",
  "incident_candidate",
  "dismissed",
  "resolved",
]);

export type UpdateBetaFeedbackReviewResult =
  | { ok: true }
  | { ok: false; message: string };

/** Manual operator review only — no auto-sanction or allowlist changes. */
export async function updateBetaFeedbackReviewStatusAction(
  formData: FormData,
): Promise<void> {
  const result = await updateBetaFeedbackReviewStatus(formData);
  if (!result.ok) {
    throw new Error(result.message);
  }
}

export async function updateBetaFeedbackReviewStatus(
  formData: FormData,
): Promise<UpdateBetaFeedbackReviewResult> {
  const session = await requireAdminAccess();
  const reviewerId = session.user?.id;
  if (!reviewerId) {
    return { ok: false, message: "관리자 세션을 확인할 수 없습니다." };
  }

  const feedbackId = String(formData.get("feedbackId") ?? "").trim();
  const adminStatus = String(formData.get("adminStatus") ?? "").trim();
  const adminMemoRaw = String(formData.get("adminMemo") ?? "").trim();

  if (!feedbackId) {
    return { ok: false, message: "피드백 ID가 필요합니다." };
  }

  if (!REVIEW_STATUSES.has(adminStatus)) {
    return { ok: false, message: "검토 상태를 확인해 주세요." };
  }

  if (adminMemoRaw.length > BETA_FEEDBACK_ADMIN_MEMO_MAX_LENGTH) {
    return {
      ok: false,
      message: `관리자 메모는 ${BETA_FEEDBACK_ADMIN_MEMO_MAX_LENGTH}자 이하입니다.`,
    };
  }

  const existing = await prisma.answerAssistantBetaFeedback.findUnique({
    where: { id: feedbackId },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, message: "피드백을 찾을 수 없습니다." };
  }

  await prisma.answerAssistantBetaFeedback.update({
    where: { id: feedbackId },
    data: {
      adminStatus: adminStatus as AnswerAssistantFeedbackReviewStatus,
      adminMemo: adminMemoRaw || null,
      reviewedAt: new Date(),
      reviewedById: reviewerId,
    },
  });

  revalidatePath("/admin/answer-assistant/feedback");
  return { ok: true };
}

