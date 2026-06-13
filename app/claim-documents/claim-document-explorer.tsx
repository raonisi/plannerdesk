"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState, CollapsibleNotice } from "@/components/content-page";
import { BrowseNextSteps } from "@/components/search/browse-next-steps";
import {
  buildCategoryFilterOptions,
  buildClaimLibraryItems,
  buildInsurerFilterOptions,
  filterClaimLibraryItems,
  groupFilteredClaimItems,
  groupMatchesInsurerFilterKey,
} from "@/lib/claim-documents/claim-library";
import { CLAIM_PDF_ACCORDION_NOTICE } from "@/lib/claim-documents/claim-pdf-governance";
import type { InsurerClaimGroup } from "@/lib/claim-documents/group-by-insurer";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import type { PublicClaimPdfGovernanceOverlay } from "@/lib/claim-documents/governance-repository";
import { ClaimDocumentFavoritesStrip } from "@/components/planner-favorites/claim-document-favorites-strip";
import { PlannerFavoritesScope } from "@/components/planner-favorites/planner-favorites-scope";
import { ClaimFormsFilters } from "./claim-forms-filters";
import { InsurerClaimGroup as InsurerClaimGroupPanel } from "./insurer-claim-group";

const EMPTY_SEARCH_MESSAGE =
  "검색 결과가 없습니다. 보험사명 또는 서류명을 다시 확인해 주세요.";

