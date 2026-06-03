// Answer Assistant retrieval contracts (PR-93 design only).
// No DB query, LLM call, or runtime retrieval in this PR.
// Implementation: admin draft MVP PR-94.

/** Domains eligible as answer-assist evidence (CorrectionRequest excluded). */
export type RetrievalSourceType =
  | "knowledge_article"
  | "disclosure_link"
  | "message_template"
  | "insurer"
  | "claim_document";

export type RetrievalAudience = "admin" | "verified_planner";

/** Safety category for pre-retrieval query gate (PR-94 server validation). */
export type RetrievalSafetyCategory =
  | "personal_info"
  | "contract_info"
  | "medical_info"
  | "claim_document"
  | "payout_judgment"
  | "loss_adjustment"
  | "product_solicitation"
  | "prompt_injection"
  | "validation";

export type RetrievalBlockedReason =
  | "sensitive_query"
  | "payout_judgment"
  | "loss_adjustment"
  | "medical_interpretation"
  | "product_solicitation"
  | "prompt_injection"
  | "unauthorized"
  | "validation";

/**
 * Normalized evidence row returned by retrieval (PR-94).
 * Internal governance fields must never appear on this type.
 */
export interface RetrievalCandidate {
  id: string;
  type: RetrievalSourceType;
  title: string;
  summary?: string;
  /** Customer-safe or public-safe text snippet (e.g. safeCopy, summary, description). */
  safeText?: string;
  sourceName?: string;
  sourceUrl?: string;
  categoryLabel?: string;
  /** Lower number = higher priority (see RETRIEVAL_SOURCE_PRIORITY). */
  priority: number;
  updatedAt?: string;
  reviewedAt?: string;
  lastVerifiedAt?: string;
  /** True when row is an official disclosure/regulator/insurer source. */
  isOfficialSource?: boolean;
}

export interface RetrievalPolicyResult {
  allowed: boolean;
  blockedReason?: RetrievalBlockedReason;
  blockedMessage?: string;
  safetyCategory?: RetrievalSafetyCategory;
  candidates: RetrievalCandidate[];
  /** Question requires official source but none was found. */
  needsOfficialCheck?: boolean;
  /** No usable evidence; PR-94 must not generate an answer draft. */
  insufficientEvidence?: boolean;
}

/** Query input contract for PR-94 (validation only in that PR). */
export interface RetrievalQueryInput {
  query: string;
  audience: RetrievalAudience;
  /** Optional domain scope; default searches all allowed domains. */
  domain?: RetrievalSourceType | "all";
  limit?: number;
}

export type RetrievalQueryResult =
  | (RetrievalPolicyResult & { ok: true })
  | {
      ok: false;
      allowed: false;
      blockedReason: RetrievalBlockedReason;
      blockedMessage: string;
      safetyCategory?: RetrievalSafetyCategory;
      candidates: [];
    };

/**
 * Source priority tiers (PR-93 §5). Lower `priority` on RetrievalCandidate = rank first.
 * PR-94 sorts by this value, then recency (reviewedAt / lastVerifiedAt / updatedAt).
 */
export const RETRIEVAL_SOURCE_PRIORITY = {
  disclosure_link_official: 10,
  disclosure_link: 20,
  insurer_official_url: 30,
  knowledge_article_verified: 40,
  message_template_safe_copy: 50,
  claim_document: 60,
  insurer: 70,
} as const;

/**
 * Maps each domain to canonical visibility WHERE source.
 * PR-94 must import the same helpers — do not duplicate rules.
 */
export const RETRIEVAL_VISIBILITY_SOURCES = {
  knowledge_article:
    "lib/public/knowledge-articles.ts — PUBLIC_KNOWLEDGE_WHERE + aiUsable + status=verified",
  disclosure_link:
    "lib/public/disclosure-links.ts — PUBLIC_DISCLOSURE_LINK_WHERE",
  message_template:
    "lib/public/message-templates.ts — PUBLIC_MESSAGE_TEMPLATE_WHERE",
  insurer: "lib/public/insurers.ts — isInsurerPubliclyVisible / getPublicInsurers",
  claim_document:
    "lib/public/claim-documents.ts — isClaimDocumentPubliclyVisible",
} as const;

/** Domains never used as retrieval sources in MVP. */
export const RETRIEVAL_EXCLUDED_DOMAINS = [
  "correction_request",
  "community_post",
  "community_report",
  "planner_verification",
  "user",
] as const;

export type RetrievalExcludedDomain =
  (typeof RETRIEVAL_EXCLUDED_DOMAINS)[number];
