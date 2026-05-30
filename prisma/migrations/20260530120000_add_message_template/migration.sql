-- CreateEnum
CREATE TYPE "MessageTemplateCategory" AS ENUM (
  'greeting',
  'follow_up',
  'appointment',
  'policy_review',
  'claim_guide',
  'contract_maintenance',
  'cancellation_defense',
  'rebalancing',
  'customer_care',
  'notice',
  'other'
);

-- CreateEnum
CREATE TYPE "MessageTemplateChannel" AS ENUM (
  'kakao',
  'sms',
  'phone_script',
  'email',
  'blog',
  'threads',
  'instagram',
  'general'
);

-- CreateEnum
CREATE TYPE "MessageTemplateAudienceType" AS ENUM (
  'new_customer',
  'existing_customer',
  'dormant_customer',
  'claim_customer',
  'cancellation_risk',
  'referral',
  'general'
);

-- CreateEnum
CREATE TYPE "MessageTemplateTone" AS ENUM (
  'formal',
  'warm',
  'concise',
  'consultative',
  'reassuring',
  'neutral',
  'professional',
  'careful',
  'calm'
);

-- CreateEnum
CREATE TYPE "MessageTemplateRiskLevel" AS ENUM (
  'low',
  'medium',
  'high'
);

-- CreateEnum
CREATE TYPE "MessageTemplateStatus" AS ENUM (
  'draft',
  'needs_review',
  'published',
  'archived'
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "MessageTemplateCategory" NOT NULL,
    "channel" "MessageTemplateChannel" NOT NULL DEFAULT 'general',
    "audienceType" "MessageTemplateAudienceType" NOT NULL DEFAULT 'general',
    "useCase" TEXT NOT NULL,
    "tone" "MessageTemplateTone" NOT NULL DEFAULT 'neutral',
    "status" "MessageTemplateStatus" NOT NULL DEFAULT 'draft',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isInternalOnly" BOOLEAN NOT NULL DEFAULT false,
    "riskLevel" "MessageTemplateRiskLevel" NOT NULL DEFAULT 'medium',
    "safeCopy" TEXT,
    "forbiddenClaims" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "complianceNote" TEXT,
    "allowedVariables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageTemplate_category_idx" ON "MessageTemplate"("category");

-- CreateIndex
CREATE INDEX "MessageTemplate_channel_idx" ON "MessageTemplate"("channel");

-- CreateIndex
CREATE INDEX "MessageTemplate_audienceType_idx" ON "MessageTemplate"("audienceType");

-- CreateIndex
CREATE INDEX "MessageTemplate_tone_idx" ON "MessageTemplate"("tone");

-- CreateIndex
CREATE INDEX "MessageTemplate_status_idx" ON "MessageTemplate"("status");

-- CreateIndex
CREATE INDEX "MessageTemplate_isPublished_idx" ON "MessageTemplate"("isPublished");

-- CreateIndex
CREATE INDEX "MessageTemplate_isInternalOnly_idx" ON "MessageTemplate"("isInternalOnly");

-- CreateIndex
CREATE INDEX "MessageTemplate_riskLevel_idx" ON "MessageTemplate"("riskLevel");

-- CreateIndex
CREATE INDEX "MessageTemplate_sortOrder_idx" ON "MessageTemplate"("sortOrder");
