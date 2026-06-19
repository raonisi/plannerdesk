"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DisclosureLinkTargetType } from "@prisma/client";
import { EmptyState, SearchBar } from "@/components/content-page";
import { CategoryPillBar } from "@/components/launcher/category-pill-bar";
import { DisclosureCard } from "@/components/disclosure/disclosure-card";
import {
  matchesPublicDisclosureCategory,
  matchesPublicOfficialFilter,
  matchesPublicTargetType,
  publicDisclosureCategoryLabels,
  publicDisclosureCategoryOrder,
  publicDisclosureFilterTabs,
  publicTargetTypeLabels,
  type PublicDisclosureFilterTabId,
  type PublicOfficialFilter,
  type PublicTargetTypeFilter,
} from "@/lib/public/disclosure-display";
import type { PublicDisclosureLink } from "@/lib/public/disclosure-links";
import { sectionEyebrow } from "@/lib/design-system";
import {
  isInsurerDisclosureRoomCategory,
  matchesDisclosureRoomSearchQuery,
} from "@/lib/content/disclosure-room";

const targetTypeFilterOptions: Array<{ id: PublicTargetTypeFilter; label: string }> =
  [
    { id: "all", label: "전체" },
    ...Object.values(DisclosureLinkTargetType).map((value) => ({
      id: value as PublicTargetTypeFilter,
      label: publicTargetTypeLabels[value],
    })),
  ];

const officialFilterOptions: Array<{ id: PublicOfficialFilter; label: string }> =
  [
    { id: "all", label: "전체" },
    { id: "official", label: "공식 출처" },
    { id: "general", label: "일반" },
  ];

export function DisclosureLinkCenter({
  entries,
  onRequestCorrection,
}: {
  entries: PublicDisclosureLink[];
  onRequestCorrection?: (insurerSearch: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PublicDisclosureFilterTabId>("all");
  const [targetType, setTargetType] = useState<PublicTargetTypeFilter>("all");
  const [official, setOfficial] = useState<PublicOfficialFilter>("all");
  const [insurerFilter, setInsurerFilter] = useState<string>("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const insurerOptions = useMemo(() => {
    const names = new Set<string>();
    for (const entry of entries) {
      if (entry.insurerName) names.add(entry.insurerName);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ko-KR"));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return entries.filter((entry) => {
      const searchTarget = [
        entry.title,
        entry.description,
        entry.sourceName ?? "",
        entry.insurerName ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const searchFields = [
        entry.title,
        entry.description,
        entry.sourceName ?? "",
        entry.insurerName ?? "",
      ];

      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchTarget.includes(normalizedQuery) ||
        (isInsurerDisclosureRoomCategory(entry.category) &&
          matchesDisclosureRoomSearchQuery(
            normalizedQuery,
            entry.insurerName ?? entry.title,
            searchFields,
          ));
      const matchesCategoryFilter = matchesPublicDisclosureCategory(
        entry.category,
        category,
      );
      const matchesTarget = matchesPublicTargetType(entry.targetType, targetType);
      const matchesOfficial = matchesPublicOfficialFilter(
        entry.isOfficialSource,
        official,
      );
      const matchesInsurer =
        insurerFilter === "all" || entry.insurerName === insurerFilter;

      return (
        matchesQuery &&
        matchesCategoryFilter &&
        matchesTarget &&
        matchesOfficial &&
        matchesInsurer
      );
    });
  }, [category, entries, insurerFilter, official, query, targetType]);

  const groups = publicDisclosureCategoryOrder
    .map((categoryKey) => ({
      category: categoryKey,
      entries: filteredEntries.filter((entry) => entry.category === categoryKey),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <label className="block" htmlFor="disclosure-search">
          <span className="sr-only">공시·약관 검색</span>
          <SearchBar
            ariaLabel="제목, 설명, 출처명, 보험사명 검색"
            id="disclosure-search"
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="제목, 설명, 출처명, 보험사명 검색"
            value={query}
          />
        </label>

        <div>
          <p className={sectionEyebrow}>자료 분류</p>
          <div className="mt-2">
            <CategoryPillBar
              ariaLabel="자료 분류"
              categories={publicDisclosureFilterTabs}
              onSelect={(id) => setCategory(id as PublicDisclosureFilterTabId)}
              selectedId={category}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE]">
          <button
            type="button"
            aria-controls="disclosure-advanced-filter"
            aria-expanded={advancedOpen}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <span className="text-sm font-bold text-[#0F1D2E]">고급 필터</span>
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 text-[#B9975B] transition ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          {advancedOpen ? (
            <div
              className="space-y-4 border-t border-[#E3DED4] px-4 pb-4 pt-3"
              id="disclosure-advanced-filter"
            >
              <div>
                <p className="mb-2 text-xs text-[#4A5565]">대상 유형</p>
                <CategoryPillBar
                  ariaLabel="대상 유형"
                  categories={targetTypeFilterOptions}
                  onSelect={(id) => setTargetType(id as PublicTargetTypeFilter)}
                  selectedId={targetType}
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-[#4A5565]">공식 출처</p>
                <CategoryPillBar
                  ariaLabel="공식 출처"
                  categories={officialFilterOptions}
                  onSelect={(id) => setOfficial(id as PublicOfficialFilter)}
                  selectedId={official}
                />
              </div>
              {insurerOptions.length > 0 ? (
                <label className="block text-xs text-[#4A5565]">
                  보험사
                  <select
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm text-[#0F1D2E]"
                    value={insurerFilter}
                    onChange={(event) => setInsurerFilter(event.target.value)}
                  >
                    <option value="all">전체</option>
                    {insurerOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}
        </div>

        <p className="text-sm text-[#4A5565]">
          <span className="font-bold text-[#0F1D2E]">{filteredEntries.length}</span>
          개 공식 자료
        </p>
      </section>

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="text-base font-bold text-[#0F1D2E]">
                {publicDisclosureCategoryLabels[group.category]}
              </h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {group.entries.map((entry) => (
                  <DisclosureCard
                    entry={entry}
                    key={entry.id}
                    onRequestCorrection={onRequestCorrection}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          description="검색어를 줄이거나 자료 분류·고급 필터를 변경해 주세요."
          title="조건에 맞는 공식 자료가 없습니다."
        />
      )}
    </div>
  );
}
