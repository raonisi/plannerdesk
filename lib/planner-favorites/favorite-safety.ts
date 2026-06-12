/**
 * PR-BS-13: Planner favorite / recent-work safety helpers (client-side only).
 */

import {
  containsProhibitedFavoriteText,
  isProhibitedFavoriteType,
} from "./pii-guard";

export type PlannerFavoriteShortcut = {
  type: string;
  targetId: string;
  href: string;
  label: string;
  category?: string;
  sourceArea?: string;
};

/** Fields that must never appear in stored favorite payloads. */
export const PLANNER_FAVORITES_FORBIDDEN_STORAGE_FIELDS = [
  "customerName",
  "residentNumber",
  "phone",
  "address",
  "contractNumber",
  "policyNumber",
  "diagnosisText",
  "medicalHistory",
  "consultationText",
  "claimText",
  "claimDecision",
  "benefitEligibility",
  "paymentAmount",
  "answerAssistantPrompt",
  "answerAssistantResponse",
  "adminMemo",
  "internalReviewNote",
  "privateMemo",
  "rawCorrectionText",
  "secret",
  "token",
  "apiKey",
] as const;

const ALLOWED_HREF_PREFIXES = [
  "/directory",
  "/claim-documents",
  "/knowledge",
  "/work-tools",
  "/search",
  "/message-templates",
  "/disclosure-links",
] as const;

const BLOCKED_HREF_PREFIXES = [
  "/admin",
  "/planner/answer-assistant",
  "/answer-assistant",
] as const;

const RESIDENT_ID_IN_HREF = /\d{6}-?\d{7}/;
const SENSITIVE_QUERY_PATTERN =
  /(?:contract|policy|customer|phone|resident|diagnosis|consultation|policyNumber|contractNumber)=/i;

export function isSensitiveFavoriteLabel(label: string): boolean {
  return containsProhibitedFavoriteText(label);
}

export function isUnsafeFavoriteHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return true;

  const pathOnly = trimmed.split("?")[0]?.split("#")[0]?.toLowerCase() ?? "";
  for (const blocked of BLOCKED_HREF_PREFIXES) {
    if (pathOnly === blocked || pathOnly.startsWith(`${blocked}/`)) {
      return true;
    }
  }

  const allowed = ALLOWED_HREF_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`),
  );
  if (!allowed) return true;

  const query = trimmed.includes("?") ? trimmed.slice(trimmed.indexOf("?")) : "";
  if (RESIDENT_ID_IN_HREF.test(query)) return true;
  if (SENSITIVE_QUERY_PATTERN.test(query)) return true;

  return false;
}

export function isPlannerFavoriteAllowed(item: PlannerFavoriteShortcut): boolean {
  if (!item.type?.trim() || !item.targetId?.trim() || !item.href?.trim()) {
    return false;
  }
  if (isProhibitedFavoriteType(item.type)) return false;
  if (isSensitiveFavoriteLabel(item.label)) return false;
  if (containsProhibitedFavoriteText(item.targetId)) return false;
  if (isUnsafeFavoriteHref(item.href)) return false;
  return true;
}

export function sanitizePlannerFavorite(
  item: PlannerFavoriteShortcut,
): PlannerFavoriteShortcut | null {
  return isPlannerFavoriteAllowed(item) ? item : null;
}
