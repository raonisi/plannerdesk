/** PR-BS-14: Admin work-link review draft types (no DB schema). */

export const WORK_LINK_INFO_TYPES = [
  "insurerSystem",
  "claimGuide",
  "claimDocument",
  "customerCenter",
  "fax",
  "paymentInfo",
  "disclosure",
  "officialNotice",
  "otherOfficial",
] as const;

export type WorkLinkInfoType = (typeof WORK_LINK_INFO_TYPES)[number];

export const WORK_LINK_REVIEW_STATUSES = [
  "draft",
  "needs_review",
  "verified",
  "published",
  "stale",
  "retired",
  "rejected",
] as const;

export type WorkLinkReviewStatus = (typeof WORK_LINK_REVIEW_STATUSES)[number];

export const WORK_LINK_VISIBILITY_SCOPES = ["admin", "planner", "public"] as const;

export type WorkLinkVisibilityScope = (typeof WORK_LINK_VISIBILITY_SCOPES)[number];

export const WORK_LINK_RISK_LEVELS = ["medium", "high"] as const;

export type WorkLinkRiskLevel = (typeof WORK_LINK_RISK_LEVELS)[number];

/** Admin-only fields must never appear in public/planner projections. */
export const WORK_LINK_ADMIN_ONLY_FIELDS = [
  "reviewNotePrivate",
  "adminMemo",
  "internalReviewNote",
  "rawSourceMemo",
  "reviewerName",
  "internalStatus",
] as const;

export type WorkLinkAdminOnlyField = (typeof WORK_LINK_ADMIN_ONLY_FIELDS)[number];

export type WorkLinkReviewCandidate = {
  id: string;
  title: string;
  insurerName: string;
  infoType: WorkLinkInfoType;
  targetUrl: string | null;
  officialSourceUrl: string | null;
  sourceLabel: string | null;
  riskLevel: WorkLinkRiskLevel;
  reviewStatus: WorkLinkReviewStatus;
  visibilityScope: WorkLinkVisibilityScope;
  lastVerifiedAt: string | null;
  staleAfterDays: number;
  reviewNotePrivate: string | null;
  adminMemo?: string | null;
  internalReviewNote?: string | null;
  rawSourceMemo?: string | null;
  reviewerName?: string | null;
  internalStatus?: string | null;
};

export type WorkLinkReviewFilter =
  | "all"
  | "needs_review"
  | "verified"
  | "stale"
  | "public_candidate"
  | "high_risk";

export type PublicWorkLinkProjection = {
  id: string;
  title: string;
  insurerName: string;
  infoType: WorkLinkInfoType;
  officialSourceUrl: string;
  sourceLabel: string | null;
  lastVerifiedAt: string | null;
};

/** PR-BS-15: Safe fields for public/planner surfaces (no admin-only fields). */
export type PublicVerifiedWorkLinkView = {
  id: string;
  title: string;
  insurerName: string;
  infoType: WorkLinkInfoType;
  targetUrl: string | null;
  officialSourceUrl: string;
  sourceLabel: string | null;
  lastVerifiedAt: string;
  riskLevel: WorkLinkRiskLevel;
  displayNotice: string;
};

export type PlannerVerifiedWorkLinkView = PublicVerifiedWorkLinkView & {
  plannerNotice: string;
};
