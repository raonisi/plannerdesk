import type { ClaimDocumentReviewStatus } from "@/lib/claim-documents/governance-types";
import { CLAIM_DOCUMENT_REVIEW_STATUS_LABELS } from "@/lib/claim-documents/governance-defaults";

const STATUS_BADGE_CLASSES: Record<ClaimDocumentReviewStatus, string> = {
  unknown:
    "border border-slate-200 bg-slate-100 text-slate-600",
  verified:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  needs_review:
    "border border-amber-200 bg-amber-50 text-amber-700",
  outdated:
    "border border-orange-200 bg-orange-50 text-orange-700",
  hidden:
    "border border-slate-300 bg-slate-200 text-slate-700",
};

export function ClaimDocumentGovernanceStatusBadge({
  status,
}: {
  status: ClaimDocumentReviewStatus;
}) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[status]}`}
    >
      {CLAIM_DOCUMENT_REVIEW_STATUS_LABELS[status]}
    </span>
  );
}
