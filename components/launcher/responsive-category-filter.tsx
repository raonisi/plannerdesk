"use client";

import { CategoryPillBar } from "@/components/launcher/category-pill-bar";
import { buttons } from "@/lib/design-system";

export type CategoryFilterOption = {
  id: string;
  label: string;
};

export function ResponsiveCategoryFilter({
  categories,
  selectedId,
  onSelect,
  ariaLabel = "카테고리 필터",
  selectId,
  totalCount,
  visibleCount,
  searchQuery = "",
  onReset,
  resetDisabled = false,
  resultNoun = "항목",
}: {
  categories: ReadonlyArray<CategoryFilterOption>;
  selectedId: string;
  onSelect: (id: string) => void;
  ariaLabel?: string;
  selectId: string;
  totalCount: number;
  visibleCount: number;
  searchQuery?: string;
  onReset?: () => void;
  resetDisabled?: boolean;
  resultNoun?: string;
}) {
  const selectedLabel =
    categories.find((category) => category.id === selectedId)?.label ?? "전체";
  const trimmedQuery = searchQuery.trim();
  const hasSearch = trimmedQuery.length > 0;
  const hasCategoryFilter = selectedId !== "all";
  const showReset = Boolean(onReset) && (hasCategoryFilter || hasSearch);

  return (
    <div className="space-y-2">
      <div className="lg:hidden">
        <label className="block" htmlFor={selectId}>
          <span className="text-xs font-bold text-[#4A5565]">{ariaLabel}</span>
          <select
            id={selectId}
            aria-label={ariaLabel}
            value={selectedId}
            onChange={(event) => onSelect(event.target.value)}
            className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-[#E3DED4] bg-white px-3 py-2 text-sm font-semibold text-[#0F1D2E] outline-none focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/15"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E3DED4]/80 bg-[#F8F7F3] px-3 py-2"
          aria-live="polite"
        >
          <div className="min-w-0 text-sm text-[#4A5565]">
            <p>
              <span className="font-bold text-[#0F1D2E]">선택한 카테고리:</span>{" "}
              {selectedLabel}
            </p>
            {hasSearch ? (
              <p className="mt-0.5 truncate">
                <span className="font-bold text-[#0F1D2E]">검색 결과:</span>{" "}
                {trimmedQuery}
              </p>
            ) : null}
            <p className="mt-0.5">
              총 {totalCount}개 중 {visibleCount}개 {resultNoun}
            </p>
          </div>
          {showReset ? (
            <button
              type="button"
              disabled={resetDisabled}
              onClick={onReset}
              className={`${buttons.base} ${buttons.outline} min-h-11 shrink-0 px-3 text-xs`}
            >
              필터 초기화
            </button>
          ) : null}
        </div>
      </div>

      <div className="hidden lg:block space-y-2">
        <CategoryPillBar
          ariaLabel={ariaLabel}
          categories={categories}
          onSelect={onSelect}
          selectedId={selectedId}
        />
        <div
          className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#4A5565]"
          aria-live="polite"
        >
          <p>
            <span className="font-bold text-[#0F1D2E]">{selectedLabel}</span>
            {hasSearch ? (
              <>
                {" · "}
                <span className="font-bold text-[#0F1D2E]">검색</span>{" "}
                {trimmedQuery}
              </>
            ) : null}
            {" · "}총 {totalCount}개 중 {visibleCount}개 {resultNoun}
          </p>
          {showReset ? (
            <button
              type="button"
              disabled={resetDisabled}
              onClick={onReset}
              className={`${buttons.base} ${buttons.outline} min-h-10 px-3 text-xs`}
            >
              필터 초기화
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
