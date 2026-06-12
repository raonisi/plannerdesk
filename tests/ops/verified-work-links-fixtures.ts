import type { WorkLinkReviewCandidate } from "@/lib/work-links/review-types";
import { VERIFIED_WORK_LINK_DISPLAY_FIXTURES } from "@/lib/work-links/verified-fixtures";
import { WORK_LINK_REVIEW_MOCK_CANDIDATES } from "@/lib/work-links/review-mock-candidates";

export const ALL_CANDIDATES_FOR_TEST = [
  ...WORK_LINK_REVIEW_MOCK_CANDIDATES,
  ...VERIFIED_WORK_LINK_DISPLAY_FIXTURES,
] as const;

export const FIXTURE_PUBLISHED_CLAIM = VERIFIED_WORK_LINK_DISPLAY_FIXTURES[0]!;
export const FIXTURE_PUBLISHED_PAYMENT_BLOCKED =
  VERIFIED_WORK_LINK_DISPLAY_FIXTURES[4]!;
export const FIXTURE_PLANNER_CUSTOMER_CENTER = VERIFIED_WORK_LINK_DISPLAY_FIXTURES[2]!;
export const FIXTURE_PLANNER_PAYMENT = VERIFIED_WORK_LINK_DISPLAY_FIXTURES[3]!;

export function makeCandidate(
  overrides: Partial<WorkLinkReviewCandidate>,
): WorkLinkReviewCandidate {
  return {
    ...FIXTURE_PUBLISHED_CLAIM,
    ...overrides,
  };
}
