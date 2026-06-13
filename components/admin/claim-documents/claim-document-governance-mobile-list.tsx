"use client";

import type { ClaimDocumentWithGovernance } from "@/lib/claim-documents/governance-types";
import {
  ClaimDocumentGovernanceDownloadCell,
  ClaimDocumentGovernanceLastVerifiedCell,
  ClaimDocumentGovernanceOfficialUrlCell,
  ClaimDocumentGovernancePdfActions,
  ClaimDocumentGovernanceStatusCell,
  ClaimDocumentGovernanceVisibilityCell,
} from "./claim-document-governance-row";

const detailButtonClass =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function ClaimDocumentGovernanceMobileList({
  items,
  onSelect,
}: {
  items: ClaimDocumentWithGovernance[];
  onSelect: (item: ClaimDocumentWithGovernance) => void;
}) {
  return (
    <div className="space-y-3 lg:hidden">
      {items.map((item) => (
        <article
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          key={item.governance.id}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {item.governance.insurerName}
            </p>
            <h3 className="break-words text-base font-semibold text-slate-950">
              {item.governance.documentTitle}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-slate-500">상태</p>
              <div className="mt-1">
                <ClaimDocumentGovernanceStatusCell item={item} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">공식 URL</p>
              <div className="mt-1">
                <ClaimDocumentGovernanceOfficialUrlCell
                  officialSourceUrl={item.governance.officialSourceUrl}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">검수일</p>
              <div className="mt-1">
                <ClaimDocumentGovernanceLastVerifiedCell
                  lastVerifiedAt={item.governance.lastVerifiedAt}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">노출 / 다운로드</p>
              <div className="mt-1 space-y-0.5">
                <ClaimDocumentGovernanceVisibilityCell
                  isVisible={item.governance.isVisible}
                />
                <ClaimDocumentGovernanceDownloadCell
                  isDownloadEnabled={item.governance.isDownloadEnabled}
                />
              </div>
            </div>
          </div>

          <ClaimDocumentGovernancePdfActions item={item} />

          <button
            className={detailButtonClass}
            onClick={() => onSelect(item)}
            type="button"
          >
            상세 보기
          </button>
        </article>
      ))}
    </div>
  );
}
