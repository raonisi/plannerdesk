import Link from "next/link";
import { ExternalTabAnchor, StatusBadge } from "@/components/content-page";
import { categoryLabels } from "@/lib/claim-documents/category-labels";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import type { VerificationStatus as ClientVerificationStatus } from "@/lib/content";

export function ClaimFormListItem({ item }: { item: ClaimLibraryItem }) {
  if (item.kind === "pdf") {
    return (
      <li className="border-t border-[#e3d5b8] first:border-t-0">
        <div className="flex min-h-11 flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#d9c9a8] bg-white px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
                {item.categoryLabel}
              </span>
              <StatusBadge
                status={item.verificationStatus as ClientVerificationStatus}
              />
            </div>
            <p className="mt-2 break-keep text-base font-semibold leading-6 text-[#102235]">
              {item.title}
            </p>
          </div>
          <ExternalTabAnchor
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start border border-[#173f36] px-4 py-2.5 text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
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
    <li className="border-t border-[#e3d5b8] first:border-t-0">
      <div className="flex min-h-11 flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              {categoryLabels[doc.category]}
            </span>
            <StatusBadge
              status={doc.verificationStatus as ClientVerificationStatus}
            />
          </div>
          <p className="mt-2 break-keep text-base font-semibold leading-6 text-[#102235]">
            {doc.title}
          </p>
          {doc.summary ? (
            <p className="mt-1 break-keep text-sm leading-6 text-[#5f6670]">
              {doc.summary}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          {primaryHref ? (
            <ExternalTabAnchor
              className="inline-flex min-h-11 items-center justify-center border border-[#173f36] px-4 py-2.5 text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
              href={primaryHref}
            >
              {primaryLabel} 열기
            </ExternalTabAnchor>
          ) : (
            <Link
              className="inline-flex min-h-11 items-center justify-center border border-[#173f36] bg-white px-4 py-2.5 text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
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
