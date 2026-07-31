import { AppShell } from "@/components/app-shell";
import {
  ContentSection,
  PageHero,
} from "@/components/content-page";
import { SearchDomainFilter } from "@/components/search/search-domain-filter";
import { SearchEmptyPanel } from "@/components/search/search-empty-panel";
import { SearchIdlePanel } from "@/components/search/search-idle-panel";
import { SearchQueryForm } from "@/components/search/search-query-form";
import {
  SEARCH_DOMAIN_LABEL,
} from "@/lib/search/labels";
import {
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
  focus?: string;
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
    <AppShell>
      <PageHero
        description="공개된 보험사·청구서류·공시·약관·고객문구·지식 문서의 위치를 찾습니다. 보험금 지급 판단이나 개인 상담은 제공하지 않습니다."
        eyebrow="통합 검색"
        title="통합 검색"
      />

      <ContentSection className="w-full">
        <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6">
          <DataResponsibilityInlineNotice variant="search" />

          <SearchQueryForm
            domain={domain}
            focusOnMount={resolved.focus === "search" && !rawQuery}
            query={rawQuery}
          />

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
              hasActiveFilter={domain !== "all"}
              query={rawQuery}
              showWorkLinkNote={domain === "work_link" || domain === "all"}
            />
          ) : null}

          <PublicErrorReportNotice />
        </div>
      </ContentSection>
    </AppShell>
  );
}
