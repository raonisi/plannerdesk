"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ClaimFormListItem } from "@/components/claim-documents/claim-form-list-item";
import { FreshnessBadge } from "@/components/content/freshness-badge";
import { CopyToast } from "@/components/ui/copy-toast";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { summarizeClaimItemsFreshness } from "@/lib/claim-documents/freshness-summary";
import { CLAIM_PDF_CAUTION_TEXT } from "@/lib/claim-documents/claim-pdf-governance";
import { insurerMarketSegmentLabel } from "@/lib/claim-documents/insurer-category";
import { COMMON_INSURER_KEY } from "@/lib/claim-documents/library-items";
import type { InsurerClaimGroup } from "@/lib/claim-documents/group-by-insurer";

export function InsurerClaimGroup({
  group,
  isExpanded,
  onToggle,
}: {
  group: InsurerClaimGroup;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { feedback, copyWithFeedback } = useCopyFeedback();
  const [copying, setCopying] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = `claim-group-panel-${group.key}`;
  const buttonId = `claim-group-button-${group.key}`;
  const officialGuideHref =
    group.directoryInsurerId
      ? `/directory?insurer=${encodeURIComponent(group.directoryInsurerId)}`
      : group.key === COMMON_INSURER_KEY
        ? "/directory"
        : `/directory?search=${encodeURIComponent(group.label)}`;
  const segmentLabel =
    group.key === COMMON_INSURER_KEY
      ? null
      : insurerMarketSegmentLabel(group.marketSegment);
  const groupFreshness = summarizeClaimItemsFreshness(group.items);

  async function handleCopyNotice(e: React.MouseEvent) {
    e.stopPropagation();
    const docList = group.items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.kind === "pdf" ? item.title : item.document.title}`,
      )
      .join("\n");
    const noticeText = `안녕하세요 고객님. [${group.label}] 보험금 청구에 필요한 서류 목록을 안내드립니다.\n\n${docList}\n\n서류 기준은 보험사 심사와 공식 안내에 따라 달라질 수 있습니다. 준비 전 해당 보험사 공식 안내를 함께 확인해 주세요. 보험금 지급 여부나 금액은 보험사 심사 후 결정됩니다.`;

    setCopying(true);
    try {
      await copyWithFeedback({
        text: noticeText,
        source: "claim-guide",
      });
    } finally {
      setCopying(false);
      copyButtonRef.current?.focus();
    }
  }

  return (
    <>
      <section className="rounded-xl border border-[#E3DED4] bg-white shadow-sm">
        <div className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <button
              aria-controls={panelId}
              aria-expanded={isExpanded}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
              id={buttonId}
              onClick={onToggle}
              type="button"
            >
              <span className="min-w-0 flex-1">
                <span className="block break-keep text-lg font-bold leading-snug text-[#0F1D2E]">
                  {group.label}
                </span>
                <span className="mt-1 block text-sm font-semibold text-[#4A5565]">
                  청구서류 {group.items.length}건
                  {segmentLabel ? ` · ${segmentLabel}` : ""}
                </span>
                <span className="mt-2 inline-flex">
                  <FreshnessBadge presentation={groupFreshness} />
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`inline-block shrink-0 text-[#B9975B] transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
          </div>

          <div className="grid gap-2 sm:flex sm:justify-end">
            <button
              ref={copyButtonRef}
              aria-busy={copying || undefined}
              aria-label={`${group.label} 청구 안내 복사`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#16382C] bg-[#16382C] px-4 text-sm font-bold text-white transition hover:bg-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
              disabled={copying}
              onClick={handleCopyNotice}
              title="고객에게 보낼 서류 목록 텍스트를 복사합니다"
              type="button"
            >
              {copying ? "복사 중…" : "안내 문구 복사"}
            </button>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E3DED4] bg-white px-4 text-sm font-bold text-[#0F1D2E] transition hover:border-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
              href={officialGuideHref}
            >
              청구안내 보기
            </Link>
          </div>
        </div>

        <div
          aria-labelledby={buttonId}
          hidden={!isExpanded}
          id={panelId}
          role="region"
        >
          <ul className="border-t border-[#E3DED4] px-4 sm:px-5">
            {group.items.map((item) => (
              <ClaimFormListItem
                item={item}
                key={getItemKey(item)}
                variant="accordion"
              />
            ))}
          </ul>
          <p className="border-t border-[#E3DED4] px-4 py-3 text-xs leading-5 text-[#4A5565] break-keep sm:px-5">
            {CLAIM_PDF_CAUTION_TEXT}
          </p>
        </div>
      </section>
      <CopyToast message={feedback?.message ?? null} variant={feedback?.variant} />
    </>
  );
}

function getItemKey(item: InsurerClaimGroup["items"][number]): string {
  return item.kind === "pdf" ? item.id : item.document.id;
}
