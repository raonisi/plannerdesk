"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ExternalTabAnchor, formatVerifiedDate } from "@/components/content-page";
import type { DisclosureLinkEntry } from "@/lib/content";
import {
  disclosureCategoryLabels,
  extractInsurerSearchTerm,
  verificationMetaLabel,
} from "@/lib/disclosure-display";
import { buttons, shadows } from "@/lib/design-system";

export function DisclosureCard({
  entry,
  onRequestCorrection,
}: {
  entry: DisclosureLinkEntry;
  onRequestCorrection?: (insurerSearch: string) => void;
}) {
  const insurerTerm = extractInsurerSearchTerm(entry.title);
  const directoryHref = `/directory?search=${encodeURIComponent(insurerTerm)}`;

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-[#E3DED4] bg-white p-5 ${shadows.card}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-[#B9975B]">
          {disclosureCategoryLabels[entry.category]}
        </p>
        <h3 className="mt-2 break-keep text-lg font-bold leading-snug text-[#0F1D2E]">
          {entry.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#5B6470]">{insurerTerm}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#5B6470] break-keep">
          {entry.description}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {entry.sourceUrl ? (
          <ExternalTabAnchor
            className={`${buttons.base} ${buttons.primary} w-full gap-2`}
            href={entry.sourceUrl}
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            공식 출처 열기
          </ExternalTabAnchor>
        ) : (
          <p className="text-center text-xs text-[#5B6470]">공식 링크 준비 중</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            className={`${buttons.base} ${buttons.outline} flex-1 min-w-[8rem] px-3 text-xs`}
            href={directoryHref}
          >
            관련 보험사 보기
          </Link>
          {onRequestCorrection ? (
            <button
              type="button"
              className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
              onClick={() => onRequestCorrection(insurerTerm)}
            >
              정보 수정 요청
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 border-t border-[#E3DED4] pt-3 text-[10px] leading-relaxed text-[#5B6470]">
        최근 확인일 {formatVerifiedDate(entry.lastVerifiedAt)}
        <span className="mx-1.5 text-[#E3DED4]">·</span>
        <span className="text-[#5B6470]/90">{verificationMetaLabel(entry.verificationStatus)}</span>
      </p>
    </article>
  );
}
