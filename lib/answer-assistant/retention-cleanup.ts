// Retention cleanup preview and execute (PR-102). ADMIN-only execute; dry-run first.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getAnswerAssistantRateLimitBackend,
  getAnswerAssistantUsageAuditBackend,
} from "./rate-limit-config";
import {
  getAnswerAssistantRetentionConfig,
  subtractRetentionDays,
  type AnswerAssistantRetentionConfig,
} from "./retention-config";

export type RetentionCleanupTargetCounts = {
  rateLimitState: number;
  usageAudit: number;
  feedbackStandard: number;
  feedbackCritical: number;
  cleanupLog: number;
};

export type RetentionCleanupPreview = {
  config: AnswerAssistantRetentionConfig;
  cutoffs: {
    rateLimitStateBefore: string;
    usageAuditBefore: string;
    feedbackStandardBefore: string;
    feedbackCriticalBefore: string;
    cleanupLogBefore: string;
  };
  eligible: RetentionCleanupTargetCounts;
  totals: {
    rateLimitState: number;
    usageAudit: number;
    feedback: number;
    cleanupLog: number;
  };
  backends: {
    rateLimit: "memory" | "durable";
    usageAudit: "memory" | "durable";
  };
  warnings: string[];
};

function standardFeedbackWhere(
  cutoff: Date,
): Prisma.AnswerAssistantBetaFeedbackWhereInput {
  return {
    createdAt: { lt: cutoff },
    adminStatus: { not: "incident_candidate" },
    severity: { not: "high" },
  };
}

function criticalFeedbackWhere(
  cutoff: Date,
): Prisma.AnswerAssistantBetaFeedbackWhereInput {
  return {
    createdAt: { lt: cutoff },
    OR: [{ adminStatus: "incident_candidate" }, { severity: "high" }],
  };
}

function rateLimitStateWhere(
  cutoff: Date,
): Prisma.AnswerAssistantRateLimitStateWhereInput {
  return {
    updatedAt: { lt: cutoff },
    OR: [{ cooldownUntil: null }, { cooldownUntil: { lt: new Date() } }],
  };
}

export async function previewAnswerAssistantRetentionCleanup(): Promise<RetentionCleanupPreview> {
  const config = getAnswerAssistantRetentionConfig();
  const now = new Date();
  const rateLimitCutoff = subtractRetentionDays(config.rateLimitStateDays, now);
  const auditCutoff = subtractRetentionDays(config.usageAuditDays, now);
  const feedbackCutoff = subtractRetentionDays(config.feedbackDays, now);
  const feedbackCriticalCutoff = subtractRetentionDays(
    config.feedbackCriticalDays,
    now,
  );
  const cleanupLogCutoff = subtractRetentionDays(config.cleanupLogDays, now);

  const warnings: string[] = [];
  if (getAnswerAssistantUsageAuditBackend() === "memory") {
    warnings.push(
      "Usage audit backend is memory — durable DB rows may be empty; cleanup applies to Prisma tables only.",
    );
  }
  if (getAnswerAssistantRateLimitBackend() === "memory") {
    warnings.push(
      "Rate limit backend is memory — AnswerAssistantRateLimitState cleanup affects durable rows only.",
    );
  }
  if (!config.cleanupExecuteEnabled) {
    warnings.push(
      "ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED is not true — execute is disabled (preview only).",
    );
  }

  const [
    rateLimitState,
    usageAudit,
    feedbackStandard,
    feedbackCritical,
    cleanupLog,
    totalRateLimit,
    totalAudit,
    totalFeedback,
    totalCleanupLog,
  ] = await Promise.all([
    prisma.answerAssistantRateLimitState.count({
      where: rateLimitStateWhere(rateLimitCutoff),
    }),
    prisma.answerAssistantUsageAudit.count({
      where: { createdAt: { lt: auditCutoff } },
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: standardFeedbackWhere(feedbackCutoff),
    }),
    prisma.answerAssistantBetaFeedback.count({
      where: criticalFeedbackWhere(feedbackCriticalCutoff),
    }),
    prisma.answerAssistantCleanupLog.count({
      where: { createdAt: { lt: cleanupLogCutoff } },
    }),
    prisma.answerAssistantRateLimitState.count(),
    prisma.answerAssistantUsageAudit.count(),
    prisma.answerAssistantBetaFeedback.count(),
    prisma.answerAssistantCleanupLog.count(),
  ]);

  return {
    config,
    cutoffs: {
      rateLimitStateBefore: rateLimitCutoff.toISOString(),
      usageAuditBefore: auditCutoff.toISOString(),
      feedbackStandardBefore: feedbackCutoff.toISOString(),
      feedbackCriticalBefore: feedbackCriticalCutoff.toISOString(),
      cleanupLogBefore: cleanupLogCutoff.toISOString(),
    },
    eligible: {
      rateLimitState,
      usageAudit,
      feedbackStandard,
      feedbackCritical,
      cleanupLog,
    },
    totals: {
      rateLimitState: totalRateLimit,
      usageAudit: totalAudit,
      feedback: totalFeedback,
      cleanupLog: totalCleanupLog,
    },
    backends: {
      rateLimit: getAnswerAssistantRateLimitBackend(),
      usageAudit: getAnswerAssistantUsageAuditBackend(),
    },
    warnings,
  };
}

