import Link from "next/link";
import { borders, shadows, surfaces } from "@/lib/design-system";
import { SEARCH_DOMAIN_LABEL } from "@/lib/search/labels";
import type { GlobalSearchResult } from "@/lib/search/types";

const badgeBase =
  "inline-flex min-h-7 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold";

export function SearchResultsList({
  results,
  total,
}: {
  results: GlobalSearchResult[];
  total: number;
}) {
  return (
    <section aria-labelledby="search-results-heading">
      <h2
        className="text-sm font-semibold text-[#102235]"
        id="search-results-heading"
      >
        검색 결과 {total}건
      </h2>
      <ul className="mt-4 space-y-3">
        {results.map((result) => (
          <li key={`${result.type}:${result.id}`}>
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
                  <span className="text-xs text-[#5f6670]">
                    {result.categoryLabel}
                  </span>
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
                  className="inline-flex min-h-9 items-center rounded-md border border-[#d9c9a8] bg-white px-3 font-semibold text-[#102235] hover:bg-[#f7f1e5]"
                  href={result.url}
                >
                  바로가기
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
