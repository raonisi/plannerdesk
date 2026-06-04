"use client";

import { borders, surfaces } from "@/lib/design-system";

export interface AdminBulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export default function AdminBulkSelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  disabled = false,
}: AdminBulkSelectionBarProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border px-4 py-3 ${surfaces.inset} ${borders.subtle}`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#102235]">
          선택됨{" "}
          <span className="text-[#aa8137]">{selectedCount}</span>
          <span className="font-normal text-[#4f5661]"> / {totalCount}건</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || totalCount === 0 || allSelected}
            onClick={onSelectAll}
            className="rounded border border-[#d9c9a8] bg-white px-3 py-1.5 text-xs font-semibold text-[#102235] hover:bg-[#f4efe5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            현재 목록 선택
          </button>
          <button
            type="button"
            disabled={disabled || selectedCount === 0}
            onClick={onClearSelection}
            className="rounded border border-[#d9c9a8] bg-white px-3 py-1.5 text-xs font-semibold text-[#102235] hover:bg-[#f4efe5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            선택 해제
          </button>
        </div>
      </div>

      {selectedCount > 0 ? (
        <p className="text-xs leading-relaxed text-[#7b5b19]">
          선택한 {selectedCount}건에 일괄 작업이 적용됩니다. 대상 수와 검수·공개
          조건을 확인한 뒤 진행해 주세요.
        </p>
      ) : null}
    </div>
  );
}
