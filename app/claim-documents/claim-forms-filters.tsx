"use client";

import { VerificationStatus } from "@prisma/client";
import { SearchBar } from "@/components/content-page";

const statusOptions: Array<{ label: string; value: string }> = [
  { label: "전체", value: "all" },
  { label: "공식 확인 완료", value: VerificationStatus.verified },
  { label: "확인 진행 중", value: VerificationStatus.needs_review },
];

const natureOptions: Array<{ label: string; value: string }> = [
  { label: "전체", value: "all" },
  { label: "필수", value: "required" },
  { label: "추가", value: "optional" },
];

export function ClaimFormsFilters({
  query,
  category,
  status,
  documentNature,
  selectedInsurerKey,
  insurerOptions,
  categoryOptions,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
  onDocumentNatureChange,
  onInsurerChange,
  onReset,
}: {
  query: string;
  category: string;
  status: string;
  documentNature: string;
  selectedInsurerKey: string;
  insurerOptions: Array<{ key: string; label: string }>;
  categoryOptions: Array<{ label: string; value: string }>;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDocumentNatureChange: (value: string) => void;
  onInsurerChange: (value: string) => void;
  onReset: () => void;
}) {
  const advancedActive = status !== "all" || documentNature !== "all";

  return (
    <section
      aria-label="청구서류 검색 및 필터"
      className="rounded-xl border border-[#E3DED4] bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <label className="block min-w-0" htmlFor="claim-documents-search">
          <span className="text-sm font-bold text-[#0F1D2E]">통합 검색</span>
          <div className="mt-2">
            <SearchBar
              ariaLabel="보험사, 청구유형, 서류명 검색"
              id="claim-documents-search"
              onChange={onQueryChange}
              onClear={() => onQueryChange("")}
              placeholder="보험사, 청구유형, 서류명을 검색하세요"
              value={query}
            />
          </div>
        </label>

        <label className="block min-w-0">
          <span className="text-sm font-bold text-[#0F1D2E]">보험사 선택</span>
          <select
            aria-label="보험사 선택"
            className="mt-2 min-h-12 w-full min-w-0 rounded-lg border border-[#E3DED4] bg-white px-4 text-base text-[#18202b] outline-none transition focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#B9975B]/30"
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

      <div className="mt-5 flex flex-col gap-3 border-t border-[#E3DED4] pt-4 sm:flex-row sm:items-start sm:justify-between">
        <details className="min-w-0 flex-1 rounded-lg border border-[#E3DED4] bg-[#F8F7F3] p-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-bold text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            고급 필터
            {advancedActive ? (
              <span className="ml-2 rounded-full bg-[#0F1D2E] px-2 py-0.5 text-[11px] font-semibold text-white">
                적용 중
              </span>
            ) : null}
          </summary>
          <div className="mt-3 space-y-4">
            <FilterGroup
              label="서류 성격"
              onChange={onDocumentNatureChange}
              options={natureOptions}
              value={documentNature}
            />
            <FilterGroup
              label="확인 상태"
              onChange={onStatusChange}
              options={statusOptions}
              value={status}
            />
          </div>
        </details>

        <button
          aria-label="검색어 및 필터 초기화"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-4 text-sm font-bold text-[#303845] transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2"
          onClick={onReset}
          type="button"
        >
          필터 초기화
        </button>
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
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              aria-label={`${label} ${option.label}`}
              aria-pressed={isSelected}
              className={`min-h-11 rounded-full border px-3.5 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
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
