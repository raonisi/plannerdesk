"use client";

import type { ClaimDocumentWithGovernance } from "@/lib/claim-documents/governance-types";
import {
  ClaimDocumentGovernanceLastVerifiedCell,
  ClaimDocumentGovernanceOfficialUrlCell,
  ClaimDocumentGovernancePdfActions,
  ClaimDocumentGovernanceStatusCell,
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
    <div className="space-y-2 lg:hidden">
      {items.map((item) => (
        <article
          className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          key={item.governance.id}
        >
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-500">
              {item.governance.insurerName}
            </p>
            <h3 className="break-words text-sm font-semibold text-slate-950">
              {item.governance.documentTitle}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">상태</span>
              <ClaimDocumentGovernanceStatusCell item={item} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">공식 URL</span>
              <ClaimDocumentGovernanceOfficialUrlCell
                officialSourceUrl={item.governance.officialSourceUrl}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">검수일</span>
              <ClaimDocumentGovernanceLastVerifiedCell
                lastVerifiedAt={item.governance.lastVerifiedAt}
              />
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
