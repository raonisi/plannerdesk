import Link from "next/link";
import { DataFreshnessMeta } from "@/components/content/data-freshness-meta";
import { SearchResultFavoriteToggle } from "@/components/search/search-result-favorite-toggle";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  SEARCH_GROUP_MORE_LABEL,
  SEARCH_GROUP_PREVIEW_LIMIT,
} from "@/lib/search/constants";
import { buildPublicSearchHref } from "@/lib/search/search-href";
import {
  SEARCH_DOMAIN_BADGE_CLASS,
  SEARCH_DOMAIN_DISPLAY_ORDER,
  SEARCH_DOMAIN_LABEL,
  SEARCH_RESULT_ACTION_LABEL,
  SEARCH_RESULT_SECONDARY_ACTION,
} from "@/lib/search/labels";
import type {
  GlobalSearchResult,
  GlobalSearchResultType,
  PublicSearchDomain,
} from "@/lib/search/types";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

function groupSearchResults(results: GlobalSearchResult[]) {
  const types = new Set(results.map((result) => result.type));
  if (types.size <= 1) {
    return null;
  }

  const byType = new Map<GlobalSearchResultType, GlobalSearchResult[]>();
  for (const result of results) {
    const list = byType.get(result.type) ?? [];
    list.push(result);
    byType.set(result.type, list);
  }

  return SEARCH_DOMAIN_DISPLAY_ORDER.filter((type) => byType.has(type)).map((type) => ({
    type,
    label: SEARCH_DOMAIN_LABEL[type],
    items: byType.get(type)!,
  }));
}

function resultPrimaryHref(result: GlobalSearchResult): string {
  return result.externalHref ?? result.url;
}

function isExternalResult(result: GlobalSearchResult): boolean {
  if (!result.externalHref) return false;
  return (
    result.externalHref.startsWith("http") || result.externalHref.startsWith("tel:")
  );
}

const FRESHNESS_RESULT_TYPES = new Set<GlobalSearchResultType>([
  "insurer",
  "claim_document",
  "disclosure_link",
  "work_link",
]);

function SearchResultCard({ result }: { result: GlobalSearchResult }) {
  const primaryHref = resultPrimaryHref(result);
  const external = isExternalResult(result);
  const secondaryLabel = SEARCH_RESULT_SECONDARY_ACTION[result.type];

  return (
    <article
      className={`${surfaces.card} ${borders.default} ${shadows.card} min-w-0 rounded-lg p-4 transition hover:border-[#aa8137]`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`${badgeBase} ${SEARCH_DOMAIN_BADGE_CLASS[result.type]}`}
        >
          {SEARCH_DOMAIN_LABEL[result.type]}
        </span>
        {result.linkTypeLabel ? (
          <span className="text-xs font-semibold text-[#7a612d]">
            {result.linkTypeLabel}
          </span>
        ) : null}
        {result.categoryLabel ? (
          <span className="text-xs text-[#5f6670]">{result.categoryLabel}</span>
        ) : null}
        <SearchResultFavoriteToggle
          resultId={result.id}
          resultType={result.type}
          title={result.title}
        />
      </div>
      <h3 className="mt-2 break-keep text-base font-semibold text-[#102235]">
        {external ? (
          <a
            className="hover:text-[#7a612d] hover:underline"
            href={primaryHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            {result.title}
          </a>
        ) : (
          <Link className="hover:text-[#7a612d] hover:underline" href={primaryHref}>
            {result.title}
          </Link>
        )}
      </h3>
      {result.summary ? (
        <p className="mt-2 line-clamp-3 break-keep text-sm leading-6 text-[#4f5661]">
          {result.summary}
        </p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {FRESHNESS_RESULT_TYPES.has(result.type) ? (
          <DataFreshnessMeta
            compact
            lastVerifiedAt={result.lastVerifiedAt}
            officialSourceUrl={result.officialSourceUrl}
          />
        ) : (
          <span className="text-xs text-[#5f6670]">
            {result.sourceLabel ? `${result.sourceLabel} · ` : ""}
            {result.updatedAt
              ? `업데이트 ${result.updatedAt}`
              : result.publishedAt
                ? `기준일 ${result.publishedAt}`
                : ""}
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          {secondaryLabel && result.type === "insurer" ? (
            <Link
              className="inline-flex min-h-9 shrink-0 items-center rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 text-xs font-semibold text-[#102235] hover:bg-white"
              href={result.url}
            >
              {secondaryLabel}
            </Link>
          ) : null}
          {external ? (
            <a
              className="inline-flex min-h-9 shrink-0 items-center rounded-md border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
              href={primaryHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {SEARCH_RESULT_ACTION_LABEL[result.type]}
            </a>
          ) : (
            <Link
              className="inline-flex min-h-9 shrink-0 items-center rounded-md border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#102235] hover:bg-[#f7f1e5]"
              href={primaryHref}
            >
              {SEARCH_RESULT_ACTION_LABEL[result.type]}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function SearchResultsList({
  results,
  total,
  query,
  domainFilter = "all",
}: {
  results: GlobalSearchResult[];
  total: number;
  query: string;
  domainFilter?: PublicSearchDomain;
}) {
  const groups = groupSearchResults(results);
  const previewLimit =
    domainFilter === "all" ? SEARCH_GROUP_PREVIEW_LIMIT : results.length;

  return (
    <section aria-labelledby="search-results-heading">
      <h2
        className="text-sm font-semibold text-[#102235]"
        id="search-results-heading"
      >
        검색 결과 {total}건
      </h2>
      <p className="mt-1 text-xs text-[#5f6670]">
        영역별로 구분해 표시합니다. 공개·검수 기준을 통과한 항목만 포함되며, 업무
        도구·Answer Assistant는 검색 대상이 아닙니다.
      </p>

      {groups ? (
        <div className="mt-4 space-y-8">
          {groups.map((group) => {
            const visible = group.items.slice(0, previewLimit);
            const hasMore = group.items.length > visible.length;

            return (
              <section aria-labelledby={`search-group-${group.type}`} key={group.type}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a612d]"
                    id={`search-group-${group.type}`}
                  >
                    {group.label} ({group.items.length})
                  </h3>
                  {hasMore ? (
                    <Link
                      className="text-xs font-semibold text-[#102235] underline decoration-[#d9c9a8] underline-offset-2 hover:text-[#7a612d]"
                      href={buildPublicSearchHref(query, group.type)}
                    >
                      {SEARCH_GROUP_MORE_LABEL}
                    </Link>
                  ) : null}
                </div>
                <ul className="mt-3 space-y-3">
                  {visible.map((result) => (
                    <li key={`${result.type}:${result.id}`}>
                      <SearchResultCard result={result} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {results.map((result) => (
            <li key={`${result.type}:${result.id}`}>
              <SearchResultCard result={result} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
