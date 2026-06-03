-- CreateEnum
CREATE TYPE "AnswerAssistantUsageAudience" AS ENUM ('admin', 'verified_planner');

-- CreateEnum
CREATE TYPE "AnswerAssistantUsageOutcome" AS ENUM ('success', 'blocked');

-- CreateTable
CREATE TABLE "AnswerAssistantRateLimitState" (
    "userId" TEXT NOT NULL,
    "minuteWindowStart" TIMESTAMP(3) NOT NULL,
    "minuteCount" INTEGER NOT NULL DEFAULT 0,
    "dayWindowStart" TIMESTAMP(3) NOT NULL,
    "dayCount" INTEGER NOT NULL DEFAULT 0,
    "abuseWindowStart" TIMESTAMP(3) NOT NULL,
    "blockedCountToday" INTEGER NOT NULL DEFAULT 0,
    "promptInjectionCountToday" INTEGER NOT NULL DEFAULT 0,
    "providerErrorCountToday" INTEGER NOT NULL DEFAULT 0,
    "cooldownUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerAssistantRateLimitState_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AnswerAssistantUsageAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audience" "AnswerAssistantUsageAudience" NOT NULL,
    "outcome" "AnswerAssistantUsageOutcome" NOT NULL,
    "requestPurpose" TEXT,
    "blockedReason" TEXT,
    "candidateCount" INTEGER,
    "evidenceSourceIds" JSONB,
    "outputSafetyBlocked" BOOLEAN NOT NULL DEFAULT false,
    "providerConfigured" BOOLEAN,
    "providerErrorCode" TEXT,
    "rateLimitBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isAdminTester" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerAssistantUsageAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnswerAssistantUsageAudit_userId_createdAt_idx" ON "AnswerAssistantUsageAudit"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnswerAssistantUsageAudit_createdAt_idx" ON "AnswerAssistantUsageAudit"("createdAt");

-- CreateIndex
CREATE INDEX "AnswerAssistantUsageAudit_outcome_createdAt_idx" ON "AnswerAssistantUsageAudit"("outcome", "createdAt");

-- CreateIndex
CREATE INDEX "AnswerAssistantUsageAudit_blockedReason_idx" ON "AnswerAssistantUsageAudit"("blockedReason");

-- AddForeignKey
ALTER TABLE "AnswerAssistantRateLimitState" ADD CONSTRAINT "AnswerAssistantRateLimitState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerAssistantUsageAudit" ADD CONSTRAINT "AnswerAssistantUsageAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
