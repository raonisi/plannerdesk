-- CreateEnum
CREATE TYPE "PlannerVerificationStatus" AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'suspended',
  'expired',
  'deleted'
);

-- CreateEnum
CREATE TYPE "PlannerType" AS ENUM (
  'life',
  'non_life',
  'both',
  'ga',
  'agency',
  'other'
);

-- CreateEnum
CREATE TYPE "PlannerCareerRange" AS ENUM (
  'under_1_year',
  'one_to_three_years',
  'three_to_five_years',
  'five_to_ten_years',
  'over_ten_years',
  'not_disclosed'
);

-- CreateEnum
CREATE TYPE "PlannerLicenseScope" AS ENUM (
  'life_only',
  'non_life_only',
  'life_and_non_life',
  'third_insurance',
  'unknown',
  'not_disclosed'
);

-- CreateEnum
CREATE TYPE "PlannerBusinessChannel" AS ENUM (
  'face_to_face',
  'online',
  'telemarketing',
  'corporate',
  'mixed',
  'other',
  'not_disclosed'
);

-- CreateTable
CREATE TABLE "PlannerVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PlannerVerificationStatus" NOT NULL DEFAULT 'pending',
    "displayName" TEXT NOT NULL,
    "plannerType" "PlannerType" NOT NULL,
    "affiliationName" TEXT,
    "activityRegion" TEXT NOT NULL,
    "careerRange" "PlannerCareerRange" NOT NULL,
    "licenseScope" "PlannerLicenseScope" NOT NULL DEFAULT 'not_disclosed',
    "businessChannel" "PlannerBusinessChannel" NOT NULL DEFAULT 'not_disclosed',
    "verificationNote" TEXT,
    "containsSensitiveData" BOOLEAN NOT NULL DEFAULT false,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "adminMemo" TEXT,
    "rejectionReason" TEXT,
    "userFacingRejectionSummary" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerVerification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlannerVerification" ADD CONSTRAINT "PlannerVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerVerification" ADD CONSTRAINT "PlannerVerification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PlannerVerification_userId_idx" ON "PlannerVerification"("userId");

-- CreateIndex
CREATE INDEX "PlannerVerification_status_idx" ON "PlannerVerification"("status");

-- CreateIndex
CREATE INDEX "PlannerVerification_plannerType_idx" ON "PlannerVerification"("plannerType");

-- CreateIndex
CREATE INDEX "PlannerVerification_careerRange_idx" ON "PlannerVerification"("careerRange");

-- CreateIndex
CREATE INDEX "PlannerVerification_requestedAt_idx" ON "PlannerVerification"("requestedAt");

-- CreateIndex
CREATE INDEX "PlannerVerification_reviewedAt_idx" ON "PlannerVerification"("reviewedAt");

-- CreateIndex
CREATE INDEX "PlannerVerification_deletedAt_idx" ON "PlannerVerification"("deletedAt");

-- CreateIndex
CREATE INDEX "PlannerVerification_containsSensitiveData_idx" ON "PlannerVerification"("containsSensitiveData");

-- CreateIndex
CREATE INDEX "PlannerVerification_status_requestedAt_idx" ON "PlannerVerification"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "PlannerVerification_userId_status_idx" ON "PlannerVerification"("userId", "status");
