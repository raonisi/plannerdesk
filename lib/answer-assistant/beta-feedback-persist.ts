// Persist structured beta safety feedback (PR-101).

import { prisma } from "@/lib/prisma";
import type { BetaFeedbackValidatedPayload } from "./beta-feedback-validation";
import { BETA_FEEDBACK_MAX_PER_USER_PER_DAY } from "./beta-feedback-constants";

export async function countBetaFeedbackTodayForUser(
  userId: string,
): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return prisma.answerAssistantBetaFeedback.count({
    where: { userId, createdAt: { gte: start } },
  });
}

export async function persistBetaSafetyFeedback(
  userId: string,
  payload: BetaFeedbackValidatedPayload,
): Promise<{ ok: true; feedbackId: string } | { ok: false; message: string }> {
  const todayCount = await countBetaFeedbackTodayForUser(userId);
  if (todayCount >= BETA_FEEDBACK_MAX_PER_USER_PER_DAY) {
    return {
      ok: false,
      message: "오늘 제출 가능한 beta 피드백 한도에 도달했습니다.",
    };
  }

  if (payload.usageAuditId) {
    const audit = await prisma.answerAssistantUsageAudit.findFirst({
      where: { id: payload.usageAuditId, userId },
      select: { id: true },
    });
    if (!audit) {
      return {
        ok: false,
        message: "연결할 usage audit을 확인할 수 없습니다.",
      };
    }
  }

  const row = await prisma.answerAssistantBetaFeedback.create({
    data: {
      userId,
      usageAuditId: payload.usageAuditId,
      feedbackType: payload.feedbackType,
      safetySignal: payload.safetySignal,
      severity: payload.severity,
      usefulness: payload.usefulness,
      noteCategory: payload.noteCategory,
      shortNote: payload.shortNote,
    },
    select: { id: true },
  });

  return { ok: true, feedbackId: row.id };
}
