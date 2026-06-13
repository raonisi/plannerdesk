"use client";

import {
  CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE_OPTIONS,
  type ClaimDocumentGovernancePaginationMeta,
} from "@/lib/claim-documents/governance-helpers";

const navButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

const fieldClass =
  "min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function ClaimDocumentGovernancePagination({
  meta,
  onPageChange,
  pageSize,
  onPageSizeChange,
  showPageSizeSelector,
}: {
  meta: ClaimDocumentGovernancePaginationMeta;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector: boolean;
}) {
  const { totalItems, totalPages, page, rangeStart, rangeEnd } = meta;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  if (totalItems === 0) {
    return null;
  }

  return (
    <nav
      aria-label="청구서류 governance 페이지네이션"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-slate-600">
          전체 {totalItems.toLocaleString("ko-KR")}개 중{" "}
          {rangeStart.toLocaleString("ko-KR")}–{rangeEnd.toLocaleString("ko-KR")}
          개 표시
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {showPageSizeSelector ? (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="sr-only">페이지 크기</span>
              <select
                aria-label="페이지당 표시 개수"
                className={fieldClass}
                onChange={(event) =>
                  onPageSizeChange(Number(event.target.value))
                }
                value={pageSize}
              >
                {CLAIM_DOCUMENT_GOVERNANCE_PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}개
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            aria-label="처음 페이지"
            className={navButtonClass}
            disabled={isFirstPage}
            onClick={() => onPageChange(1)}
            type="button"
          >
            처음
          </button>
          <button
            aria-label="이전 페이지"
            className={navButtonClass}
            disabled={isFirstPage}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            이전
          </button>
          <span className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-slate-700">
            {page} / {totalPages}
          </span>
          <button
            aria-label="다음 페이지"
            className={navButtonClass}
            disabled={isLastPage}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            다음
          </button>
          <button
            aria-label="마지막 페이지"
            className={navButtonClass}
            disabled={isLastPage}
            onClick={() => onPageChange(totalPages)}
            type="button"
          >
            마지막
          </button>
        </div>
      </div>
    </nav>
  );
}
