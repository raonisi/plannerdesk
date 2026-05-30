-- CreateEnum
CREATE TYPE "DisclosureLinkCategory" AS ENUM (
  'product_disclosure',
  'policy_terms',
  'claim_disclosure',
  'insurer_notice',
  'insurer_official_materials',
  'insurance_association',
  'regulator',
  'claim_compensation_reference',
  'education_practice_reference',
  'customer_guide',
  'other'
);

-- CreateEnum
CREATE TYPE "DisclosureLinkTargetType" AS ENUM (
  'insurer',
  'regulator',
  'association',
  'internal',
  'other'
);

-- CreateEnum
CREATE TYPE "DisclosureLinkStatus" AS ENUM (
  'draft',
  'needs_review',
  'published',
  'archived'
);

-- CreateTable
CREATE TABLE "DisclosureLink" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "DisclosureLinkCategory" NOT NULL,
    "targetType" "DisclosureLinkTargetType" NOT NULL DEFAULT 'other',
    "insurerId" TEXT,
    "status" "DisclosureLinkStatus" NOT NULL DEFAULT 'draft',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sourceName" TEXT,
    "isOfficialSource" BOOLEAN NOT NULL DEFAULT false,
    "lastVerifiedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "adminMemo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "DisclosureLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DisclosureLink" ADD CONSTRAINT "DisclosureLink_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "DisclosureLink_category_idx" ON "DisclosureLink"("category");

-- CreateIndex
CREATE INDEX "DisclosureLink_targetType_idx" ON "DisclosureLink"("targetType");

-- CreateIndex
CREATE INDEX "DisclosureLink_insurerId_idx" ON "DisclosureLink"("insurerId");

-- CreateIndex
CREATE INDEX "DisclosureLink_status_idx" ON "DisclosureLink"("status");

-- CreateIndex
CREATE INDEX "DisclosureLink_isPublished_idx" ON "DisclosureLink"("isPublished");

-- CreateIndex
CREATE INDEX "DisclosureLink_sortOrder_idx" ON "DisclosureLink"("sortOrder");

-- CreateIndex
CREATE INDEX "DisclosureLink_lastVerifiedAt_idx" ON "DisclosureLink"("lastVerifiedAt");
