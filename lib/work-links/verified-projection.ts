import type {
  PublicVerifiedWorkLinkView,
  PlannerVerifiedWorkLinkView,
  WorkLinkInfoType,
  WorkLinkReviewCandidate,
  WorkLinkReviewStatus,
} from "./review-types";
import { WORK_LINK_ADMIN_ONLY_FIELDS } from "./review-types";
import { isHighRiskInfoType } from "./review-rules";
import {
  buildPaymentInfoDisplayNotice,
  isPaymentInfoHighRiskType,
  isPaymentInfoPlannerCandidate,
} from "@/lib/payment-info/payment-info-policy";
import {
  VERIFIED_WORK_LINK_HIGH_RISK_NOTICE,
  VERIFIED_WORK_LINK_PLANNER_NOTICE,
  VERIFIED_WORK_LINK_PLANNER_PII_NOTICE,
  VERIFIED_WORK_LINK_PUBLIC_DETAIL_NOTICE,
  VERIFIED_WORK_LINK_PUBLIC_NOTICE,
} from "./verified-copy";

const BLOCKED_STATUSES: ReadonlySet<WorkLinkReviewStatus> = new Set([
  "draft",
  "needs_review",
  "stale",
  "retired",
  "rejected",
]);

const PLANNER_READY_STATUSES: ReadonlySet<WorkLinkReviewStatus> = new Set([
  "verified",
  "published",
]);

/** Public display blocked even when published (PR-BS-15 §6, PR-BS-17 payment gate). */
export const PUBLIC_BLOCKED_INFO_TYPES: ReadonlySet<WorkLinkInfoType> = new Set([
  "paymentInfo",
  "insurerSystem",
]);

export const PUBLIC_PROJECTION_FIELDS = [
  "id",
  "title",
  "insurerName",
  "infoType",
  "targetUrl",
  "officialSourceUrl",
  "sourceLabel",
  "lastVerifiedAt",
  "riskLevel",
  "displayNotice",
] as const;

function hasVerifiedDate(candidate: WorkLinkReviewCandidate): boolean {
  return Boolean(candidate.lastVerifiedAt?.trim());
}

function hasOfficialSource(candidate: WorkLinkReviewCandidate): boolean {
  return Boolean(candidate.officialSourceUrl?.trim());
}

function isBaseEligible(candidate: WorkLinkReviewCandidate): boolean {
  if (BLOCKED_STATUSES.has(candidate.reviewStatus)) return false;
  if (!hasOfficialSource(candidate)) return false;
  if (!hasVerifiedDate(candidate)) return false;
  return true;
}

export function isWorkLinkPublicVisible(candidate: WorkLinkReviewCandidate): boolean {
  if (isPaymentInfoHighRiskType(candidate.infoType)) return false;
  if (!isBaseEligible(candidate)) return false;
  if (candidate.reviewStatus !== "published") return false;
  if (candidate.visibilityScope !== "public") return false;
  if (PUBLIC_BLOCKED_INFO_TYPES.has(candidate.infoType)) return false;
  return true;
}

export function isWorkLinkPlannerVisible(candidate: WorkLinkReviewCandidate): boolean {
  if (isPaymentInfoHighRiskType(candidate.infoType)) {
    return isPaymentInfoPlannerCandidate(candidate);
  }
  if (!isBaseEligible(candidate)) return false;
  if (!PLANNER_READY_STATUSES.has(candidate.reviewStatus)) return false;
  if (candidate.visibilityScope !== "planner" && candidate.visibilityScope !== "public") {
    return false;
  }
  return true;
}

function buildDisplayNotice(candidate: WorkLinkReviewCandidate): string {
  if (isPaymentInfoHighRiskType(candidate.infoType)) {
    return buildPaymentInfoDisplayNotice();
  }
  const parts = [VERIFIED_WORK_LINK_PUBLIC_NOTICE];
  if (isHighRiskInfoType(candidate.infoType)) {
    parts.push(VERIFIED_WORK_LINK_HIGH_RISK_NOTICE);
  }
  if (candidate.infoType === "claimGuide" || candidate.infoType === "claimDocument") {
    parts.push(VERIFIED_WORK_LINK_PUBLIC_DETAIL_NOTICE);
  }
  return parts.join(" ");
}

