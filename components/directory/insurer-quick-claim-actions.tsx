"use client";

import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { buttons } from "@/lib/design-system";
import { WORK_LINK_ACTION_LABELS } from "@/lib/directory/work-links";
import type { PublicInsurer } from "@/lib/public/insurers";

export function InsurerQuickClaimActions({
  insurer,
  claimItemCount,
  onOpenClaimGuide,
}: {
  insurer: PublicInsurer;
  claimItemCount: number;
  onOpenClaimGuide: () => void;
}) {
  const claimDocumentsHref = `/claim-documents?insurer=${encodeURIComponent(insurer.id)}`;

  return (
    <section
      aria-label={`${insurer.name} 청구 업무 바로가기`}
      className="grid gap-2 sm:grid-cols-2"
    >
      {insurer.claimPageUrl ? (
        <ExternalTabAnchor
          aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.claimGuide}`}
          className={`${buttons.base} ${buttons.outline} w-full text-sm`}
          href={insurer.claimPageUrl}
        >
          {WORK_LINK_ACTION_LABELS.claimGuide} ↗
        </ExternalTabAnchor>
      ) : (
        <button
          type="button"
          aria-label={`${insurer.name} ${WORK_LINK_ACTION_LABELS.claimGuide}`}
          className={`${buttons.base} ${buttons.outline} w-full text-sm`}
          onClick={onOpenClaimGuide}
        >
          {WORK_LINK_ACTION_LABELS.claimGuide}
        </button>
      )}
      <Link
        href={claimDocumentsHref}
        className={`${buttons.base} ${buttons.outline} w-full text-sm`}
      >
        {claimItemCount > 0
          ? `${WORK_LINK_ACTION_LABELS.claimDocuments} (${claimItemCount})`
          : WORK_LINK_ACTION_LABELS.claimDocuments}
      </Link>
    </section>
  );
}
