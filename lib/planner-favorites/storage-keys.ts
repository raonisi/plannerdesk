/**
 * Client-only favorite namespaces (PR-135). IDs only — no PII, URLs, or auth linkage.
 * Server-side favorite tables require PR-135-B (separate High-risk PR).
 */
export const PLANNER_FAVORITE_STORAGE_KEYS = {
  insurers: "plannerdesk:favoriteInsurers",
  workTools: "plannerdesk.workTools.favorites",
  messageTemplates: "plannerdesk.messages.favorites",
  claimDocuments: "plannerdesk:favoriteClaimDocuments",
  knowledgeArticles: "plannerdesk:favoriteKnowledgeArticles",
  homeRecents: "plannerdesk.home.recents",
} as const;

export type PlannerFavoriteStorageKey =
  (typeof PLANNER_FAVORITE_STORAGE_KEYS)[keyof typeof PLANNER_FAVORITE_STORAGE_KEYS];
