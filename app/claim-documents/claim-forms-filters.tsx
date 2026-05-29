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
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              서류 검색
            </span>
            <input
              className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137]"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="서류명, 보험사명, 설명, 청구 유형을 입력하세요"
              type="search"
              value={query}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              보험사 선택
            </span>
            <select
              className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition focus:border-[#aa8137]"
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

        <div className="grid gap-4">
          <FilterGroup
            label="청구 유형"
            onChange={onCategoryChange}
            options={categoryOptions}
            value={category}
          />
          <FilterGroup
            label="검수 상태"
            onChange={onStatusChange}
            options={statusOptions}
            value={status}
          />
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="mt-3 flex justify-end">
          <button
            className="min-h-9 shrink-0 rounded border border-[#d9c9a8] bg-white px-3 py-2 text-xs font-semibold text-[#303845] transition hover:border-[#aa8137] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
            onClick={onReset}
            type="button"
          >
            검색·필터 초기화
          </button>
        </div>
      ) : null}
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
    <fieldset>
      <legend className="text-sm font-semibold text-[#303845]">{label}</legend>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              className={`shrink-0 border px-3 py-2 text-sm font-semibold transition ${
                isSelected
                  ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee]"
                  : "border-[#d9c9a8] bg-white text-[#303845] hover:border-[#aa8137]"
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
