import type {
  WorkLinkInfoType,
  WorkLinkReviewCandidate,
  WorkLinkReviewStatus,
  WorkLinkRiskLevel,
  WorkLinkVisibilityScope,
  PublicWorkLinkProjection,
} from "./review-types";
import { WORK_LINK_ADMIN_ONLY_FIELDS } from "./review-types";

export const DEFAULT_WORK_LINK_VISIBILITY_SCOPE: WorkLinkVisibilityScope = "admin";

const PRE_PUBLIC_REVIEW_STATUSES: ReadonlySet<WorkLinkReviewStatus> = new Set([
  "draft",
  "needs_review",
  "retired",
  "rejected",
]);

const PUBLIC_READY_STATUSES: ReadonlySet<WorkLinkReviewStatus> = new Set([
  "verified",
  "published",
]);

/** Default risk by info type (PR-BS-14 §3). */
export const WORK_LINK_INFO_TYPE_DEFAULT_RISK: Record<
  WorkLinkInfoType,
  WorkLinkRiskLevel
> = {
  insurerSystem: "high",
  claimGuide: "high",
  claimDocument: "high",
  customerCenter: "high",
  fax: "high",
  paymentInfo: "high",
  disclosure: "medium",
  officialNotice: "medium",
  otherOfficial: "medium",
};

export function defaultRiskForInfoType(infoType: WorkLinkInfoType): WorkLinkRiskLevel {
  return WORK_LINK_INFO_TYPE_DEFAULT_RISK[infoType];
}

export function isHighRiskInfoType(infoType: WorkLinkInfoType): boolean {
  return WORK_LINK_INFO_TYPE_DEFAULT_RISK[infoType] === "high";
}

export function hasOfficialSourceUrl(candidate: WorkLinkReviewCandidate): boolean {
  return Boolean(candidate.officialSourceUrl?.trim());
}

/** Whether a row could ever become public (PR-BS-15); BS-14 does not expose public UI. */
export function isWorkLinkPublicPublishCandidate(
  candidate: WorkLinkReviewCandidate,
): boolean {
  if (PRE_PUBLIC_REVIEW_STATUSES.has(candidate.reviewStatus)) return false;
  if (candidate.reviewStatus === "stale") return false;
  if (!hasOfficialSourceUrl(candidate)) return false;
  if (!PUBLIC_READY_STATUSES.has(candidate.reviewStatus)) return false;
  if (candidate.visibilityScope !== "public") return false;
  return true;
}

export function projectWorkLinkToPublic(
  candidate: WorkLinkReviewCandidate,
): PublicWorkLinkProjection | null {
  if (!isWorkLinkPublicPublishCandidate(candidate)) return null;
  const officialSourceUrl = candidate.officialSourceUrl?.trim();
  if (!officialSourceUrl) return null;

  return {
    id: candidate.id,
    title: candidate.title,
    insurerName: candidate.insurerName,
    infoType: candidate.infoType,
    officialSourceUrl,
    sourceLabel: candidate.sourceLabel,
    lastVerifiedAt: candidate.lastVerifiedAt,
  };
}

export function stripAdminOnlyWorkLinkFields(
  candidate: WorkLinkReviewCandidate,
): Omit<
  WorkLinkReviewCandidate,
  (typeof WORK_LINK_ADMIN_ONLY_FIELDS)[number]
> {
  const out = { ...candidate };
  for (const field of WORK_LINK_ADMIN_ONLY_FIELDS) {
    delete (out as Record<string, unknown>)[field];
  }
  return out;
}
