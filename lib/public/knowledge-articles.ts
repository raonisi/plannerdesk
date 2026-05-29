import { KnowledgeArticleStatus } from "@prisma/client";

/**
 * Future public read helper for DB-backed /knowledge (not wired in PR-KNOW-DB-01).
 * Static seed pages remain the live source until a dedicated fetch PR ships.
 */
export const PUBLIC_KNOWLEDGE_ARTICLE_STATUSES = [
  KnowledgeArticleStatus.verified,
  KnowledgeArticleStatus.needs_review,
] as const satisfies readonly KnowledgeArticleStatus[];

export type PublicKnowledgeArticleStatus =
  (typeof PUBLIC_KNOWLEDGE_ARTICLE_STATUSES)[number];

export function isPublicKnowledgeArticleStatus(
  status: KnowledgeArticleStatus,
): status is PublicKnowledgeArticleStatus {
  return (
    PUBLIC_KNOWLEDGE_ARTICLE_STATUSES as readonly KnowledgeArticleStatus[]
  ).includes(status);
}

export interface KnowledgeArticleVisibilityFlags {
  isPublished: boolean;
  status: KnowledgeArticleStatus;
}

/**
 * Canonical visibility rule for future public /knowledge DB reads.
 * Draft, archived, rejected, and unpublished rows must never appear publicly.
 */
export function isKnowledgeArticlePubliclyVisible(
  flags: KnowledgeArticleVisibilityFlags,
): boolean {
  return flags.isPublished && isPublicKnowledgeArticleStatus(flags.status);
}
