// Answer Assistant admin draft types (PR-94).

import type { RetrievalCandidate, RetrievalSourceType } from "./retrieval-types";

export type AnswerAssistantPurpose =
  | "GENERAL_EXPLANATION"
  | "CUSTOMER_SAFE_MESSAGE"
  | "KNOWLEDGE_SUMMARY"
  | "DISCLOSURE_GUIDE"
  | "CLAIM_DOCUMENT_GUIDE"
  | "COMMUNITY_REPLY_DRAFT";

export type AnswerAssistantTone =
  | "neutral"
  | "formal"
  | "concise"
  | "consultative";

export type AnswerAssistantDomainFilter = RetrievalSourceType | "all";

export type AnswerAssistantBlockedReason =
  | "PERSONAL_INFO"
  | "CONTRACT_INFO"
  | "MEDICAL_INFO"
  | "CLAIM_DOCUMENT"
  | "CLAIM_JUDGMENT"
  | "LOSS_ADJUSTMENT"
  | "PRODUCT_SOLICITATION"
  | "FEAR_MARKETING"
  | "PROMPT_INJECTION"
  | "VALIDATION"
  | "INSUFFICIENT_EVIDENCE"
  | "PROVIDER_NOT_CONFIGURED"
  | "PROVIDER_ERROR"
  | "OUTPUT_SAFETY_BLOCKED";

export type AnswerAssistantDraftMode = "rules_based" | "llm";

export interface AnswerAssistantInput {
  purpose: AnswerAssistantPurpose;
  query: string;
  tone: AnswerAssistantTone;
  domain: AnswerAssistantDomainFilter;
  requiresOfficialCheck: boolean;
}

export interface AnswerAssistantEvidenceItem {
  id: string;
  type: RetrievalSourceType;
  title: string;
  summary?: string;
  sourceName?: string;
  sourceUrl?: string;
  categoryLabel?: string;
  isOfficialSource?: boolean;
}

export interface AnswerAssistantSuccessResult {
  ok: true;
  draft: string;
  draftMode: AnswerAssistantDraftMode;
  providerConfigured: boolean;
  providerNotice?: string;
  evidence: AnswerAssistantEvidenceItem[];
  officialCheckItems: string[];
  warnings: string[];
  needsOfficialCheck: boolean;
  insufficientEvidence: false;
  candidateCount: number;
  draftLabel: string;
  footerDisclaimer: string;
}

export interface AnswerAssistantBlockedResult {
  ok: false;
  blockedReason: AnswerAssistantBlockedReason;
  message: string;
  evidence: AnswerAssistantEvidenceItem[];
  warnings: string[];
  needsOfficialCheck?: boolean;
  insufficientEvidence?: boolean;
  candidateCount: number;
}

export type AnswerAssistantDraftResult =
  | AnswerAssistantSuccessResult
  | AnswerAssistantBlockedResult;

export interface AnswerAssistantValidationResult {
  ok: boolean;
  blockedReason?: AnswerAssistantBlockedReason;
  message: string;
  normalizedQuery?: string;
}

export interface AnswerAssistantRetrievalContext {
  purpose: AnswerAssistantPurpose;
  requiresOfficialCheck: boolean;
  candidates: RetrievalCandidate[];
  needsOfficialCheck: boolean;
  insufficientEvidence: boolean;
}
