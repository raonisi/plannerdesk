import Link from "next/link";
import {
  ContentSection,
  PageFrame,
  PageHero,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  SEARCH_EMPTY_MESSAGE,
  SEARCH_IDLE_HINT,
} from "@/lib/search/constants";
import { PUBLIC_SEARCH_FILTER_OPTIONS } from "@/lib/search/labels";
import {
  domainToQueryParam,
  parsePublicSearchDomain,
} from "@/lib/search/query-validation";
import { searchPublicContent } from "@/lib/search/public";
import { SearchResultsList } from "./search-results";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "통합 검색 | PlannerDesk",
  description:
    "보험사, 청구서류, 공시·약관, 고객문구, 지식 아카이브의 공개 정보를 한 번에 탐색할 수 있는 검색 페이지입니다.",
};

interface SearchParams {
  q?: string;
  domain?: string;
}

function buildSearchHref(q: string, domainParam: string): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (domainParam !== "all") params.set("domain", domainParam);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const rawQuery = resolved.q?.trim() ?? "";
  const domain = parsePublicSearchDomain(resolved.domain);

  let blockedMessage: string | null = null;
  let results: Awaited<ReturnType<typeof searchPublicContent>> | null = null;

  if (rawQuery) {
    results = await searchPublicContent({ q: rawQuery, domain });
    if (!results.ok) {
      blockedMessage = results.message;
    }
  }

  const showResults =
    rawQuery && results?.ok && results.results.length > 0;
  const showEmpty = rawQuery && results?.ok && results.results.length === 0;

  return (
    <PageFrame>
      <Header />
      <PageHero
        description="공개된 보험사·청구서류·공시·약관·고객문구·지식 문서의 위치를 찾습니다. 보험금 지급 판단이나 개인 상담은 제공하지 않습니다."
        eyebrow="통합 검색"
        title="통합 검색"
      />

      <ContentSection>
        <div className="mx-auto max-w-3xl space-y-6">
          <form
            action="/search"
            className="rounded-xl border border-[#d9c9a8] bg-white p-4 shadow-sm"
            method="get"
            role="search"
          >
            <label className="block text-sm font-semibold text-[#102235]">
              검색어
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="min-h-11 flex-1 rounded-md border border-[#d9c9a8] px-3 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
                defaultValue={rawQuery}
                maxLength={60}
                name="q"
                placeholder="보험사명, 청구서류, 약관, 공시, 고객문구, 지식 키워드"
                type="search"
              />
              <input
                name="domain"
                type="hidden"
                value={domainToQueryParam(domain)}
              />
              <button
                className="min-h-11 rounded-md bg-[#102235] px-5 text-sm font-semibold text-white hover:bg-[#1b344e]"
                type="submit"
              >
                검색
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#5f6670]">
              개인정보·의료정보·계약번호·보험금 지급 판단 관련 검색은 제공하지
              않습니다.
            </p>
          </form>

          {rawQuery ? (
            <div
              aria-label="도메인 필터"
              className="flex flex-wrap gap-2"
              role="group"
            >
              {PUBLIC_SEARCH_FILTER_OPTIONS.map((option) => {
                const isActive =
                  domain === option.domain ||
                  (option.domain === "all" && domain === "all");
                return (
                  <Link
                    className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${
                      isActive
                        ? "border-[#102235] bg-[#102235] text-white"
                        : "border-[#d9c9a8] bg-white text-[#4f5661] hover:bg-[#f7f1e5]"
                    }`}
                    href={buildSearchHref(rawQuery, option.param)}
                    key={option.param}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          ) : null}

          {!rawQuery ? (
            <div className="rounded-md border border-[#d9c9a8] bg-[#fbf7ee] px-4 py-4 text-sm leading-6 text-[#4f5661]">
              <p>{SEARCH_IDLE_HINT}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  { label: "보험사", href: "/directory" },
                  { label: "청구서류", href: "/claim-documents" },
                  { label: "지식", href: "/knowledge" },
                  { label: "공시·약관", href: "/disclosure-links" },
                  { label: "고객문구", href: "/message-templates" },
                ].map((hub) => (
                  <li key={hub.href}>
                    <Link
                      className="font-semibold text-[#102235] underline"
                      href={hub.href}
                    >
                      {hub.label} 허브
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {blockedMessage ? (
            <div
              className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
              role="alert"
            >
              {blockedMessage}
            </div>
          ) : null}

          {showResults && results?.ok ? (
            <SearchResultsList results={results.results} total={results.total} />
          ) : null}

          {showEmpty ? (
            <p
              className="rounded-md border border-[#d9c9a8] bg-white px-4 py-3 text-sm text-[#4f5661]"
              role="status"
            >
              {SEARCH_EMPTY_MESSAGE}
            </p>
          ) : null}
        </div>
      </ContentSection>
      <Footer />
    </PageFrame>
  );
}
