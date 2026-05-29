import Link from "next/link";
import { ExternalTabAnchor, StatusBadge } from "@/components/content-page";
import { categoryLabels } from "@/lib/claim-documents/category-labels";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import type { VerificationStatus as ClientVerificationStatus } from "@/lib/content";

export function ClaimFormListItem({ item }: { item: ClaimLibraryItem }) {
  if (item.kind === "pdf") {
    return (
      <li className="border-t border-slate-200 first:border-t-0">
        <div className="flex min-h-11 flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500 rounded-md">
                {item.categoryLabel}
              </span>
              <StatusBadge
                status={item.verificationStatus as ClientVerificationStatus}
              />
            </div>
            <p className="mt-2 break-keep text-base font-bold leading-6 text-slate-900">
              {item.title}
            </p>
          </div>
          <ExternalTabAnchor
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            href={item.href}
          >
            PDF 열기
          </ExternalTabAnchor>
        </div>
      </li>
    );
  }

  const doc = item.document;
  const primaryHref = doc.claimFormUrl ?? doc.officialSourceUrl;
  const primaryLabel = doc.claimFormUrl ? "청구서 양식" : "공식 출처";

  return (
    <li className="border-t border-slate-200 first:border-t-0">
      <div className="flex min-h-11 flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 rounded-md">
              {categoryLabels[doc.category]}
            </span>
            <StatusBadge
              status={doc.verificationStatus as ClientVerificationStatus}
            />
          </div>
          <p className="mt-2 break-keep text-base font-bold leading-6 text-slate-900">
            {doc.title}
          </p>
          {doc.summary ? (
            <p className="mt-1 break-keep text-sm leading-6 text-slate-500">
              {doc.summary}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          {primaryHref ? (
            <ExternalTabAnchor
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              href={primaryHref}
            >
              {primaryLabel} 열기
            </ExternalTabAnchor>
          ) : (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              href="/claim-documents"
            >
              전체 청구서류 검색
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}
