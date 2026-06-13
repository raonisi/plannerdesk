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
import {
  insurerCardClaimNotice,
  insurerCardClaimPanel,
  insurerCardClaimToggle,
  insurerCardOutlineButton,
  insurerCardSectionTitle,
  insurerCardSubtleButton,
} from "@/lib/directory/insurer-card-ui";
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
      <h3 className={insurerCardSectionTitle}>청구 안내</h3>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={insurerCardClaimToggle(isOpen)}
        id={buttonId}
        onClick={() => setOpen(!isOpen)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block break-words leading-snug">
            청구서류 · PDF 다운로드
          </span>
          <span className="mt-0.5 block text-xs font-medium text-emerald-700/80">
            청구서류 {claimItems.length}건 · 공식 안내 확인
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-emerald-700">
          {isOpen ? "닫기 ▲" : "열기 ▼"}
        </span>
      </button>

      <div
        aria-labelledby={buttonId}
        className={insurerCardClaimPanel}
        hidden={!isOpen}
        id={panelId}
        role="region"
      >
        {claimItems.length > 0 ? (
          <ul className="space-y-3">
            {claimItems.map((item) => (
              <ClaimFormListItem
                item={item}
                key={item.kind === "pdf" ? item.id : item.document.id}
                variant="card"
              />
            ))}
          </ul>
        ) : (
          <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 text-center">
            <p className="break-words text-sm font-medium leading-relaxed text-slate-600">
              {CLAIM_INSURER_CARD_EMPTY_MESSAGE}
            </p>
            {insurer.claimPageUrl || insurer.claimFormUrl ? (
              <ExternalTabAnchor
                aria-label={`${insurer.name} 보험사 공식 안내 확인`}
                className={insurerCardOutlineButton}
                href={officialGuideHref}
              >
                보험사 공식 안내 확인 ↗
              </ExternalTabAnchor>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            className={`${insurerCardSubtleButton} w-auto px-4 text-sm`}
            href={`/claim-documents?insurer=${encodeURIComponent(insurer.id)}`}
          >
            전체 청구서류 보기
          </Link>
        </div>

        <p className={insurerCardClaimNotice}>{CLAIM_INSURER_CARD_NOTICE}</p>
      </div>
    </section>
  );
}
