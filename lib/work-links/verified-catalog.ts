import { WORK_LINK_REVIEW_MOCK_CANDIDATES } from "./review-mock-candidates";
import { VERIFIED_WORK_LINK_DISPLAY_FIXTURES } from "./verified-fixtures";
import {
  listPlannerVerifiedWorkLinks,
  listPublicVerifiedWorkLinks,
} from "./verified-projection";

const ALL_CANDIDATES = [
  ...WORK_LINK_REVIEW_MOCK_CANDIDATES,
  ...VERIFIED_WORK_LINK_DISPLAY_FIXTURES,
] as const;

export function getPublicVerifiedWorkLinks(options?: {
  insurerName?: string;
  query?: string;
}) {
  return listPublicVerifiedWorkLinks(ALL_CANDIDATES, options);
}

export function getPlannerVerifiedWorkLinks(options?: {
  insurerName?: string;
  query?: string;
}) {
  return listPlannerVerifiedWorkLinks(ALL_CANDIDATES, options);
}
