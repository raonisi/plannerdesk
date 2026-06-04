import Link from "next/link";
import { borders, shadows, surfaces } from "@/lib/design-system";
import {
  SEARCH_DOMAIN_DISPLAY_ORDER,
  SEARCH_DOMAIN_LABEL,
  SEARCH_RESULT_ACTION_LABEL,
} from "@/lib/search/labels";
import type { GlobalSearchResult, GlobalSearchResultType } from "@/lib/search/types";

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

function SearchResultCard({ result }: { result: GlobalSearchResult }) {
  return (
    <article
      className={`${surfaces.card} ${borders.default} ${shadows.card} rounded-lg p-4 transition hover:border-[#aa8137]`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`${badgeBase} border-[#c8d2dc] bg-[#eef3f7] text-[#102235]`}
        >
          {SEARCH_DOMAIN_LABEL[result.type]}
        </span>
        {result.categoryLabel ? (
          <span className="text-xs text-[#5f6670]">{result.categoryLabel}</span>
        ) : null}
      </div>
      <h3 className="mt-2 text-base font-semibold text-[#102235]">
        <Link
          className="hover:text-[#7a612d] hover:underline"
          href={result.url}
        >
          {result.title}
        </Link>
      </h3>
      {result.summary ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#4f5661]">
          {result.summary}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5f6670]">
        <span>
          {result.sourceLabel ? `${result.sourceLabel} · ` : ""}
          {result.updatedAt
            ? `업데이트 ${result.updatedAt}`
            : result.publishedAt
              ? `공개 ${result.publishedAt}`
              : ""}
        </span>
        <Link
          className="inline-flex min-h-9 shrink-0 items-center rounded-md border border-[#d9c9a8] bg-white px-3 font-semibold text-[#102235] hover:bg-[#f7f1e5]"
          href={result.url}
        >
          {SEARCH_RESULT_ACTION_LABEL[result.type]}
        </Link>
      </div>
    </article>
  );
}

export function SearchResultsList({
  results,
  total,
}: {
  results: GlobalSearchResult[];
  total: number;
}) {
  const groups = groupSearchResults(results);

  return (
    <section aria-labelledby="search-results-heading">
      <h2
        className="text-sm font-semibold text-[#102235]"
        id="search-results-heading"
      >
        검색 결과 {total}건
      </h2>

      {groups ? (
        <div className="mt-4 space-y-8">
          {groups.map((group) => (
            <section aria-labelledby={`search-group-${group.type}`} key={group.type}>
              <h3
                className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a612d]"
                id={`search-group-${group.type}`}
              >
                {group.label} ({group.items.length})
              </h3>
              <ul className="mt-3 space-y-3">
                {group.items.map((result) => (
                  <li key={`${result.type}:${result.id}`}>
                    <SearchResultCard result={result} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
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
