"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ExternalTabAnchor, formatVerifiedDate } from "@/components/content-page";
import {
  extractInsurerSearchTerm,
  publicDisclosureCategoryLabels,
} from "@/lib/public/disclosure-display";
import type { PublicDisclosureLink } from "@/lib/public/disclosure-links";
import { buttons, shadows } from "@/lib/design-system";

export function DisclosureCard({
  entry,
  onRequestCorrection,
}: {
  entry: PublicDisclosureLink;
  onRequestCorrection?: (insurerSearch: string) => void;
}) {
  const insurerTerm = extractInsurerSearchTerm(entry.title, entry.insurerName);
  const directoryHref = `/directory?search=${encodeURIComponent(insurerTerm)}`;
  const scopeLabel =
    entry.insurerName ??
    (entry.targetType === "regulator"
      ? "감독기관"
      : entry.targetType === "association"
        ? "협회"
        : "공통");

  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-[#E3DED4] bg-white p-5 ${shadows.card}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold text-[#B9975B]">
            {publicDisclosureCategoryLabels[entry.category]}
          </p>
          {entry.isOfficialSource ? (
            <span className="rounded-full border border-[#b9d5c9] bg-[#edf7f2] px-2 py-0.5 text-[10px] font-semibold text-[#1f6b55]">
              공식 출처
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 break-keep text-lg font-bold leading-snug text-[#0F1D2E]">
          {entry.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#5B6470]">{scopeLabel}</p>
        {entry.sourceName ? (
          <p className="mt-1 truncate text-xs text-[#5B6470]/90">
            출처: {entry.sourceName}
          </p>
        ) : null}
        <p className="mt-3 line-clamp-2 break-keep text-sm leading-relaxed text-[#5B6470]">
          {entry.description}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {entry.url ? (
          <ExternalTabAnchor
            aria-label={`${entry.title} 공식 출처 열기`}
            className={`${buttons.base} ${buttons.primary} w-full gap-2`}
            href={entry.url}
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            공식 출처 열기
          </ExternalTabAnchor>
        ) : (
          <p className="text-center text-xs text-[#5B6470]">공식 링크 준비 중</p>
        )}

        <div className="flex flex-wrap gap-2">
          {entry.insurerName ? (
            <Link
              className={`${buttons.base} ${buttons.outline} min-w-[8rem] flex-1 px-3 text-xs`}
              href={directoryHref}
            >
              관련 보험사 보기
            </Link>
          ) : null}
          {onRequestCorrection ? (
            <button
              type="button"
              aria-label={`${entry.title} 정보 수정 요청`}
              className={`${buttons.base} ${buttons.ghost} px-3 text-xs`}
              onClick={() => onRequestCorrection(insurerTerm)}
            >
              정보 수정 요청
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 flex flex-wrap gap-x-1.5 gap-y-0.5 border-t border-[#E3DED4] pt-3 text-[10px] leading-relaxed text-[#5B6470]">
        최근 확인일 {formatVerifiedDate(entry.lastVerifiedAt)}
        <span className="mx-1.5 text-[#E3DED4]">·</span>
        <span className="text-[#5B6470]/90">검수 완료</span>
      </p>
    </article>
  );
}
