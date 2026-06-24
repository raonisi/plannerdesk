import {
  ContentSection,
  PageFrame,
  PageHero,
} from "@/components/content-page";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PublicMobileQuickTabs } from "@/components/navigation/mobile-quick-tabs";
import {
  publicMainLandmarkProps,
  SkipToContent,
} from "@/components/skip-to-content";
import { publicMobileQuickTabsContentInset } from "@/lib/navigation/public-nav";
import { SearchDomainFilter } from "@/components/search/search-domain-filter";
import { SearchEmptyPanel } from "@/components/search/search-empty-panel";
import { SearchIdlePanel } from "@/components/search/search-idle-panel";
import {
  SEARCH_FORM_FRESHNESS_NOTICE,
  SEARCH_FORM_PLACEHOLDER,
  SEARCH_IDLE_PII_NOTICE,
} from "@/lib/search/constants";
import {
  SEARCH_DOMAIN_LABEL,
} from "@/lib/search/labels";
import {
  domainToQueryParam,
  parsePublicSearchDomain,
} from "@/lib/search/query-validation";
import { getWorkToolsAccess } from "@/lib/auth/access";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { searchPublicContent } from "@/lib/search/public";
import { DataResponsibilityInlineNotice } from "@/components/content/data-responsibility-inline-notice";
import { PublicErrorReportNotice } from "@/components/content/public-error-report-notice";
import { SearchResultsList } from "./search-results";
import { VerifiedWorkLinksSection } from "@/components/work-links/VerifiedWorkLinksSection";
import { getPublicVerifiedWorkLinks } from "@/lib/work-links/verified-catalog";

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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const rawQuery = resolved.q?.trim() ?? "";
  const domain = parsePublicSearchDomain(resolved.domain);
  const workToolsAccess = await getWorkToolsAccess();
  const plannerFavoritesEnabled = isPlannerFavoritesEnabled(workToolsAccess);

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
  const emptyDomainLabel =
    domain !== "all" ? SEARCH_DOMAIN_LABEL[domain] : undefined;
  const verifiedWorkLinks =
    rawQuery && (domain === "all" || domain === "work_link")
      ? getPublicVerifiedWorkLinks({ query: rawQuery })
      : [];

  return (
    <PageFrame>
      <div className={`flex min-h-screen flex-col ${publicMobileQuickTabsContentInset}`}>
        <SkipToContent />
        <Header />
        <main {...publicMainLandmarkProps} className="outline-none">
        <PageHero
          description="공개된 보험사·청구서류·공시·약관·고객문구·지식 문서의 위치를 찾습니다. 보험금 지급 판단이나 개인 상담은 제공하지 않습니다."
          eyebrow="통합 검색"
          title="통합 검색"
        />

        <ContentSection>
        <div className="mx-auto max-w-3xl space-y-6">
          <DataResponsibilityInlineNotice variant="search" />

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
                aria-label="검색어"
                className="min-h-11 flex-1 rounded-md border border-[#d9c9a8] px-3 text-sm text-[#102235] outline-none focus-visible:border-[#aa8137] focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2"
                defaultValue={rawQuery}
                maxLength={60}
                name="q"
                placeholder={SEARCH_FORM_PLACEHOLDER}
                type="search"
              />
              <input
                name="domain"
                type="hidden"
                value={domainToQueryParam(domain)}
              />
              <button
                className="min-h-11 rounded-md bg-[#102235] px-5 text-sm font-semibold text-white hover:bg-[#1b344e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2"
                type="submit"
              >
                검색
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#5f6670]">
              {SEARCH_IDLE_PII_NOTICE} {SEARCH_FORM_FRESHNESS_NOTICE}{" "}
              보험금 지급·청구 가능 여부 판단 검색은 제공하지 않습니다.
            </p>
          </form>

          <SearchDomainFilter activeDomain={domain} query={rawQuery} />

          {!rawQuery ? <SearchIdlePanel /> : null}

          {blockedMessage ? (
            <div
              className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
              role="alert"
            >
              {blockedMessage}
            </div>
          ) : null}

          {showResults && results?.ok ? (
            <>
              <SearchResultsList
                domainFilter={domain}
                plannerFavoritesEnabled={plannerFavoritesEnabled}
                query={rawQuery}
                results={results.results}
                total={results.total}
              />
              <VerifiedWorkLinksSection
                compact
                links={verifiedWorkLinks}
                mode="public"
              />
            </>
          ) : null}

          {showEmpty ? (
            <SearchEmptyPanel
              domainFilterLabel={emptyDomainLabel}
              showWorkLinkNote={domain === "work_link" || domain === "all"}
            />
          ) : null}

          <PublicErrorReportNotice />
        </div>
      </ContentSection>
      </main>
      <Footer />
      </div>
      <PublicMobileQuickTabs />
    </PageFrame>
  );
}