export function retentionCleanupCountsMatch(
  expected: RetentionCleanupTargetCounts,
  actual: RetentionCleanupTargetCounts,
): boolean {
  return (
    expected.rateLimitState === actual.rateLimitState &&
    expected.usageAudit === actual.usageAudit &&
    expected.feedbackStandard === actual.feedbackStandard &&
    expected.feedbackCritical === actual.feedbackCritical &&
    expected.cleanupLog === actual.cleanupLog
  );
}

export async function executeAnswerAssistantRetentionCleanup(
  expectedCounts: RetentionCleanupTargetCounts,
  executedById: string,
): Promise<
  | { ok: true; deleted: RetentionCleanupTargetCounts; logId: string }
  | { ok: false; message: string }
> {
  const config = getAnswerAssistantRetentionConfig();
  if (!config.cleanupExecuteEnabled) {
    return {
      ok: false,
      message:
        "Cleanup execute is disabled. Set ANSWER_ASSISTANT_CLEANUP_EXECUTE_ENABLED=true after operator sign-off.",
    };
  }

  const preview = await previewAnswerAssistantRetentionCleanup();
  if (!retentionCleanupCountsMatch(expectedCounts, preview.eligible)) {
    return {
      ok: false,
      message:
        "삭제 대상 건수가 변경되었습니다. preview를 다시 확인한 뒤 실행해 주세요.",
    };
  }

  const totalEligible =
    preview.eligible.rateLimitState +
    preview.eligible.usageAudit +
    preview.eligible.feedbackStandard +
    preview.eligible.feedbackCritical +
    preview.eligible.cleanupLog;

  if (totalEligible === 0) {
    return { ok: false, message: "삭제 대상이 없습니다." };
  }

  const now = new Date();
  const rateLimitCutoff = subtractRetentionDays(config.rateLimitStateDays, now);
  const auditCutoff = subtractRetentionDays(config.usageAuditDays, now);
  const feedbackCutoff = subtractRetentionDays(config.feedbackDays, now);
  const feedbackCriticalCutoff = subtractRetentionDays(
    config.feedbackCriticalDays,
    now,
  );
  const cleanupLogCutoff = subtractRetentionDays(config.cleanupLogDays, now);

  const deleted = await prisma.$transaction(async (tx) => {
    const feedbackStandard = await tx.answerAssistantBetaFeedback.deleteMany({
      where: standardFeedbackWhere(feedbackCutoff),
    });
    const feedbackCritical = await tx.answerAssistantBetaFeedback.deleteMany({
      where: criticalFeedbackWhere(feedbackCriticalCutoff),
    });
    const usageAudit = await tx.answerAssistantUsageAudit.deleteMany({
      where: { createdAt: { lt: auditCutoff } },
    });
    const rateLimitState = await tx.answerAssistantRateLimitState.deleteMany({
      where: rateLimitStateWhere(rateLimitCutoff),
    });
    const cleanupLog = await tx.answerAssistantCleanupLog.deleteMany({
      where: { createdAt: { lt: cleanupLogCutoff } },
    });

    const log = await tx.answerAssistantCleanupLog.create({
      data: {
        executedById,
        mode: "execute",
        rateLimitDeleted: rateLimitState.count,
        usageAuditDeleted: usageAudit.count,
        feedbackDeleted:
          feedbackStandard.count + feedbackCritical.count,
        cleanupLogDeleted: cleanupLog.count,
        retentionConfigJson: {
          rateLimitStateDays: config.rateLimitStateDays,
          usageAuditDays: config.usageAuditDays,
          feedbackDays: config.feedbackDays,
          feedbackCriticalDays: config.feedbackCriticalDays,
          cleanupLogDays: config.cleanupLogDays,
        },
      },
      select: { id: true },
    });

    return {
      rateLimitState: rateLimitState.count,
      usageAudit: usageAudit.count,
      feedbackStandard: feedbackStandard.count,
      feedbackCritical: feedbackCritical.count,
      cleanupLog: cleanupLog.count,
      logId: log.id,
    };
  });

  return {
    ok: true,
    deleted: {
      rateLimitState: deleted.rateLimitState,
      usageAudit: deleted.usageAudit,
      feedbackStandard: deleted.feedbackStandard,
      feedbackCritical: deleted.feedbackCritical,
      cleanupLog: deleted.cleanupLog,
    },
    logId: deleted.logId,
  };
}

export async function logRetentionCleanupDryRun(
  preview: RetentionCleanupPreview,
  executedById: string,
): Promise<string> {
  const row = await prisma.answerAssistantCleanupLog.create({
    data: {
      executedById,
      mode: "dry_run",
      rateLimitDeleted: 0,
      usageAuditDeleted: 0,
      feedbackDeleted: 0,
      cleanupLogDeleted: 0,
      previewRateLimitEligible: preview.eligible.rateLimitState,
      previewUsageAuditEligible: preview.eligible.usageAudit,
      previewFeedbackEligible:
        preview.eligible.feedbackStandard + preview.eligible.feedbackCritical,
      previewCleanupLogEligible: preview.eligible.cleanupLog,
      retentionConfigJson: {
        rateLimitStateDays: preview.config.rateLimitStateDays,
        usageAuditDays: preview.config.usageAuditDays,
        feedbackDays: preview.config.feedbackDays,
        feedbackCriticalDays: preview.config.feedbackCriticalDays,
        cleanupLogDays: preview.config.cleanupLogDays,
      },
    },
    select: { id: true },
  });
  return row.id;
}
