import Link from "next/link";
import { PUBLIC_SEARCH_FILTER_OPTIONS } from "@/lib/search/labels";
import { buildPublicSearchHref } from "@/lib/search/search-href";
import type { PublicSearchDomain } from "@/lib/search/types";

const HUB_BY_DOMAIN: Partial<Record<Exclude<PublicSearchDomain, "all">, string>> = {
  insurer: "/directory",
  claim_document: "/claim-documents",
  knowledge_article: "/knowledge",
  disclosure_link: "/disclosure-links",
  message_template: "/message-templates",
  work_link: "/directory",
};

function filterHref(query: string, domain: PublicSearchDomain): string {
  if (query.trim()) {
    return buildPublicSearchHref(query, domain);
  }
  if (domain === "all") return "/search";
  return HUB_BY_DOMAIN[domain] ?? "/search";
}

export function SearchDomainFilter({
  query,
  activeDomain,
}: {
  query: string;
  activeDomain: PublicSearchDomain;
}) {
  const hasQuery = query.trim().length > 0;

  return (
    <div
      aria-label="도메인 필터"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible"
      role="group"
    >
      {PUBLIC_SEARCH_FILTER_OPTIONS.map((option) => {
        const isActive =
          activeDomain === option.domain ||
          (option.domain === "all" && activeDomain === "all");
        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition ${
              isActive
                ? "border-[#102235] bg-[#102235] text-white"
                : "border-[#d9c9a8] bg-white text-[#4f5661] hover:bg-[#f7f1e5]"
            }`}
            href={filterHref(query, option.domain)}
            key={option.param}
            title={
              hasQuery
                ? undefined
                : `${option.label} 허브로 이동하거나 검색 후 필터합니다`
            }
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
