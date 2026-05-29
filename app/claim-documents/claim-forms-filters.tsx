"use client";

import { VerificationStatus } from "@prisma/client";
import { categoryOptions } from "@/lib/claim-documents/category-labels";

const statusOptions: Array<{ label: string; value: string }> = [
  { label: "전체", value: "all" },
  { label: "검수 완료", value: VerificationStatus.verified },
  { label: "검수 필요", value: VerificationStatus.needs_review },
];

export function ClaimFormsFilters({
  query,
  category,
  status,
  selectedInsurerKey,
  insurerOptions,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
  onInsurerChange,
  onReset,
  hasActiveFilters,
}: {
  query: string;
  category: string;
  status: string;
  selectedInsurerKey: string;
  insurerOptions: Array<{ key: string; label: string }>;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onInsurerChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <section
      aria-label="청구서류 검색 및 필터"
      className="rounded-xl border border-[#E3DED4] bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <label className="block min-w-0">
          <span className="text-sm font-bold text-[#0F1D2E]">통합 검색</span>
          <input
            aria-label="보험사명, 청구유형, 서류명 검색"
            className="mt-2 min-h-12 w-full min-w-0 rounded-lg border border-[#E3DED4] bg-white px-4 text-base text-[#18202b] outline-none transition placeholder:text-[#8A8F98] focus:border-[#B9975B] focus:ring-2 focus:ring-[#B9975B]/20"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="보험사, 청구유형, 서류명을 검색하세요"
            type="search"
            value={query}
          />
        </label>

        <label className="block min-w-0">
          <span className="text-sm font-bold text-[#0F1D2E]">보험사 선택</span>
          <select
            aria-label="보험사 선택"
            className="mt-2 min-h-12 w-full min-w-0 rounded-lg border border-[#E3DED4] bg-white px-4 text-base text-[#18202b] outline-none transition focus:border-[#B9975B] focus:ring-2 focus:ring-[#B9975B]/20"
            onChange={(event) => onInsurerChange(event.target.value)}
            value={selectedInsurerKey}
          >
            <option value="all">전체 보험사</option>
            <option value="common">공통 기준 서류</option>
            {insurerOptions.map((insurer) => (
              <option key={insurer.key} value={insurer.key}>
                {insurer.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5">
        <FilterGroup
          label="청구 유형"
          onChange={onCategoryChange}
          options={categoryOptions}
          value={category}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#E3DED4] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <details className="rounded-lg border border-[#E3DED4] bg-[#F8F7F3] p-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-bold text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 [&::-webkit-details-marker]:hidden">
            고급 필터
            {status !== "all" ? (
              <span className="ml-2 rounded-full bg-[#0F1D2E] px-2 py-0.5 text-[11px] text-white">
                검수 상태 적용
              </span>
            ) : null}
          </summary>
          <div className="mt-3">
            <FilterGroup
              label="검수 상태"
              onChange={onStatusChange}
              options={statusOptions}
              value={status}
            />
          </div>
        </details>

        {hasActiveFilters ? (
          <button
            className="min-h-11 shrink-0 rounded-lg border border-[#E3DED4] bg-white px-4 text-sm font-bold text-[#303845] transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25"
            onClick={onReset}
            type="button"
          >
            필터 초기화
          </button>
        ) : null}
      </div>
    </section>
  );
}

function FilterGroup({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-bold text-[#0F1D2E]">{label}</legend>
      <div className="mt-2 flex max-w-full flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              aria-pressed={isSelected}
              className={`min-h-10 rounded-full border px-3.5 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 ${
                isSelected
                  ? "border-[#0F1D2E] bg-[#0F1D2E] text-white"
                  : "border-[#E3DED4] bg-white text-[#5B6470] hover:border-[#B9975B] hover:text-[#0F1D2E]"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
