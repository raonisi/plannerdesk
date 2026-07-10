import {
  listPlannerVerifiedWorkLinks,
  listPublicVerifiedWorkLinks,
} from "./verified-projection";
import type { WorkLinkReviewCandidate } from "./review-types";

// Public/planner runtime catalogs must contain reviewed operational sources only.
// Test and admin mock candidates are injected directly by their own callers.
const RUNTIME_VERIFIED_WORK_LINK_CANDIDATES: readonly WorkLinkReviewCandidate[] = [];

export function getPublicVerifiedWorkLinks(options?: {
  insurerName?: string;
  query?: string;
}) {
  return listPublicVerifiedWorkLinks(
    RUNTIME_VERIFIED_WORK_LINK_CANDIDATES,
    options,
  );
}

export function getPlannerVerifiedWorkLinks(options?: {
  insurerName?: string;
  query?: string;
}) {
  return listPlannerVerifiedWorkLinks(
    RUNTIME_VERIFIED_WORK_LINK_CANDIDATES,
    options,
  );
}
