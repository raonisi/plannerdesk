"use client";

import { useMemo, useState } from "react";
import { CLAIM_DOCUMENT_GOVERNANCE_EMPTY_FILTER_MESSAGE } from "@/lib/claim-documents/governance-defaults";
import {
  computeClaimDocumentGovernanceSummary,
  EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS,
  filterClaimDocumentGovernanceItems,
} from "@/lib/claim-documents/governance-helpers";
import type { ClaimDocumentWithGovernance } from "@/lib/claim-documents/governance-types";
import { ClaimDocumentGovernanceDetail } from "./claim-document-governance-detail";
import { ClaimDocumentGovernanceFilters } from "./claim-document-governance-filters";
import { ClaimDocumentGovernanceMobileList } from "./claim-document-governance-mobile-list";
import { ClaimDocumentGovernanceSummary } from "./claim-document-governance-summary";
import { ClaimDocumentGovernanceTable } from "./claim-document-governance-table";

export function ClaimDocumentGovernanceBoard({
  items,
}: {
  items: ClaimDocumentWithGovernance[];
}) {
  const [filters, setFilters] = useState(EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS);
  const [selectedItem, setSelectedItem] =
    useState<ClaimDocumentWithGovernance | null>(null);

  const filteredItems = useMemo(
    () => filterClaimDocumentGovernanceItems(items, filters),
    [items, filters],
  );
  const summary = useMemo(
    () => computeClaimDocumentGovernanceSummary(items),
    [items],
  );

  return (
    <div className="space-y-5">
      <ClaimDocumentGovernanceSummary summary={summary} />
      <ClaimDocumentGovernanceFilters filters={filters} onChange={setFilters} />

      {filteredItems.length > 0 ? (
        <>
          <ClaimDocumentGovernanceTable
            items={filteredItems}
            onSelect={setSelectedItem}
          />
          <ClaimDocumentGovernanceMobileList
            items={filteredItems}
            onSelect={setSelectedItem}
          />
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm leading-relaxed text-slate-600">
          {CLAIM_DOCUMENT_GOVERNANCE_EMPTY_FILTER_MESSAGE}
        </p>
      )}

      {selectedItem ? (
        <ClaimDocumentGovernanceDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </div>
  );
}
