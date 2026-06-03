// Durable usage audit persistence (PR-99-A).

import { prisma } from "@/lib/prisma";
import type { AnswerAssistantUsageLogEntry } from "./usage-log";

export async function persistAnswerAssistantUsageAudit(
  entry: AnswerAssistantUsageLogEntry,
): Promise<void> {
  await prisma.answerAssistantUsageAudit.create({
    data: {
      userId: entry.userId,
      audience: entry.audience,
      outcome: entry.outcome,
      requestPurpose: entry.requestPurpose ?? null,
      blockedReason: entry.blockedReason ?? null,
      candidateCount: entry.candidateCount ?? null,
      evidenceSourceIds: entry.evidenceSourceIds ?? undefined,
      outputSafetyBlocked: entry.outputSafetyBlocked ?? false,
      providerConfigured: entry.providerConfigured ?? null,
      providerErrorCode: entry.providerErrorCode ?? null,
      rateLimitBlocked: entry.rateLimitBlocked ?? false,
      isAdminTester: entry.isAdminTester ?? false,
      createdAt: new Date(entry.timestamp),
    },
  });
}

/** Test helper — removes audit rows for a user. */
export async function deleteAnswerAssistantUsageAuditsForUser(
  userId: string,
): Promise<void> {
  await prisma.answerAssistantUsageAudit.deleteMany({ where: { userId } });
}
