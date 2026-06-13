"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ExternalTabAnchor } from "@/components/content-page";
import { ClaimFormListItem } from "@/components/claim-documents/claim-form-list-item";
import {
  CLAIM_INSURER_CARD_EMPTY_MESSAGE,
  CLAIM_INSURER_CARD_NOTICE,
} from "@/lib/claim-documents/claim-pdf-governance";
import type { ClaimLibraryItem } from "@/lib/claim-documents/library-items";
import { buttons } from "@/lib/design-system";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerCardClaimDocumentsSection({
  insurer,
  claimItems,
  expanded,
  onExpandedChange,
}: {
  insurer: PublicInsurer;
  claimItems: ClaimLibraryItem[];
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = expanded !== undefined;
  const isOpen = isControlled ? expanded : internalOpen;
  const panelId = useId();
  const buttonId = useId();

  function setOpen(next: boolean) {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onExpandedChange?.(next);
  }

  const officialGuideHref =
    insurer.claimPageUrl ??
    insurer.claimFormUrl ??
    `/claim-documents?insurer=${encodeURIComponent(insurer.id)}`;

  return (
    <section aria-label={`${insurer.name} 청구 안내`} className="space-y-2">
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={`inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
          isOpen
            ? "border-[#B9975B] bg-[#F7F4EE] text-[#0F1D2E]"
            : "border-[#E3DED4] bg-white text-[#0F1D2E] hover:border-[#B9975B]"
        }`}
        id={buttonId}
        onClick={() => setOpen(!isOpen)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block break-keep">청구 안내</span>
          <span className="mt-0.5 block text-xs font-semibold text-[#5B6470]">
            청구서류 {claimItems.length}건
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-[#B9975B]">
          {isOpen ? "닫기 ▲" : "열기 ▼"}
        </span>
      </button>

      <div
        aria-labelledby={buttonId}
        className="rounded-xl border border-[#E3DED4] bg-[#F8F7F3] p-4 sm:p-5"
        hidden={!isOpen}
        id={panelId}
        role="region"
      >
        <p className="break-keep text-xs font-medium leading-5 text-[#5B6470]">
          {CLAIM_INSURER_CARD_NOTICE}
        </p>

        {claimItems.length > 0 ? (
          <ul className="mt-4 space-y-1 rounded-lg border border-[#E3DED4] bg-white px-3 sm:px-4">
            {claimItems.map((item) => (
              <ClaimFormListItem
                item={item}
                key={item.kind === "pdf" ? item.id : item.document.id}
                variant="accordion"
              />
            ))}
          </ul>
        ) : (
          <div className="mt-4 space-y-3 rounded-lg border border-dashed border-[#E3DED4] bg-white px-4 py-5 text-center">
            <p className="break-keep text-sm font-semibold leading-6 text-[#5B6470]">
              {CLAIM_INSURER_CARD_EMPTY_MESSAGE}
            </p>
            {insurer.claimPageUrl || insurer.claimFormUrl ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} 보험사 공식 안내 확인`}
                className={`${buttons.base} ${buttons.outline} w-full text-sm`}
                href={officialGuideHref}
              >
                보험사 공식 안내 확인 ↗
              </ExternalTabAnchor>
            ) : null}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className={`${buttons.base} ${buttons.ghost} text-xs`}
            href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
          >
            전체 청구서류 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
