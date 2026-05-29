"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmptyState, SearchBar } from "@/components/content-page";
import { CategoryPillBar } from "@/components/launcher/category-pill-bar";
import { DisclosureCard } from "@/components/disclosure/disclosure-card";
import type { DisclosureLinkEntry, VerificationStatus } from "@/lib/content";
import {
  disclosureCategoryLabels,
  disclosureCategoryOrder,
  disclosureFilterTabs,
  matchesDisclosureCategory,
  type DisclosureFilterTabId,
} from "@/lib/disclosure-display";
import { sectionEyebrow } from "@/lib/design-system";

type StatusFilter = "all" | VerificationStatus;

const statusFilterOptions: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "전체" },
  { id: "verified", label: "확인됨" },
  { id: "needs_review", label: "재확인 권장" },
  { id: "draft", label: "준비 중" },
];

export function DisclosureLinkCenter({
  entries,
  onRequestCorrection,
}: {
  entries: DisclosureLinkEntry[];
  onRequestCorrection?: (insurerSearch: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DisclosureFilterTabId>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return entries.filter((entry) => {
      const searchTarget = [
        entry.title,
        disclosureCategoryLabels[entry.category],
        entry.description,
        entry.notes ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesCategoryFilter = matchesDisclosureCategory(
        entry.category,
        category
      );
      const matchesStatus =
        status === "all" || entry.verificationStatus === status;

      return matchesQuery && matchesCategoryFilter && matchesStatus;
    });
  }, [category, entries, query, status]);

  const groups = disclosureCategoryOrder
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
            onChange={setQuery}
            onClear={() => setQuery("")}
            placeholder="보험사명, 자료명, 약관, 상품공시 검색"
            value={query}
          />
        </label>

        <div>
          <p className={sectionEyebrow}>자료 분류</p>
          <div className="mt-2">
            <CategoryPillBar
              categories={disclosureFilterTabs}
              onSelect={(id) => setCategory(id as DisclosureFilterTabId)}
              selectedId={category}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE]">
          <button
            type="button"
            aria-expanded={advancedOpen}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 rounded-xl"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            <span className="text-sm font-bold text-[#0F1D2E]">고급 필터</span>
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 text-[#B9975B] transition ${advancedOpen ? "rotate-180" : ""}`}
            />
          </button>
          {advancedOpen ? (
            <div className="border-t border-[#E3DED4] px-4 pb-4 pt-3">
              <p className="text-xs text-[#5B6470] mb-2">확인 상태 (운영 참고)</p>
              <CategoryPillBar
                categories={statusFilterOptions}
                onSelect={(id) => setStatus(id as StatusFilter)}
                selectedId={status}
              />
            </div>
          ) : null}
        </div>

        <p className="text-sm text-[#5B6470]">
          <span className="font-bold text-[#0F1D2E]">{filteredEntries.length}</span>
          개 공식 자료
        </p>
      </section>

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="text-base font-bold text-[#0F1D2E]">
                {disclosureCategoryLabels[group.category]}
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
