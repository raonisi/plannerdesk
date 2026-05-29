"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/content-page";
import {
  buildCategoryFilterOptions,
  buildClaimLibraryItems,
  buildInsurerFilterOptions,
  filterClaimLibraryItems,
  groupFilteredClaimItems,
} from "@/lib/claim-documents/claim-library";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import { ClaimFormsFilters } from "./claim-forms-filters";
import { InsurerClaimGroup } from "./insurer-claim-group";

export function ClaimDocumentExplorer({
  documents,
}: {
  documents: PublicClaimDocument[];
}) {
  const searchParams = useSearchParams();
  const insurerFromQuery = searchParams.get("insurer");
  const searchFromQuery = searchParams.get("search");

  const [query, setQuery] = useState(() => searchFromQuery ?? "");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [documentNature, setDocumentNature] = useState<string>("all");
  const [selectedInsurerKey, setSelectedInsurerKey] = useState(
    () => insurerFromQuery ?? "all",
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  const allItems = useMemo(
    () => buildClaimLibraryItems(documents),
    [documents],
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
    selectedInsurerKey !== "all";

  const filteredItems = useMemo(
    () =>
      filterClaimLibraryItems(allItems, {
        query,
        category,
        status,
        documentNature,
        selectedInsurerKey,
      }),
    [allItems, category, documentNature, query, selectedInsurerKey, status],
  );

  const insurerGroups = useMemo(
    () => groupFilteredClaimItems(filteredItems),
    [filteredItems],
  );

  const totalItemCount = filteredItems.length;

  const isGroupExpanded = useCallback(
    (groupKey: string) => {
      if (hasActiveFilters) return true;
      return expandedKeys.has(groupKey);
    },
    [expandedKeys, hasActiveFilters],
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
    setSelectedInsurerKey("all");
    setExpandedKeys(new Set());
  }, []);

  return (
    <div className="space-y-6">
      <ClaimFormsFilters
        category={category}
        categoryOptions={categoryOptions}
        documentNature={documentNature}
        insurerOptions={insurerOptions}
        onCategoryChange={setCategory}
        onDocumentNatureChange={setDocumentNature}
        onInsurerChange={setSelectedInsurerKey}
        onQueryChange={setQuery}
        onReset={resetFilters}
        onStatusChange={setStatus}
        query={query}
        selectedInsurerKey={selectedInsurerKey}
        status={status}
      />

      <p className="rounded-xl border border-[#E3DED4] bg-[#F8F7F3] px-4 py-3 text-sm font-semibold leading-6 text-[#5B6470] break-keep">
        본 자료는 설계사 실무 참고용입니다. 최종 기준은 보험사 공식 안내와
        약관을 확인해 주세요.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-[#0F1D2E]">보험사별 청구서류</h2>
        <p
          aria-live="polite"
          className="text-sm font-semibold text-[#5f6670]"
          role="status"
        >
          총 {allItems.length}개 중 {totalItemCount}개 서류를 표시 중입니다.
        </p>
      </div>

      {insurerGroups.length > 0 ? (
        <div className="space-y-3">
          {insurerGroups.map((group) => (
            <InsurerClaimGroup
              group={group}
              isExpanded={isGroupExpanded(group.key)}
              key={group.key}
              onToggle={() => toggleGroup(group.key)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <EmptyState
            description="검색어를 줄이거나 필터를 초기화해보세요."
            title="조건에 맞는 청구서류가 없습니다."
          />
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
  );
}
