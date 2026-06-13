-- CreateEnum
CREATE TYPE "ClaimDocumentGovernanceReviewStatus" AS ENUM ('verified', 'needs_review', 'outdated', 'hidden', 'unknown');

-- CreateTable
CREATE TABLE "ClaimDocumentGovernance" (
    "id" TEXT NOT NULL,
    "documentKey" TEXT NOT NULL,
    "insurerId" TEXT,
    "insurerName" TEXT NOT NULL,
    "documentTitle" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "officialSourceUrl" TEXT,
    "officialSourceLabel" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "nextReviewDueAt" TIMESTAMP(3),
    "reviewStatus" "ClaimDocumentGovernanceReviewStatus" NOT NULL DEFAULT 'unknown',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isDownloadEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cautionText" TEXT,
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ClaimDocumentGovernance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimDocumentGovernanceAuditLog" (
    "id" TEXT NOT NULL,
    "governanceId" TEXT NOT NULL,
    "documentKey" TEXT NOT NULL,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldName" TEXT NOT NULL,
    "previousValue" TEXT,
    "nextValue" TEXT,
    "changeReason" TEXT,

    CONSTRAINT "ClaimDocumentGovernanceAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimDocumentGovernance_documentKey_key" ON "ClaimDocumentGovernance"("documentKey");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernance_insurerId_idx" ON "ClaimDocumentGovernance"("insurerId");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernance_reviewStatus_idx" ON "ClaimDocumentGovernance"("reviewStatus");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernance_isVisible_idx" ON "ClaimDocumentGovernance"("isVisible");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernance_updatedAt_idx" ON "ClaimDocumentGovernance"("updatedAt");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernanceAuditLog_governanceId_idx" ON "ClaimDocumentGovernanceAuditLog"("governanceId");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernanceAuditLog_documentKey_idx" ON "ClaimDocumentGovernanceAuditLog"("documentKey");

-- CreateIndex
CREATE INDEX "ClaimDocumentGovernanceAuditLog_changedAt_idx" ON "ClaimDocumentGovernanceAuditLog"("changedAt");

-- AddForeignKey
ALTER TABLE "ClaimDocumentGovernanceAuditLog" ADD CONSTRAINT "ClaimDocumentGovernanceAuditLog_governanceId_fkey" FOREIGN KEY ("governanceId") REFERENCES "ClaimDocumentGovernance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
