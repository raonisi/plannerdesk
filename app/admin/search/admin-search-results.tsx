"use client";

import Link from "next/link";
import type { AdminSearchResult } from "@/lib/search/types";
import { ADMIN_SEARCH_DOMAIN_LABEL } from "@/lib/search/admin-labels";
import { ADMIN_CORRECTION_SEARCH_WARNING } from "@/lib/search/admin-constants";
import { borders, shadows, surfaces } from "@/lib/design-system";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

function badgeClass(tone: "green" | "gold" | "gray" | "navy" | "red") {
  if (tone === "green") return `${badgeBase} border-[#b9d5c9] bg-[#edf7f2] text-[#1f6b55]`;
  if (tone === "gold") return `${badgeBase} border-[#d9c9a8] bg-[#f7f1e5] text-[#7b5b19]`;
  if (tone === "navy") return `${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`;
  if (tone === "red") return `${badgeBase} border-[#e8c4c4] bg-[#fdf2f2] text-[#8b2e2e]`;
  return `${badgeBase} border-[#d6d8dc] bg-[#f4f5f6] text-[#4f5661]`;
}

export function AdminSearchResultsList({
  results,
  total,
}: {
  results: AdminSearchResult[];
  total: number;
}) {
  const hasCorrection = results.some((r) => r.type === "correction_request");

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[#4f5661]" role="status">
        검색 결과 <strong className="text-[#102235]">{total}</strong>건
      </p>

      {hasCorrection ? (
        <p
          className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-xs leading-relaxed text-[#7b4b19]"
          role="note"
        >
          {ADMIN_CORRECTION_SEARCH_WARNING}
        </p>
      ) : null}

      <ul className="space-y-3">
        {results.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <AdminSearchResultCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminSearchResultCard({ item }: { item: AdminSearchResult }) {
  const isCorrection = item.type === "correction_request";
  const sensitive =
    isCorrection &&
    (item.containsSensitiveData || item.redactionRequired);

  return (
    <article
      className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4 sm:p-5`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={badgeClass("navy")}>
          {ADMIN_SEARCH_DOMAIN_LABEL[item.type]}
        </span>
        {item.status ? (
          <span className={badgeClass("gray")}>{item.status}</span>
        ) : null}
        {item.isPublished === true ? (
          <span className={badgeClass("green")}>공개</span>
        ) : null}
        {item.isPublished === false ? (
          <span className={badgeClass("gold")}>비공개</span>
        ) : null}
        {item.isInternalOnly ? (
          <span className={badgeClass("gold")}>내부 전용</span>
        ) : null}
        {item.sensitiveBadge ? (
          <span className={badgeClass("red")}>{item.sensitiveBadge}</span>
        ) : null}
        {item.riskBadge && !item.sensitiveBadge ? (
          <span className={badgeClass("gold")}>{item.riskBadge}</span>
        ) : null}
        {item.riskBadge && item.sensitiveBadge ? (
          <span className={badgeClass("gold")}>{item.riskBadge}</span>
        ) : null}
      </div>

      <h3 className="mt-3 break-words text-base font-semibold text-[#102235]">
        {item.title}
      </h3>

      {item.summary && !sensitive ? (
        <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[#4f5661]">
          {item.summary}
        </p>
      ) : null}

      {sensitive ? (
        <p className="mt-2 text-sm text-[#5f6670]">
          민감정보가 포함되었을 수 있어 미리보기를 제한합니다. 상세 화면에서
          최소한으로 확인하세요.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5f6670]">
        {item.categoryLabel ? <span>{item.categoryLabel}</span> : null}
        {item.sourceLabel ? <span>{item.sourceLabel}</span> : null}
        {item.updatedAt ? <span>수정 {item.updatedAt}</span> : null}
        {item.createdAt ? <span>접수 {item.createdAt}</span> : null}
      </div>

      <Link
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#102235] px-4 text-sm font-semibold text-white hover:bg-[#1b344e]"
        href={item.adminUrl}
      >
        {isCorrection ? "제보 상세" : "관리 화면"}
      </Link>
    </article>
  );
}
