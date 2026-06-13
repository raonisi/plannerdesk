"use client";

import { CLAIM_DOCUMENT_GOVERNANCE_PRIORITY_SECTION_TITLE } from "@/lib/claim-documents/governance-defaults";
import type { ClaimDocumentGovernancePriorityCounts } from "@/lib/claim-documents/governance-types";

const actionButtonClass =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

const PRIORITY_ITEMS = [
  {
    key: "missingOfficialUrl" as const,
    title: "공식 URL 미등록",
    description: "공식 확인 링크가 없는 문서",
    actionLabel: "URL 미등록만 보기",
    action: "missingOfficialUrl" as const,
  },
  {
    key: "missingLastVerified" as const,
    title: "검수일 미등록",
    description: "마지막 검수일이 없는 문서",
    actionLabel: "검수일 미등록만 보기",
    action: "missingLastVerified" as const,
  },
  {
    key: "needsReview" as const,
    title: "재검수 필요",
    description: "상태 확인이 필요한 문서",
    actionLabel: "재검수 필요만 보기",
    action: "needsReview" as const,
  },
  {
    key: "hiddenOrRestricted" as const,
    title: "숨김/다운로드 제한 예정",
    description: "노출·다운로드 제한이 설정된 문서",
    actionLabel: "제한 항목만 보기",
    action: "hiddenOrRestricted" as const,
  },
];

export type ClaimDocumentGovernancePriorityAction =
  (typeof PRIORITY_ITEMS)[number]["action"];

export function ClaimDocumentGovernancePriority({
  counts,
  onApply,
}: {
  counts: ClaimDocumentGovernancePriorityCounts;
  onApply: (action: ClaimDocumentGovernancePriorityAction) => void;
}) {
  return (
    <section
      aria-label={CLAIM_DOCUMENT_GOVERNANCE_PRIORITY_SECTION_TITLE}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2 className="text-sm font-semibold text-slate-900">
        {CLAIM_DOCUMENT_GOVERNANCE_PRIORITY_SECTION_TITLE}
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PRIORITY_ITEMS.map((item) => (
          <article
            className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
            key={item.key}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xl font-bold text-slate-950">
                {counts[item.key].toLocaleString("ko-KR")}
                <span className="ml-1 text-xs font-semibold text-slate-500">건</span>
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-500">
                {item.description}
              </p>
            </div>
            <button
              className={actionButtonClass}
              onClick={() => onApply(item.action)}
              type="button"
            >
              {item.actionLabel}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
