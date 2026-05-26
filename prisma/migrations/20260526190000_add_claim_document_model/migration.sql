-- CreateEnum
CREATE TYPE "ClaimDocumentCategory" AS ENUM ('actual_expense', 'diagnosis', 'surgery', 'hospitalization', 'outpatient', 'fracture', 'driver', 'death', 'disability', 'other');

-- CreateTable
CREATE TABLE "ClaimDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ClaimDocumentCategory" NOT NULL,
    "insurerId" TEXT,
    "summary" TEXT,
    "requiredDocuments" TEXT,
    "optionalDocuments" TEXT,
    "claimFormUrl" TEXT,
    "officialSourceUrl" TEXT,
    "customerMessageTemplate" TEXT,
    "cautionNote" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'draft',
    "lastVerifiedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ClaimDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimDocument_slug_key" ON "ClaimDocument"("slug");

-- CreateIndex
CREATE INDEX "ClaimDocument_category_idx" ON "ClaimDocument"("category");

-- CreateIndex
CREATE INDEX "ClaimDocument_insurerId_idx" ON "ClaimDocument"("insurerId");

-- CreateIndex
CREATE INDEX "ClaimDocument_verificationStatus_idx" ON "ClaimDocument"("verificationStatus");

-- CreateIndex
CREATE INDEX "ClaimDocument_isPublished_idx" ON "ClaimDocument"("isPublished");

-- CreateIndex
CREATE INDEX "ClaimDocument_sortOrder_idx" ON "ClaimDocument"("sortOrder");

-- AddForeignKey
ALTER TABLE "ClaimDocument" ADD CONSTRAINT "ClaimDocument_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
