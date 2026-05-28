"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/content-page";
import {
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

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
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

  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    status !== "all" ||
    selectedInsurerKey !== "all";

  const filteredItems = useMemo(
    () =>
      filterClaimLibraryItems(allItems, {
        query,
        category,
        status,
        selectedInsurerKey,
      }),
    [allItems, category, query, selectedInsurerKey, status],
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
    setSelectedInsurerKey("all");
    setExpandedKeys(new Set());
  }, []);

  return (
    <div className="mt-8 space-y-6">
      <ClaimFormsFilters
        category={category}
        hasActiveFilters={hasActiveFilters}
        insurerOptions={insurerOptions}
        onCategoryChange={setCategory}
        onInsurerChange={setSelectedInsurerKey}
        onQueryChange={setQuery}
        onReset={resetFilters}
        onStatusChange={setStatus}
        query={query}
        selectedInsurerKey={selectedInsurerKey}
        status={status}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7a612d]">전체 검색</p>
          <h2 className="mt-1 break-keep text-2xl font-semibold text-[#102235]">
            보험사별 청구서류
          </h2>
          <p className="mt-2 break-keep text-sm leading-6 text-[#5f6670]">
            보험사 바로가기의 청구 안내와 같은 데이터를 전체 보험사 기준으로
            검색할 수 있습니다.
          </p>
        </div>
        <p className="whitespace-nowrap text-sm font-semibold text-[#5f6670]">
          {insurerGroups.length}개 보험사 · {totalItemCount}개 청구서류
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
        <EmptyState
          description="검색어를 줄이거나 청구 유형·보험사·검수 상태 필터를 변경해 주세요."
          title="조건에 맞는 청구서류가 없습니다."
        />
      )}
    </div>
  );
}
