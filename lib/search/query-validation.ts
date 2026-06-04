// Public search query normalization and sensitive-term blocking (PR-83).

import { sanitizeCorrectionPlainText } from "@/lib/correction-request/sanitize";
import { hasClientSensitiveSignal } from "@/lib/correction-request/validation";
import {
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
  SEARCH_VALIDATION_MESSAGES,
  SENSITIVE_SEARCH_MESSAGE,
} from "./constants";
import type { PublicSearchDomain } from "./types";

const EXTRA_SENSITIVE_KEYWORDS = [
  "면책",
  "부지급",
  "주민등록",
  "신분증",
] as const;

const DOMAIN_PARAM_MAP: Record<string, PublicSearchDomain> = {
  all: "all",
  insurer: "insurer",
  claimdocument: "claim_document",
  claim_document: "claim_document",
  knowledgearticle: "knowledge_article",
  knowledge_article: "knowledge_article",
  disclosurelink: "disclosure_link",
  disclosure_link: "disclosure_link",
  messagetemplate: "message_template",
  message_template: "message_template",
  worklink: "work_link",
  work_link: "work_link",
};

function containsExtraSensitiveKeyword(text: string): boolean {
  const normalized = text.normalize("NFKC").toLowerCase();
  return EXTRA_SENSITIVE_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase()),
  );
}

export function parsePublicSearchDomain(
  value: string | undefined | null,
): PublicSearchDomain {
  if (!value?.trim()) return "all";
  const key = value.trim().toLowerCase().replace(/-/g, "_");
  return DOMAIN_PARAM_MAP[key] ?? "all";
}

export function domainToQueryParam(domain: PublicSearchDomain): string {
  if (domain === "claim_document") return "claimDocument";
  if (domain === "knowledge_article") return "knowledgeArticle";
  if (domain === "disclosure_link") return "disclosureLink";
  if (domain === "message_template") return "messageTemplate";
  if (domain === "work_link") return "workLink";
  return domain;
}

export type SearchQueryValidationResult =
  | { ok: true; query: string }
  | {
      ok: false;
      blockedReason: "validation" | "sensitive_query";
      message: string;
    };

export function validatePublicSearchQuery(
  raw: string,
): SearchQueryValidationResult {
  const sanitized = sanitizeCorrectionPlainText(raw);
  if (sanitized.blocked) {
    return {
      ok: false,
      blockedReason: "validation",
      message: SEARCH_VALIDATION_MESSAGES.invalid,
    };
  }

  const query = sanitized.text.replace(/\s+/g, " ").trim();
  if (!query) {
    return {
      ok: false,
      blockedReason: "validation",
      message: SEARCH_VALIDATION_MESSAGES.tooShort,
    };
  }

  if (query.length < SEARCH_QUERY_MIN_LENGTH) {
    return {
      ok: false,
      blockedReason: "validation",
      message: SEARCH_VALIDATION_MESSAGES.tooShort,
    };
  }

  if (query.length > SEARCH_QUERY_MAX_LENGTH) {
    return {
      ok: false,
      blockedReason: "validation",
      message: SEARCH_VALIDATION_MESSAGES.tooLong,
    };
  }

  if (
    hasClientSensitiveSignal(query) ||
    containsExtraSensitiveKeyword(query)
  ) {
    return {
      ok: false,
      blockedReason: "sensitive_query",
      message: SENSITIVE_SEARCH_MESSAGE,
    };
  }

  return { ok: true, query };
}
