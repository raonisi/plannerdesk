"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/content-page";
import { BrowseNextSteps } from "@/components/search/browse-next-steps";
import {
  buildCategoryFilterOptions,
  buildClaimLibraryItems,
  buildInsurerFilterOptions,
  filterClaimLibraryItems,
  groupFilteredClaimItems,
} from "@/lib/claim-documents/claim-library";
import { CLAIM_PDF_GOVERNANCE_NOTICE } from "@/lib/claim-documents/claim-pdf-governance";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import { ClaimDocumentFavoritesStrip } from "@/components/planner-favorites/claim-document-favorites-strip";
import { PlannerFavoritesScope } from "@/components/planner-favorites/planner-favorites-scope";
import { ClaimFormsFilters } from "./claim-forms-filters";
import { InsurerClaimGroup } from "./insurer-claim-group";

export function ClaimDocumentExplorer({
  documents,
  plannerFavoritesEnabled = false,
}: {
  documents: PublicClaimDocument[];
  plannerFavoritesEnabled?: boolean;
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

  const selectedInsurerLabel = useMemo(() => {
    if (selectedInsurerKey === "all") return null;
    if (selectedInsurerKey === "common") return "공통 기준 서류";
    return (
      insurerOptions.find((option) => option.key === selectedInsurerKey)?.label ??
      null
    );
  }, [insurerOptions, selectedInsurerKey]);

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
          {CLAIM_PDF_GOVERNANCE_NOTICE} 공개 전 검수 중인 항목은 표시되지 않습니다.
        </p>

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
              description={
                selectedInsurerKey !== "all"
                  ? "다른 보험사를 선택하거나 필터를 초기화해 보세요. 보험사 디렉터리에서 청구안내·전산 링크도 확인할 수 있습니다."
                  : "보험사·청구유형·서류명을 다르게 입력하거나 필터를 초기화해 보세요."
              }
              title={
                selectedInsurerKey !== "all"
                  ? "등록된 청구서류가 없습니다."
                  : "조건에 맞는 청구서류가 없습니다."
              }
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
