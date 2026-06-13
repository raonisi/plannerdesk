"use client";

import type { ClaimDocumentWithGovernance } from "@/lib/claim-documents/governance-types";
import {
  ClaimDocumentGovernanceLastVerifiedCell,
  ClaimDocumentGovernanceOfficialUrlCell,
  ClaimDocumentGovernancePdfActions,
  ClaimDocumentGovernanceStatusCell,
} from "./claim-document-governance-row";

const detailButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function ClaimDocumentGovernanceTable({
  items,
  onSelect,
}: {
  items: ClaimDocumentWithGovernance[];
  onSelect: (item: ClaimDocumentWithGovernance) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">보험사</th>
              <th className="px-4 py-3">문서명</th>
              <th className="px-4 py-3">PDF</th>
              <th className="px-4 py-3">공식 URL</th>
              <th className="px-4 py-3">검수일</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr className="align-top" key={item.governance.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.governance.insurerName}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="break-words font-medium text-slate-900">
                    {item.governance.documentTitle}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <ClaimDocumentGovernancePdfActions item={item} />
                </td>
                <td className="px-4 py-3">
                  <ClaimDocumentGovernanceOfficialUrlCell
                    officialSourceUrl={item.governance.officialSourceUrl}
                  />
                </td>
                <td className="px-4 py-3">
                  <ClaimDocumentGovernanceLastVerifiedCell
                    lastVerifiedAt={item.governance.lastVerifiedAt}
                  />
                </td>
                <td className="px-4 py-3">
                  <ClaimDocumentGovernanceStatusCell item={item} />
                </td>
                <td className="px-4 py-3">
                  <button
                    className={detailButtonClass}
                    onClick={() => onSelect(item)}
                    type="button"
                  >
                    상세 보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
