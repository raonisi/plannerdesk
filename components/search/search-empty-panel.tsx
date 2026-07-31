import Link from "next/link";
import {
  SEARCH_EMPTY_CORRECTION_HINT,
  SEARCH_EMPTY_DESCRIPTION,
  SEARCH_EMPTY_EYEBROW,
  SEARCH_EMPTY_FILTER_HINT,
  SEARCH_EMPTY_MESSAGE,
  SEARCH_EMPTY_NEXT_STEP,
  SEARCH_EMPTY_PII_NOTICE,
  SEARCH_EMPTY_TIPS,
  SEARCH_EMPTY_VISIBILITY_NOTE,
  SEARCH_EMPTY_WORK_LINK_NOTE,
} from "@/lib/search/constants";
import { buildPublicSearchHref } from "@/lib/search/search-href";
import { BrowseNextSteps } from "./browse-next-steps";

export function SearchEmptyPanel({
  domainFilterLabel,
  hasActiveFilter,
  query,
  showWorkLinkNote = false,
}: {
  domainFilterLabel?: string;
  hasActiveFilter: boolean;
  query: string;
  showWorkLinkNote?: boolean;
}) {
  return (
    <section
      aria-labelledby="search-empty-title"
      className="max-w-full min-w-0 rounded-xl border border-[#d9c9a8] bg-white px-4 py-5 text-sm leading-6 text-[#4f5661] sm:px-5"
      data-testid="search-empty-panel"
    >
      <div aria-live="polite" role="status">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#7a612d]">
              {SEARCH_EMPTY_EYEBROW}
            </p>
            <h2
              className="mt-1 break-keep text-lg font-bold text-[#102235]"
              id="search-empty-title"
            >
              {SEARCH_EMPTY_MESSAGE}
            </h2>
          </div>
          <span className="inline-flex min-h-7 shrink-0 items-center rounded-full bg-[#f7f1e5] px-2.5 text-xs font-semibold text-[#7a612d]">
            0건
          </span>
        </div>
        <p className="mt-3 break-keep text-sm leading-6 text-[#4f5661]">
          {SEARCH_EMPTY_DESCRIPTION}
          <br />
          {SEARCH_EMPTY_NEXT_STEP}
        </p>
        <div className="mt-4 min-w-0 rounded-lg bg-[#fbf7ee] px-3 py-3">
          <p className="text-xs font-semibold text-[#5f6670]">검색어</p>
          <p className="mt-1 max-w-full min-w-0 break-all font-semibold text-[#102235] [overflow-wrap:anywhere]">
            &quot;{query}&quot;
          </p>
        </div>
      </div>
      {domainFilterLabel ? (
        <p className="mt-2">
          현재{" "}
          <span className="font-semibold text-[#102235]">{domainFilterLabel}</span>{" "}
          영역만 보고 있습니다. 필터를 &quot;전체&quot;로 바꾸거나 검색어를 조정해 보세요.
        </p>
      ) : null}
      <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#102235] px-4 text-sm font-semibold text-white hover:bg-[#1b344e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2"
          href="/search?focus=search"
        >
          검색어 지우기
        </Link>
        {hasActiveFilter ? (
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2"
            href={buildPublicSearchHref(query, "all")}
          >
            필터 초기화
          </Link>
        ) : (
          <button
            className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border border-[#d9c9a8] bg-[#f8f7f3] px-4 text-sm font-semibold text-[#7a7f86]"
            disabled
            type="button"
          >
            필터 초기화
          </button>
        )}
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold text-[#102235] underline decoration-[#d9c9a8] underline-offset-4 hover:text-[#7a612d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 sm:col-span-2"
          href="/search"
        >
          전체 자료 보기
        </Link>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">{SEARCH_EMPTY_PII_NOTICE}</p>
      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_FILTER_HINT}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_VISIBILITY_NOTE}
      </p>
      {showWorkLinkNote ? (
        <p className="mt-2 text-xs leading-5 text-[#5f6670]">
          {SEARCH_EMPTY_WORK_LINK_NOTE}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {SEARCH_EMPTY_CORRECTION_HINT}{" "}
        <Link
          className="font-semibold text-[#102235] underline decoration-[#d9c9a8] underline-offset-2 hover:text-[#7a612d]"
          href="/directory"
        >
          보험사 디렉터리
        </Link>
        또는 각 허브 화면의 정보 수정 요청을 이용해 주세요.
      </p>
      <BrowseNextSteps />
    </section>
  );
}
