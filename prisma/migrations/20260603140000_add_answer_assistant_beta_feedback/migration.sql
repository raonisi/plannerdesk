-- CreateEnum
CREATE TYPE "AnswerAssistantFeedbackType" AS ENUM ('post_session', 'blocked_experience', 'safety_concern', 'ui_understanding', 'other_signal');

-- CreateEnum
CREATE TYPE "AnswerAssistantSafetySignal" AS ENUM ('blocking_felt_wrong', 'evidence_too_weak', 'output_too_assertive', 'missing_disclaimer', 'prompt_injection_risk', 'privacy_risk', 'none');

-- CreateEnum
CREATE TYPE "AnswerAssistantFeedbackSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "AnswerAssistantFeedbackUsefulness" AS ENUM ('not_useful', 'partial', 'helpful', 'not_applicable');

-- CreateEnum
CREATE TYPE "AnswerAssistantFeedbackNoteCategory" AS ENUM ('blocking', 'evidence', 'output_safety', 'ui_copy', 'rate_limit', 'other');

-- CreateEnum
CREATE TYPE "AnswerAssistantFeedbackReviewStatus" AS ENUM ('new', 'triaged', 'incident_candidate', 'dismissed', 'resolved');

-- CreateTable
CREATE TABLE "AnswerAssistantBetaFeedback" (
    "id" TEXT NOT NULL,
    "usageAuditId" TEXT,
    "userId" TEXT,
    "feedbackType" "AnswerAssistantFeedbackType" NOT NULL,
    "safetySignal" "AnswerAssistantSafetySignal",
    "severity" "AnswerAssistantFeedbackSeverity" NOT NULL DEFAULT 'low',
    "usefulness" "AnswerAssistantFeedbackUsefulness",
    "noteCategory" "AnswerAssistantFeedbackNoteCategory",
    "shortNote" VARCHAR(120),
    "adminStatus" "AnswerAssistantFeedbackReviewStatus" NOT NULL DEFAULT 'new',
    "adminMemo" VARCHAR(500),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnswerAssistantBetaFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_usageAuditId_idx" ON "AnswerAssistantBetaFeedback"("usageAuditId");

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_userId_idx" ON "AnswerAssistantBetaFeedback"("userId");

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_feedbackType_idx" ON "AnswerAssistantBetaFeedback"("feedbackType");

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_safetySignal_idx" ON "AnswerAssistantBetaFeedback"("safetySignal");

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_severity_idx" ON "AnswerAssistantBetaFeedback"("severity");

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_adminStatus_idx" ON "AnswerAssistantBetaFeedback"("adminStatus");

-- CreateIndex
CREATE INDEX "AnswerAssistantBetaFeedback_createdAt_idx" ON "AnswerAssistantBetaFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "AnswerAssistantBetaFeedback" ADD CONSTRAINT "AnswerAssistantBetaFeedback_usageAuditId_fkey" FOREIGN KEY ("usageAuditId") REFERENCES "AnswerAssistantUsageAudit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerAssistantBetaFeedback" ADD CONSTRAINT "AnswerAssistantBetaFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerAssistantBetaFeedback" ADD CONSTRAINT "AnswerAssistantBetaFeedback_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
