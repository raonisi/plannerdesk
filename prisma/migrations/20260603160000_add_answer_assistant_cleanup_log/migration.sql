-- CreateTable
CREATE TABLE "AnswerAssistantCleanupLog" (
    "id" TEXT NOT NULL,
    "executedById" TEXT,
    "mode" TEXT NOT NULL,
    "rateLimitDeleted" INTEGER NOT NULL DEFAULT 0,
    "usageAuditDeleted" INTEGER NOT NULL DEFAULT 0,
    "feedbackDeleted" INTEGER NOT NULL DEFAULT 0,
    "cleanupLogDeleted" INTEGER NOT NULL DEFAULT 0,
    "previewRateLimitEligible" INTEGER,
    "previewUsageAuditEligible" INTEGER,
    "previewFeedbackEligible" INTEGER,
    "previewCleanupLogEligible" INTEGER,
    "retentionConfigJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerAssistantCleanupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnswerAssistantCleanupLog_createdAt_idx" ON "AnswerAssistantCleanupLog"("createdAt");

-- CreateIndex
CREATE INDEX "AnswerAssistantCleanupLog_mode_createdAt_idx" ON "AnswerAssistantCleanupLog"("mode", "createdAt");

-- AddForeignKey
ALTER TABLE "AnswerAssistantCleanupLog" ADD CONSTRAINT "AnswerAssistantCleanupLog_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
