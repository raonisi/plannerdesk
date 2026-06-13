"use client";

import { useMemo, useState, useEffect } from "react";
import { CLAIM_DOCUMENT_GOVERNANCE_EMPTY_FILTER_MESSAGE } from "@/lib/claim-documents/governance-defaults";
import {
  applyClaimDocumentGovernancePriorityFilter,
  computeClaimDocumentGovernancePaginationMeta,
  computeClaimDocumentGovernancePriorityCounts,
  computeClaimDocumentGovernanceSummary,
  DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS,
  filterClaimDocumentGovernanceItems,
  MOBILE_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  paginateClaimDocumentGovernanceItems,
  type ClaimDocumentGovernancePriorityFilter,
} from "@/lib/claim-documents/governance-helpers";
import type {
  ClaimDocumentGovernanceFilters,
  ClaimDocumentWithGovernance,
} from "@/lib/claim-documents/governance-types";
import { ClaimDocumentGovernanceDetail } from "./claim-document-governance-detail";
import { ClaimDocumentGovernanceFilters as ClaimDocumentGovernanceFiltersPanel } from "./claim-document-governance-filters";
import { ClaimDocumentGovernanceMobileList } from "./claim-document-governance-mobile-list";
import { ClaimDocumentGovernancePagination } from "./claim-document-governance-pagination";
import {
  ClaimDocumentGovernancePriority,
  type ClaimDocumentGovernancePriorityAction,
} from "./claim-document-governance-priority";
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
  const [priorityFilter, setPriorityFilter] =
    useState<ClaimDocumentGovernancePriorityFilter | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE,
  );
  const [selectedItem, setSelectedItem] =
    useState<ClaimDocumentWithGovernance | null>(null);
  const isMobileViewport = useMobileViewport();

  const summary = useMemo(
    () => computeClaimDocumentGovernanceSummary(items),
    [items],
  );
  const priorityCounts = useMemo(
    () => computeClaimDocumentGovernancePriorityCounts(items),
    [items],
  );

  const filteredItems = useMemo(() => {
    const byFilters = filterClaimDocumentGovernanceItems(items, filters);
    return applyClaimDocumentGovernancePriorityFilter(byFilters, priorityFilter);
  }, [items, filters, priorityFilter]);

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
    setPriorityFilter(null);
    setPage(1);
  }

  function handleFiltersReset() {
    setFilters(EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS);
    setPriorityFilter(null);
    setPage(1);
  }

  function handlePriorityApply(action: ClaimDocumentGovernancePriorityAction) {
    setPage(1);
    setPriorityFilter(null);
    setFilters(EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS);

    if (action === "missingOfficialUrl") {
      setFilters({
        ...EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS,
        officialUrl: "missing",
      });
      return;
    }

    if (action === "missingLastVerified") {
      setFilters({
        ...EMPTY_CLAIM_DOCUMENT_GOVERNANCE_FILTERS,
        lastVerified: "missing",
      });
      return;
    }

    if (action === "needsReview") {
      setPriorityFilter("needsReview");
      return;
    }

    setPriorityFilter("hiddenOrRestricted");
  }

  function handlePageSizeChange(nextPageSize: number) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <ClaimDocumentGovernanceSummary summary={summary} />
      <ClaimDocumentGovernancePriority
        counts={priorityCounts}
        onApply={handlePriorityApply}
      />
      <ClaimDocumentGovernanceFiltersPanel
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
        resultCount={filteredItems.length}
      />

      {filteredItems.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">청구서류 목록</h2>
            <p className="text-xs text-slate-500">
              필터 결과 {filteredItems.length.toLocaleString("ko-KR")}건
            </p>
          </div>
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
