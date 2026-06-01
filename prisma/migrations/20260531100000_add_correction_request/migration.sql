-- CreateEnum
CREATE TYPE "CorrectionTargetType" AS ENUM (
  'insurer',
  'claim_document',
  'disclosure_link',
  'message_template',
  'knowledge_article',
  'general'
);

-- CreateEnum
CREATE TYPE "CorrectionRequestType" AS ENUM (
  'broken_link',
  'outdated_info',
  'typo',
  'wrong_category',
  'document_requirement_update',
  'disclosure_update',
  'message_template_feedback',
  'knowledge_article_feedback',
  'other'
);

-- CreateEnum
CREATE TYPE "CorrectionRequestStatus" AS ENUM (
  'new',
  'triaged',
  'needs_redaction',
  'accepted',
  'rejected',
  'applied',
  'archived',
  'deleted'
);

-- CreateEnum
CREATE TYPE "CorrectionRequestPriority" AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- CreateTable
CREATE TABLE "CorrectionRequest" (
    "id" TEXT NOT NULL,
    "targetType" "CorrectionTargetType" NOT NULL,
    "targetId" TEXT,
    "requestType" "CorrectionRequestType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "CorrectionRequestStatus" NOT NULL DEFAULT 'new',
    "priority" "CorrectionRequestPriority" NOT NULL DEFAULT 'normal',
    "containsSensitiveData" BOOLEAN NOT NULL DEFAULT false,
    "redactionRequired" BOOLEAN NOT NULL DEFAULT false,
    "redactedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "adminMemo" TEXT,
    "retentionUntil" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectionRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CorrectionRequest" ADD CONSTRAINT "CorrectionRequest_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CorrectionRequest_status_idx" ON "CorrectionRequest"("status");

-- CreateIndex
CREATE INDEX "CorrectionRequest_targetType_idx" ON "CorrectionRequest"("targetType");

-- CreateIndex
CREATE INDEX "CorrectionRequest_requestType_idx" ON "CorrectionRequest"("requestType");

-- CreateIndex
CREATE INDEX "CorrectionRequest_priority_idx" ON "CorrectionRequest"("priority");

-- CreateIndex
CREATE INDEX "CorrectionRequest_containsSensitiveData_idx" ON "CorrectionRequest"("containsSensitiveData");

-- CreateIndex
CREATE INDEX "CorrectionRequest_redactionRequired_idx" ON "CorrectionRequest"("redactionRequired");

-- CreateIndex
CREATE INDEX "CorrectionRequest_createdAt_idx" ON "CorrectionRequest"("createdAt");

-- CreateIndex
CREATE INDEX "CorrectionRequest_resolvedAt_idx" ON "CorrectionRequest"("resolvedAt");

-- CreateIndex
CREATE INDEX "CorrectionRequest_status_createdAt_idx" ON "CorrectionRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CorrectionRequest_targetType_createdAt_idx" ON "CorrectionRequest"("targetType", "createdAt");

-- CreateIndex
CREATE INDEX "CorrectionRequest_redactionRequired_createdAt_idx" ON "CorrectionRequest"("redactionRequired", "createdAt");
