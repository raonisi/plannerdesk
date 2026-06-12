// Global Search IA contracts (PR-82 design only). No query/runtime in this PR.
// Implementation: public search PR-83, admin search PR-85.

/** Public global search domains (CorrectionRequest excluded). */
export type PublicSearchDomain =
  | "all"
  | "insurer"
  | "claim_document"
  | "knowledge_article"
  | "disclosure_link"
  | "message_template"
  | "work_link";

export type GlobalSearchResultType =
  | "insurer"
  | "claim_document"
  | "knowledge_article"
  | "disclosure_link"
  | "message_template"
  | "work_link";

export interface GlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  summary?: string;
  url: string;
  /** External or tel: target for work-link rows (PR-132). */
  externalHref?: string;
  linkTypeLabel?: string;
  categoryLabel?: string;
  sourceLabel?: string;
  updatedAt?: string;
  publishedAt?: string;
  /** PR-BS-10: public-safe freshness metadata from existing fields. */
  lastVerifiedAt?: string;
  officialSourceUrl?: string;
}

export type AdminSearchResultType =
  | Exclude<GlobalSearchResultType, "work_link">
  | "correction_request";

export type AdminSearchDomain =
  | Exclude<PublicSearchDomain, "work_link">
  | "correction_request"
  | "all";

export interface AdminSearchResult
  extends Omit<GlobalSearchResult, "type" | "url"> {
  type: AdminSearchResultType;
  status?: string;
  isPublished?: boolean;
  isInternalOnly?: boolean;
  riskBadge?: string;
  sensitiveBadge?: string;
  adminUrl: string;
  createdAt?: string;
  /** Admin-only; never returned on public search. */
  containsSensitiveData?: boolean;
  redactionRequired?: boolean;
}

/** Query input contract for PR-83 / PR-85 (validation only in those PRs). */
export interface GlobalSearchQueryInput {
  q: string;
  domain?: PublicSearchDomain;
  page?: number;
  pageSize?: number;
}

export type GlobalSearchQueryResult =
  | {
      ok: true;
      results: GlobalSearchResult[];
      total: number;
    }
  | {
      ok: false;
      blockedReason: "sensitive_query" | "validation";
      message: string;
    };

export type AdminSearchStatusFilter =
  | "all"
  | "draft"
  | "review"
  | "published"
  | "archived"
  | "new"
  | "needsRedaction";

export type AdminSearchPublishedFilter = "all" | "published" | "unpublished";

export type AdminSearchInternalFilter = "all" | "internal" | "external";

export type AdminSearchSensitiveFilter = "all" | "flagged";

export interface AdminSearchQueryInput {
  q: string;
  domain?: AdminSearchDomain;
  status?: AdminSearchStatusFilter;
  published?: AdminSearchPublishedFilter;
  internal?: AdminSearchInternalFilter;
  sensitive?: AdminSearchSensitiveFilter;
}

export type AdminSearchQueryResult =
  | {
      ok: true;
      results: AdminSearchResult[];
      total: number;
    }
  | {
      ok: false;
      blockedReason: "sensitive_query" | "validation" | "unauthorized";
      message: string;
    };

/**
 * Maps each domain to the canonical visibility predicate source file.
 * PR-83 must import the same WHERE/helpers — do not duplicate rules.
 */
export const SEARCH_VISIBILITY_SOURCES = {
  insurer: "lib/public/insurers.ts — isInsurerPubliclyVisible / getPublicInsurers",
  claim_document:
    "lib/public/claim-documents.ts — isClaimDocumentPubliclyVisible",
  knowledge_article:
    "lib/public/knowledge-articles.ts — PUBLIC_KNOWLEDGE_WHERE",
  disclosure_link:
    "lib/public/disclosure-links.ts — PUBLIC_DISCLOSURE_LINK_WHERE",
  message_template:
    "lib/public/message-templates.ts — PUBLIC_MESSAGE_TEMPLATE_WHERE",
  work_link:
    "lib/search/work-links-search.ts — published insurers only (PR-132)",
} as const;
