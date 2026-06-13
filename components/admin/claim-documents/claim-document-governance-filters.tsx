"use client";

import { useState } from "react";
import type {
  ClaimDocumentGovernanceFilters,
  ClaimDocumentReviewStatus,
} from "@/lib/claim-documents/governance-types";
import { CLAIM_DOCUMENT_REVIEW_STATUS_LABELS } from "@/lib/claim-documents/governance-defaults";

const REVIEW_STATUS_OPTIONS: Array<ClaimDocumentReviewStatus | "all"> = [
  "all",
  "unknown",
  "verified",
  "needs_review",
  "outdated",
  "hidden",
];

const fieldClass =
  "min-h-[44px] w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

const buttonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export function ClaimDocumentGovernanceFilters({
  filters,
  onChange,
  onReset,
  resultCount,
}: {
  filters: ClaimDocumentGovernanceFilters;
  onChange: (next: ClaimDocumentGovernanceFilters) => void;
  onReset: () => void;
  resultCount: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <section
      aria-label="청구서류 governance 필터"
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">목록 필터</p>
        <p className="text-xs text-slate-500">
          필터 결과 {resultCount.toLocaleString("ko-KR")}건
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-insurer">
            보험사명
          </label>
          <input
            aria-label="보험사명 검색"
            className={fieldClass}
            id="governance-insurer"
            onChange={(event) =>
              onChange({ ...filters, insurerQuery: event.target.value })
            }
            placeholder="보험사명 검색"
            type="search"
            value={filters.insurerQuery}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-document">
            문서명
          </label>
          <input
            aria-label="문서명 검색"
            className={fieldClass}
            id="governance-document"
            onChange={(event) =>
              onChange({ ...filters, documentQuery: event.target.value })
            }
            placeholder="문서명 검색"
            type="search"
            value={filters.documentQuery}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-status">
            상태
          </label>
          <select
            aria-label="검수 상태 필터"
            className={fieldClass}
            id="governance-status"
            onChange={(event) =>
              onChange({
                ...filters,
                reviewStatus: event.target.value as ClaimDocumentGovernanceFilters["reviewStatus"],
              })
            }
            value={filters.reviewStatus}
          >
            {REVIEW_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === "all"
                  ? "전체"
                  : CLAIM_DOCUMENT_REVIEW_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-official-url">
            공식 URL
          </label>
          <select
            aria-label="공식 URL 유무 필터"
            className={fieldClass}
            id="governance-official-url"
            onChange={(event) =>
              onChange({
                ...filters,
                officialUrl: event.target.value as ClaimDocumentGovernanceFilters["officialUrl"],
              })
            }
            value={filters.officialUrl}
          >
            <option value="all">전체</option>
            <option value="present">등록</option>
            <option value="missing">미등록</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          aria-expanded={showAdvanced}
          className={buttonClass}
          onClick={() => setShowAdvanced((current) => !current)}
          type="button"
        >
          {showAdvanced ? "고급 필터 닫기" : "고급 필터 열기"}
        </button>
        <button className={buttonClass} onClick={onReset} type="button">
          필터 초기화
        </button>
      </div>

      {showAdvanced ? (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-last-verified">
              검수일
            </label>
            <select
              aria-label="검수일 유무 필터"
              className={fieldClass}
              id="governance-last-verified"
              onChange={(event) =>
                onChange({
                  ...filters,
                  lastVerified: event.target.value as ClaimDocumentGovernanceFilters["lastVerified"],
                })
              }
              value={filters.lastVerified}
            >
              <option value="all">전체</option>
              <option value="present">등록</option>
              <option value="missing">미등록</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-visibility">
              노출
            </label>
            <select
              aria-label="노출 여부 필터"
              className={fieldClass}
              id="governance-visibility"
              onChange={(event) =>
                onChange({
                  ...filters,
                  visibility: event.target.value as ClaimDocumentGovernanceFilters["visibility"],
                })
              }
              value={filters.visibility}
            >
              <option value="all">전체</option>
              <option value="visible">표시</option>
              <option value="hidden">숨김</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600" htmlFor="governance-download">
              다운로드
            </label>
            <select
              aria-label="다운로드 허용 여부 필터"
              className={fieldClass}
              id="governance-download"
              onChange={(event) =>
                onChange({
                  ...filters,
                  download: event.target.value as ClaimDocumentGovernanceFilters["download"],
                })
              }
              value={filters.download}
            >
              <option value="all">전체</option>
              <option value="enabled">허용</option>
              <option value="disabled">비활성</option>
            </select>
          </div>
        </div>
      ) : null}
    </section>
  );
}
