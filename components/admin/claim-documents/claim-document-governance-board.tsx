"use client";

import { useMemo, useState, useEffect } from "react";
import { CLAIM_DOCUMENT_GOVERNANCE_EMPTY_FILTER_MESSAGE } from "@/lib/claim-documents/governance-defaults";
import {
  computeClaimDocumentGovernancePaginationMeta,
  computeClaimDocumentGovernanceSummary,
  DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS,
  filterClaimDocumentGovernanceItems,
  MOBILE_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  paginateClaimDocumentGovernanceItems,
} from "@/lib/claim-documents/governance-helpers";
import type {
  ClaimDocumentGovernanceFilters,
  ClaimDocumentWithGovernance,
} from "@/lib/claim-documents/governance-types";
import { ClaimDocumentGovernanceDetail } from "./claim-document-governance-detail";
import { ClaimDocumentGovernanceFilters as ClaimDocumentGovernanceFiltersPanel } from "./claim-document-governance-filters";
import { ClaimDocumentGovernanceMobileList } from "./claim-document-governance-mobile-list";
import { ClaimDocumentGovernancePagination } from "./claim-document-governance-pagination";
import { ClaimDocumentGovernanceSummary } from "./claim-document-governance-summary";
import { ClaimDocumentGovernanceTable } from "./claim-document-governance-table";

function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function ClaimDocumentGovernanceBoard({
  items,
}: {
  items: ClaimDocumentWithGovernance[];
}) {
  const [filters, setFilters] = useState(EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  );
  const [selectedItem, setSelectedItem] =
    useState<ClaimDocumentWithGovernance | null>(null);
  const isMobileViewport = useMobileViewport();

  const filteredItems = useMemo(
    () => filterClaimDocumentGovernanceItems(items, filters),
    [items, filters],
  );
  const summary = useMemo(
    () => computeClaimDocumentGovernanceSummary(items),
    [items],
  );

  const effectivePageSize = isMobileViewport
    ? MOBILE_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE
    : pageSize;

  const paginationMeta = useMemo(
    () =>
      computeClaimDocumentGovernancePaginationMeta(
        filteredItems.length,
        page,
        effectivePageSize,
      ),
    [filteredItems.length, page, effectivePageSize],
  );

  const paginatedItems = useMemo(
    () =>
      paginateClaimDocumentGovernanceItems(
        filteredItems,
        paginationMeta.page,
        effectivePageSize,
      ),
    [filteredItems, paginationMeta.page, effectivePageSize],
  );

  function handleFiltersChange(next: ClaimDocumentGovernanceFilters) {
    setFilters(next);
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <ClaimDocumentGovernanceSummary summary={summary} />
      <ClaimDocumentGovernanceFiltersPanel
        filters={filters}
        onChange={handleFiltersChange}
      />

      {filteredItems.length > 0 ? (
        <>
          <ClaimDocumentGovernanceTable
            items={paginatedItems}
            onSelect={setSelectedItem}
          />
          <ClaimDocumentGovernanceMobileList
            items={paginatedItems}
            onSelect={setSelectedItem}
          />
          <ClaimDocumentGovernancePagination
            meta={paginationMeta}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            pageSize={pageSize}
            showPageSizeSelector={!isMobileViewport}
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
