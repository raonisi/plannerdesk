/**
 * PR-UX-01: Static fallback projection for public knowledge articles.
 */

import {
  knowledgeFallbackCatalog,
  knowledgeFallbackDraftSampleSlug,
  type KnowledgeFallbackCatalogEntry,
} from "@/lib/content/knowledge-fallback-catalog";
import {
  findProhibitedPhrase,
  findSensitiveVariable,
} from "@/lib/message-template/safety";
import {
  PUBLIC_CATEGORY_LABEL,
  PUBLIC_RISK_LABEL,
  PUBLIC_SOURCE_TYPE_LABEL,
  PUBLIC_STATUS_LABEL,
  PUBLIC_TYPE_LABEL,
  type PublicKnowledgeStatus,
} from "@/lib/public/knowledge-display";
import type {
  PublicKnowledgeArticleDetail,
  PublicKnowledgeArticleListItem,
} from "@/lib/public/knowledge-articles";
import { KnowledgeArticleStatus } from "@prisma/client";

function splitContentParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function scanPublicKnowledgeText(text: string): boolean {
  if (findProhibitedPhrase(text)) return false;
  if (findSensitiveVariable(text)) return false;
  return true;
}

function isFallbackEntryPublic(entry: KnowledgeFallbackCatalogEntry): boolean {
  if (entry.slug === knowledgeFallbackDraftSampleSlug) return false;
  if (entry.slug.includes("-draft")) return false;
  if (
    entry.status !== KnowledgeArticleStatus.verified &&
    entry.status !== KnowledgeArticleStatus.needs_review
  ) {
    return false;
  }
  const fields = [entry.title, entry.summary, entry.content, entry.safeCopy ?? ""];
  return fields.every((field) => !field || scanPublicKnowledgeText(field));
}

function mapFallbackListItem(
  entry: KnowledgeFallbackCatalogEntry,
): PublicKnowledgeArticleListItem {
  const status = entry.status as PublicKnowledgeStatus;

  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    categoryLabel: PUBLIC_CATEGORY_LABEL[entry.category],
    type: entry.type,
    typeLabel: PUBLIC_TYPE_LABEL[entry.type],
    riskLevel: entry.riskLevel,
    riskLabel: PUBLIC_RISK_LABEL[entry.riskLevel],
    status,
    statusLabel: PUBLIC_STATUS_LABEL[status],
    aiUsable: entry.aiUsable,
    sourceType: entry.sourceType,
    sourceTypeLabel: PUBLIC_SOURCE_TYPE_LABEL[entry.sourceType],
    sourceTitle: entry.sourceTitle,
    sourceUrl: null,
    sourceCheckedAt: entry.sourceCheckedAt,
    workflowLabel: entry.workflowLabel ?? null,
    tags: entry.tags,
    updatedAt: entry.updatedAt,
    publishedAt: entry.publishedAt,
  };
}

function mapFallbackDetail(
  entry: KnowledgeFallbackCatalogEntry,
): PublicKnowledgeArticleDetail {
  const status = entry.status as PublicKnowledgeStatus;

  return {
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    content: entry.content,
    bodyParagraphs: splitContentParagraphs(entry.content),
    categoryLabel: PUBLIC_CATEGORY_LABEL[entry.category],
    typeLabel: PUBLIC_TYPE_LABEL[entry.type],
    riskLevel: entry.riskLevel,
    riskLabel: PUBLIC_RISK_LABEL[entry.riskLevel],
    status,
    statusLabel: PUBLIC_STATUS_LABEL[status],
    aiUsable: entry.aiUsable,
    sourceTypeLabel: PUBLIC_SOURCE_TYPE_LABEL[entry.sourceType],
    sourceTitle: entry.sourceTitle,
    sourceUrl: null,
    sourceCheckedAt: entry.sourceCheckedAt,
    workflowLabel: entry.workflowLabel ?? null,
    tags: entry.tags,
    safeCopy: entry.safeCopy ?? null,
    forbiddenClaims: entry.forbiddenClaims ?? [],
    updatedAt: entry.updatedAt,
    publishedAt: entry.publishedAt,
    lastReviewedAt: entry.sourceCheckedAt,
  };
}

/** Static catalog entries eligible for /knowledge when DB is empty or unavailable. */
export function getStaticKnowledgeFallback(): PublicKnowledgeArticleListItem[] {
  return knowledgeFallbackCatalog
    .filter(isFallbackEntryPublic)
    .map(mapFallbackListItem)
    .sort(
      (a, b) =>
        (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") ||
        a.title.localeCompare(b.title, "ko"),
    );
}

export function countStaticKnowledgeFallback(): number {
  return getStaticKnowledgeFallback().length;
}

export function getStaticKnowledgeFallbackBySlug(
  slug: string,
): PublicKnowledgeArticleDetail | null {
  const normalized = slug.trim();
  if (!normalized) return null;

  const entry = knowledgeFallbackCatalog.find(
    (item) => item.slug === normalized && isFallbackEntryPublic(item),
  );
  if (!entry) return null;
  return mapFallbackDetail(entry);
}

export function mergePublicKnowledgeArticles(
  primary: PublicKnowledgeArticleListItem[],
  fallback: PublicKnowledgeArticleListItem[] = getStaticKnowledgeFallback(),
): PublicKnowledgeArticleListItem[] {
  const seen = new Set(primary.map((item) => item.slug));
  const merged = [...primary];
  for (const entry of fallback) {
    if (seen.has(entry.slug)) continue;
    merged.push(entry);
  }
  return merged.sort(
    (a, b) =>
      (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") ||
      a.title.localeCompare(b.title, "ko"),
  );
}
