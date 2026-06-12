import { isHighRiskInfoType, isWorkLinkPublicPublishCandidate } from "./review-rules";
import type { WorkLinkReviewCandidate, WorkLinkReviewFilter } from "./review-types";

export function filterWorkLinkReviewCandidates(
  candidates: readonly WorkLinkReviewCandidate[],
  filter: WorkLinkReviewFilter,
): WorkLinkReviewCandidate[] {
  switch (filter) {
    case "all":
      return [...candidates];
    case "needs_review":
      return candidates.filter(
        (c) => c.reviewStatus === "needs_review" || c.reviewStatus === "draft",
      );
    case "verified":
      return candidates.filter((c) => c.reviewStatus === "verified");
    case "stale":
      return candidates.filter((c) => c.reviewStatus === "stale");
    case "public_candidate":
      return candidates.filter((c) => isWorkLinkPublicPublishCandidate(c));
    case "high_risk":
      return candidates.filter(
        (c) => c.riskLevel === "high" || isHighRiskInfoType(c.infoType),
      );
    default:
      return [...candidates];
  }
}

export function parseWorkLinkReviewFilter(
  value: string | undefined,
): WorkLinkReviewFilter {
  const allowed: WorkLinkReviewFilter[] = [
    "all",
    "needs_review",
    "verified",
    "stale",
    "public_candidate",
    "high_risk",
  ];
  if (value && (allowed as string[]).includes(value)) {
    return value as WorkLinkReviewFilter;
  }
  return "all";
}
