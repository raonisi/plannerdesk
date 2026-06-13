"use client";

import { ExternalTabAnchor } from "@/components/content-page";
import {
  CLAIM_DOCUMENT_GOVERNANCE_LAST_VERIFIED_MISSING_LABEL,
  CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_MISSING_LABEL,
  CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_PRESENT_LABEL,
} from "@/lib/claim-documents/governance-defaults";
import type { ClaimDocumentWithGovernance } from "@/lib/claim-documents/governance-types";
import { ClaimDocumentGovernanceStatusBadge } from "./claim-document-governance-status-badge";

const actionButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function ClaimDocumentGovernancePdfActions({
  item,
}: {
  item: ClaimDocumentWithGovernance;
}) {
  const { governance, href } = item;

  return (
    <div className="flex flex-wrap gap-2">
      <a
        aria-label={`${governance.documentTitle} PDF 다운로드`}
        className={`${actionButtonClass} bg-slate-900 text-white hover:bg-slate-800`}
        download={governance.fileName}
        href={href}
      >
        PDF 다운로드
      </a>
      <ExternalTabAnchor
        aria-label={`${governance.documentTitle} PDF 바로 열기`}
        className={actionButtonClass}
        href={href}
      >
        PDF 바로 열기
      </ExternalTabAnchor>
    </div>
  );
}

export function ClaimDocumentGovernanceOfficialUrlCell({
  officialSourceUrl,
}: {
  officialSourceUrl?: string;
}) {
  if (officialSourceUrl) {
    return (
      <ExternalTabAnchor
        className="text-sm font-medium text-emerald-700 underline underline-offset-2"
        href={officialSourceUrl}
      >
        {CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_PRESENT_LABEL}
      </ExternalTabAnchor>
    );
  }

  return (
    <span className="text-sm text-slate-500">
      {CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_MISSING_LABEL}
    </span>
  );
}

export function ClaimDocumentGovernanceLastVerifiedCell({
  lastVerifiedAt,
}: {
  lastVerifiedAt?: string;
}) {
  return (
    <span className="text-sm text-slate-700">
      {lastVerifiedAt
        ? lastVerifiedAt.slice(0, 10)
        : CLAIM_DOCUMENT_GOVERNANCE_LAST_VERIFIED_MISSING_LABEL}
    </span>
  );
}

export function ClaimDocumentGovernanceVisibilityCell({
  isVisible,
}: {
  isVisible: boolean;
}) {
  return <span className="text-sm text-slate-700">{isVisible ? "표시" : "숨김"}</span>;
}

export function ClaimDocumentGovernanceDownloadCell({
  isDownloadEnabled,
}: {
  isDownloadEnabled: boolean;
}) {
  return (
    <span className="text-sm text-slate-700">
      {isDownloadEnabled ? "허용" : "비활성"}
    </span>
  );
}

export function ClaimDocumentGovernanceStatusCell({
  item,
}: {
  item: ClaimDocumentWithGovernance;
}) {
  return <ClaimDocumentGovernanceStatusBadge status={item.governance.reviewStatus} />;
}