export function projectToPublicVerifiedView(
  candidate: WorkLinkReviewCandidate,
): PublicVerifiedWorkLinkView | null {
  if (!isWorkLinkPublicVisible(candidate)) return null;

  const officialSourceUrl = candidate.officialSourceUrl!.trim();
  const lastVerifiedAt = candidate.lastVerifiedAt!.trim();

  return {
    id: candidate.id,
    title: candidate.title,
    insurerName: candidate.insurerName,
    infoType: candidate.infoType,
    targetUrl: candidate.targetUrl,
    officialSourceUrl,
    sourceLabel: candidate.sourceLabel,
    lastVerifiedAt,
    riskLevel: candidate.riskLevel,
    displayNotice: buildDisplayNotice(candidate),
  };
}

export function projectToPlannerVerifiedView(
  candidate: WorkLinkReviewCandidate,
): PlannerVerifiedWorkLinkView | null {
  if (!isWorkLinkPlannerVisible(candidate)) return null;

  const officialSourceUrl = candidate.officialSourceUrl!.trim();
  const lastVerifiedAt = candidate.lastVerifiedAt!.trim();

  return {
    id: candidate.id,
    title: candidate.title,
    insurerName: candidate.insurerName,
    infoType: candidate.infoType,
    targetUrl: candidate.targetUrl,
    officialSourceUrl,
    sourceLabel: candidate.sourceLabel,
    lastVerifiedAt,
    riskLevel: candidate.riskLevel,
    displayNotice: buildDisplayNotice(candidate),
    plannerNotice: `${VERIFIED_WORK_LINK_PLANNER_NOTICE} ${VERIFIED_WORK_LINK_PLANNER_PII_NOTICE}`,
  };
}

export function listPublicVerifiedWorkLinks(
  candidates: readonly WorkLinkReviewCandidate[],
  options?: { insurerName?: string; query?: string },
): PublicVerifiedWorkLinkView[] {
  let filtered = candidates.filter(isWorkLinkPublicVisible);

  const insurer = options?.insurerName?.trim();
  if (insurer) {
    const norm = insurer.toLowerCase();
    filtered = filtered.filter((c) => c.insurerName.toLowerCase().includes(norm));
  }

  const query = options?.query?.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.insurerName.toLowerCase().includes(query) ||
        c.infoType.toLowerCase().includes(query),
    );
  }

  return filtered
    .map(projectToPublicVerifiedView)
    .filter((item): item is PublicVerifiedWorkLinkView => item !== null);
}

export function listPlannerVerifiedWorkLinks(
  candidates: readonly WorkLinkReviewCandidate[],
  options?: { insurerName?: string; query?: string },
): PlannerVerifiedWorkLinkView[] {
  let filtered = candidates.filter(isWorkLinkPlannerVisible);

  const insurer = options?.insurerName?.trim();
  if (insurer) {
    const norm = insurer.toLowerCase();
    filtered = filtered.filter((c) => c.insurerName.toLowerCase().includes(norm));
  }

  const query = options?.query?.trim().toLowerCase();
  if (query) {
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.insurerName.toLowerCase().includes(query) ||
        c.infoType.toLowerCase().includes(query),
    );
  }

  return filtered
    .map(projectToPlannerVerifiedView)
    .filter((item): item is PlannerVerifiedWorkLinkView => item !== null);
}

export function assertNoAdminFieldsInProjection(
  projection: Record<string, unknown>,
): boolean {
  for (const field of WORK_LINK_ADMIN_ONLY_FIELDS) {
    if (field in projection) return false;
  }
  if ("reviewStatus" in projection || "visibilityScope" in projection) return false;
  if ("adminMemo" in projection || "reviewNotePrivate" in projection) return false;
  return true;
}