export function ClaimDocumentExplorer({
  documents,
  plannerFavoritesEnabled = false,
  pdfGovernanceOverlay,
}: {
  documents: PublicClaimDocument[];
  plannerFavoritesEnabled?: boolean;
  pdfGovernanceOverlay?: PublicClaimPdfGovernanceOverlay | null;
}) {
  const searchParams = useSearchParams();
  const insurerFromQuery = searchParams.get("insurer");
  const searchFromQuery = searchParams.get("search");

  const [query, setQuery] = useState(() => searchFromQuery ?? "");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [documentNature, setDocumentNature] = useState<string>("all");
  const [marketSegment, setMarketSegment] = useState<string>("all");
  const [selectedInsurerKey, setSelectedInsurerKey] = useState(
    () => insurerFromQuery ?? "all",
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  const allItems = useMemo(
    () => buildClaimLibraryItems(documents, pdfGovernanceOverlay),
    [documents, pdfGovernanceOverlay],
  );

  const insurerOptions = useMemo(
    () => buildInsurerFilterOptions(allItems),
    [allItems],
  );

  const categoryOptions = useMemo(
    () => buildCategoryFilterOptions(allItems),
    [allItems],
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    status !== "all" ||
    documentNature !== "all" ||
    marketSegment !== "all" ||
    selectedInsurerKey !== "all";

  const filteredItems = useMemo(
    () =>
      filterClaimLibraryItems(allItems, {
        query,
        category,
        status,
        documentNature,
        selectedInsurerKey,
        marketSegment,
      }),
    [
      allItems,
      category,
      documentNature,
      marketSegment,
      query,
      selectedInsurerKey,
      status,
    ],
  );

  const insurerGroups = useMemo(
    () => groupFilteredClaimItems(filteredItems),
    [filteredItems],
  );

  const selectedInsurerLabel = useMemo(() => {
    if (selectedInsurerKey === "all") return null;
    if (selectedInsurerKey === "common") return "공통 기준 서류";
    return (
      insurerOptions.find((option) => option.key === selectedInsurerKey)?.label ??
      null
    );
  }, [insurerOptions, selectedInsurerKey]);

  const totalItemCount = filteredItems.length;

  const shouldAutoExpandGroup = useCallback(
    (group: InsurerClaimGroup) => {
      if (hasActiveFilters) return true;
      if (insurerGroups.length === 1) return true;
      if (groupMatchesInsurerFilterKey(group, selectedInsurerKey)) return true;
      return false;
    },
    [hasActiveFilters, insurerGroups.length, selectedInsurerKey],
  );

  const isGroupExpanded = useCallback(
    (group: InsurerClaimGroup) => {
      if (expandedKeys.has(group.key)) return true;
      return shouldAutoExpandGroup(group);
    },
    [expandedKeys, shouldAutoExpandGroup],
  );

  const toggleGroup = useCallback((groupKey: string) => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
    setStatus("all");
    setDocumentNature("all");
    setMarketSegment("all");
    setSelectedInsurerKey("all");
    setExpandedKeys(new Set());
  }, []);

  return (
    <PlannerFavoritesScope enabled={plannerFavoritesEnabled}>
      <div className="space-y-6">
        {plannerFavoritesEnabled ? (
          <ClaimDocumentFavoritesStrip items={allItems} />
        ) : null}
        <ClaimFormsFilters
          category={category}
          categoryOptions={categoryOptions}
          documentNature={documentNature}
          insurerOptions={insurerOptions}
          marketSegment={marketSegment}
          onCategoryChange={setCategory}
          onDocumentNatureChange={setDocumentNature}
          onInsurerChange={setSelectedInsurerKey}
          onMarketSegmentChange={setMarketSegment}
          onQueryChange={setQuery}
          onReset={resetFilters}
          onStatusChange={setStatus}
          query={query}
          selectedInsurerKey={selectedInsurerKey}
          status={status}
        />

        <CollapsibleNotice
          defaultOpen={false}
          summary="PDF 다운로드·공식 안내 사용 시 확인할 내용"
          title="청구서류 안내"
        >
          {CLAIM_PDF_ACCORDION_NOTICE}
        </CollapsibleNotice>

        {selectedInsurerLabel && selectedInsurerKey !== "all" ? (
          <section
            aria-label="선택한 보험사 안내"
            className="rounded-xl border border-[#d9c9a8] bg-[#fff9ed] px-4 py-3 text-sm leading-6 text-[#4f5661]"
          >
            <p>
              <span className="font-bold text-[#102235]">{selectedInsurerLabel}</span>
              {" "}기준으로 청구서류를 표시합니다.{" "}
              {selectedInsurerKey !== "common" ? (
                <Link
                  className="font-semibold text-[#7a612d] underline underline-offset-2"
                  href={`/directory?insurer=${encodeURIComponent(selectedInsurerKey)}`}
                >
                  청구안내·팩스/전산 정보 보기
                </Link>
              ) : (
                <Link
                  className="font-semibold text-[#7a612d] underline underline-offset-2"
                  href="/directory"
                >
                  보험사 디렉터리로 이동
                </Link>
              )}
            </p>
          </section>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[#0F1D2E]">보험사별 청구서류</h2>
          <p
            aria-live="polite"
            className="text-sm font-semibold text-[#5f6670]"
            role="status"
          >
            총 {allItems.length}개 중 {totalItemCount}개 서류 · {insurerGroups.length}개 보험사
          </p>
        </div>

        {insurerGroups.length > 0 ? (
          <div className="space-y-4">
            {insurerGroups.map((group) => (
              <InsurerClaimGroupPanel
                group={group}
                isExpanded={isGroupExpanded(group)}
                key={group.key}
                onToggle={() => toggleGroup(group.key)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <EmptyState
              description={EMPTY_SEARCH_MESSAGE}
              title="조건에 맞는 청구서류가 없습니다."
            />
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d9c9a8] bg-white px-5 text-sm font-bold text-[#0F1D2E] transition hover:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
                href="/directory"
              >
                보험사 디렉터리
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d9c9a8] bg-white px-5 text-sm font-bold text-[#0F1D2E] transition hover:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
                href="/search"
              >
                통합 검색
              </Link>
            </div>
            <BrowseNextSteps className="mt-2" title="관련 메뉴" />
            <div className="flex justify-center">
              <button
                aria-label="검색어 및 필터 초기화"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#0F1D2E] bg-[#0F1D2E] px-5 text-sm font-bold text-white transition hover:bg-[#16382C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2"
                onClick={resetFilters}
                type="button"
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}
      </div>
    </PlannerFavoritesScope>
  );
}
