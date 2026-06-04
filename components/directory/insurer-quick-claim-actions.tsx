"use client";

import Link from "next/link";
import { ExternalTabAnchor } from "@/components/content-page";
import { buttons } from "@/lib/design-system";
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
          aria-label={`${insurer.name} 청구안내 보기`}
          className={`${buttons.base} ${buttons.outline} w-full text-sm`}
          href={insurer.claimPageUrl}
        >
          청구안내 보기 ↗
        </ExternalTabAnchor>
      ) : (
        <button
          type="button"
          aria-label={`${insurer.name} 청구안내 펼치기`}
          className={`${buttons.base} ${buttons.outline} w-full text-sm`}
          onClick={onOpenClaimGuide}
        >
          청구안내 보기
        </button>
      )}
      <Link
        href={claimDocumentsHref}
        className={`${buttons.base} ${buttons.outline} w-full text-sm`}
      >
        {claimItemCount > 0
          ? `필요서류 확인 (${claimItemCount})`
          : "필요서류 확인"}
      </Link>
    </section>
  );
}
