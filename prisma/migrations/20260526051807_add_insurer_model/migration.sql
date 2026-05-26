-- CreateEnum
CREATE TYPE "InsurerCategory" AS ENUM ('life', 'non_life');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VerificationStatus" ADD VALUE 'draft';
ALTER TYPE "VerificationStatus" ADD VALUE 'needs_review';

-- CreateTable
CREATE TABLE "Insurer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InsurerCategory" NOT NULL,
    "officialWebsiteUrl" TEXT,
    "plannerPortalUrl" TEXT,
    "claimPageUrl" TEXT,
    "customerCenterPhone" TEXT,
    "faxNumber" TEXT,
    "mailingAddress" TEXT,
    "notes" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'draft',
    "lastVerifiedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Insurer_category_idx" ON "Insurer"("category");

-- CreateIndex
CREATE INDEX "Insurer_verificationStatus_idx" ON "Insurer"("verificationStatus");

-- CreateIndex
CREATE INDEX "Insurer_isPublished_idx" ON "Insurer"("isPublished");

-- CreateIndex
CREATE INDEX "Insurer_name_idx" ON "Insurer"("name");
