"use client";

import type { ReactNode } from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import {
  CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE,
  CLAIM_DOCUMENT_GOVERNANCE_LAST_VERIFIED_MISSING_LABEL,
  CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_MISSING_LABEL,
  CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_PRESENT_LABEL,
} from "@/lib/claim-documents/governance-defaults";
import type { ClaimDocumentWithGovernance } from "@/lib/claim-documents/governance-types";
import { ClaimDocumentGovernanceStatusBadge } from "./claim-document-governance-status-badge";

const actionButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-[120px_1fr] sm:gap-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function ClaimDocumentGovernanceDetail({
  item,
  onClose,
}: {
  item: ClaimDocumentWithGovernance;
  onClose: () => void;
}) {
  const { governance, href } = item;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        aria-labelledby="governance-detail-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg"
        role="dialog"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2
              className="break-words text-lg font-bold text-slate-950"
              id="governance-detail-title"
            >
              청구서류 상세 보기
            </h2>
            <p className="mt-1 text-sm text-slate-500">{governance.documentTitle}</p>
          </div>
          <button
            aria-label="상세 보기 닫기"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
            {CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE}
          </p>

          <dl className="mt-4">
            <DetailRow label="보험사" value={governance.insurerName} />
            <DetailRow label="문서명" value={governance.documentTitle} />
            <DetailRow label="파일명" value={governance.fileName} />
            <DetailRow label="파일 경로" value={governance.filePath} />
            <DetailRow
              label="공식 URL"
              value={
                governance.officialSourceUrl ? (
                  <ExternalTabAnchor
                    className="break-all text-emerald-700 underline underline-offset-2"
                    href={governance.officialSourceUrl}
                  >
                    {CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_PRESENT_LABEL} ↗
                  </ExternalTabAnchor>
                ) : (
                  CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_MISSING_LABEL
                )
              }
            />
            <DetailRow
              label="마지막 검수일"
              value={
                governance.lastVerifiedAt
                  ? governance.lastVerifiedAt.slice(0, 10)
                  : CLAIM_DOCUMENT_GOVERNANCE_LAST_VERIFIED_MISSING_LABEL
              }
            />
            <DetailRow
              label="검수 상태"
              value={<ClaimDocumentGovernanceStatusBadge status={governance.reviewStatus} />}
            />
            <DetailRow
              label="사용자 노출"
              value={governance.isVisible ? "표시" : "숨김"}
            />
            <DetailRow
              label="다운로드 허용"
              value={governance.isDownloadEnabled ? "허용" : "비활성"}
            />
            <DetailRow
              label="관리자 메모"
              value={governance.adminMemo?.trim() || "—"}
            />
          </dl>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
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
        </div>
      </div>
    </div>
  );
}
