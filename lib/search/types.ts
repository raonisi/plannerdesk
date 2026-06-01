// Global Search IA contracts (PR-82 design only). No query/runtime in this PR.
// Implementation: public search PR-83, admin search PR-85.

/** Public global search domains (CorrectionRequest excluded). */
export type PublicSearchDomain =
  | "all"
  | "insurer"
  | "claim_document"
  | "knowledge_article"
  | "disclosure_link"
  | "message_template";

export type GlobalSearchResultType =
  | "insurer"
  | "claim_document"
  | "knowledge_article"
  | "disclosure_link"
  | "message_template";

export interface GlobalSearchResult {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  summary?: string;
  url: string;
  categoryLabel?: string;
  sourceLabel?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export type AdminSearchResultType =
  | GlobalSearchResultType
  | "correction_request";

export type AdminSearchDomain =
  | PublicSearchDomain
  | "correction_request"
  | "all";

export interface AdminSearchResult
  extends Omit<GlobalSearchResult, "type"> {
  type: AdminSearchResultType;
  status?: string;
  isPublished?: boolean;
  isInternalOnly?: boolean;
  riskBadge?: string;
  adminUrl: string;
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
} as const;
