"use client";

import { borders, surfaces } from "@/lib/design-system";

export interface AdminBulkResultSummaryData {
  actionLabel: string;
  requested: number;
  succeeded: number;
  skipped: number;
  failed: number;
  preview: boolean;
  message: string;
}

export interface AdminBulkResultSummaryProps {
  result: AdminBulkResultSummaryData | null;
  onDismiss?: () => void;
}

export default function AdminBulkResultSummary({
  result,
  onDismiss,
}: AdminBulkResultSummaryProps) {
  if (!result) return null;

  const tone = result.failed > 0 ? "border-[#e8c4c4] bg-[#fdf2f2]" : "border-[#b9d5c9] bg-[#edf7f2]";

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${tone}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#102235]">
            {result.actionLabel} — {result.preview ? "미리보기 결과" : "작업 결과"}
          </p>
          <p className="mt-1 text-xs text-[#4f5661] leading-relaxed">{result.message}</p>
          <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <dt className="text-[#4f5661]">요청</dt>
              <dd className="font-semibold text-[#102235]">{result.requested}건</dd>
            </div>
            <div>
              <dt className="text-[#4f5661]">성공</dt>
              <dd className="font-semibold text-[#1f6b55]">{result.succeeded}건</dd>
            </div>
            <div>
              <dt className="text-[#4f5661]">건너뜀</dt>
              <dd className="font-semibold text-[#7b5b19]">{result.skipped}건</dd>
            </div>
            <div>
              <dt className="text-[#4f5661]">실패</dt>
              <dd className="font-semibold text-[#8b2e2e]">{result.failed}건</dd>
            </div>
          </dl>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className={`shrink-0 rounded border px-2 py-1 text-xs font-semibold ${surfaces.card} ${borders.subtle} text-[#102235] hover:bg-white`}
          >
            닫기
          </button>
        ) : null}
      </div>
    </div>
  );
}
