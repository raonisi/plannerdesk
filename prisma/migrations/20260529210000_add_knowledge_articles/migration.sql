-- CreateEnum
CREATE TYPE "KnowledgeArticleStatus" AS ENUM ('draft', 'needs_review', 'verified', 'archived', 'rejected');

-- CreateEnum
CREATE TYPE "KnowledgeArticleCategory" AS ENUM ('claim', 'underwriting', 'cancellation', 'disclosure', 'customer_message', 'operation_safety', 'plannerdesk_usage');

-- CreateEnum
CREATE TYPE "KnowledgeArticleType" AS ENUM ('faq', 'practical_standard', 'checklist', 'message_sample', 'link_guide', 'safety_boundary');

-- CreateEnum
CREATE TYPE "KnowledgeRiskLevel" AS ENUM ('low', 'medium', 'high', 'blocked');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('internal', 'official', 'insurer', 'regulator', 'mixed');

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "KnowledgeArticleCategory" NOT NULL,
    "type" "KnowledgeArticleType" NOT NULL,
    "riskLevel" "KnowledgeRiskLevel" NOT NULL DEFAULT 'medium',
    "status" "KnowledgeArticleStatus" NOT NULL DEFAULT 'draft',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "aiUsable" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" "KnowledgeSourceType" NOT NULL DEFAULT 'internal',
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "sourceCheckedAt" TIMESTAMP(3),
    "workflowLabel" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safeCopy" TEXT,
    "forbiddenClaims" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "reviewedById" TEXT,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_slug_key" ON "KnowledgeArticle"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_status_idx" ON "KnowledgeArticle"("status");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_isPublished_idx" ON "KnowledgeArticle"("isPublished");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_category_idx" ON "KnowledgeArticle"("category");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_type_idx" ON "KnowledgeArticle"("type");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_riskLevel_idx" ON "KnowledgeArticle"("riskLevel");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_aiUsable_idx" ON "KnowledgeArticle"("aiUsable");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_slug_idx" ON "KnowledgeArticle"("slug");
