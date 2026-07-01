import Link from "next/link";
import { KnowledgeArticleCategory } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ContentSection, PageHero } from "@/components/content-page";
import { getWorkToolsAccess } from "@/lib/auth/access";
import {
  filterAndSortKnowledgeArchive,
  parseKnowledgeArchiveParams,
} from "@/lib/knowledge/archive-filter";
import { isPlannerFavoritesEnabled } from "@/lib/planner-favorites/planner-access";
import { getPublicKnowledgeArticles } from "@/lib/public/knowledge-articles";
import { DataResponsibilityInlineNotice } from "@/components/content/data-responsibility-inline-notice";
import { PublicErrorReportNotice } from "@/components/content/public-error-report-notice";
import { KnowledgeArchiveList } from "./knowledge-archive-list";
import { PUBLIC_UX_KNOWLEDGE_SAFETY_TITLE } from "@/lib/public/public-ux-copy";

export const dynamic = "force-dynamic";

const t = {
  eyebrow: "지식 아카이브",
  title: "지식 자료실",
  description:
    "보험 실무에 필요한 기준, 용어, 상담 자료를 한곳에서 확인하세요.",
  safetyTitle: PUBLIC_UX_KNOWLEDGE_SAFETY_TITLE,
  safetyBody:
    "PlannerDesk는 보험금 지급 여부를 판단하지 않습니다.\nPlannerDesk는 보험금 지급 금액을 산정하지 않습니다.\nPlannerDesk는 손해사정 업무를 수행하지 않습니다.\nPlannerDesk는 의료 진단을 해석하지 않습니다.\n고객 개인정보, 의료자료, 진단서, 청구서류 원본은 입력하거나 업로드하지 마세요.",
};

interface KnowledgePageSearchParams {
  q?: string;
  category?: string;
  type?: string;
  risk?: string;
  review?: string;
  sort?: string;
}

export default async function KnowledgeArchivePage({
  searchParams,
}: {
  searchParams: Promise<KnowledgePageSearchParams>;
}) {
  const resolved = await searchParams;
  const filterState = parseKnowledgeArchiveParams(
    resolved as Record<string, string | string[] | undefined>,
  );

  const [result, workToolsAccess] = await Promise.all([
    getPublicKnowledgeArticles(),
    getWorkToolsAccess(),
  ]);
  const plannerFavoritesEnabled = isPlannerFavoritesEnabled(workToolsAccess);
  const articles = result.status === "ok" ? result.articles : [];
  const isCatalogEmpty = articles.length === 0;

  const { items: filteredItems, blockedMessage } = filterAndSortKnowledgeArchive(
    articles,
    filterState,
  );

  return (
    <AppShell>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <ContentSection>
          <div className="space-y-6">
            <KnowledgeQuickLinks />

            <DataResponsibilityInlineNotice variant="knowledge" />

            <aside
              className="rounded-xl border border-[#d9c9a8] border-l-4 border-l-[#aa8137] bg-[#fbf7ee] p-4 sm:p-5"
              role="note"
            >
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                  <h2 className="text-sm font-semibold text-[#102235]">{t.safetyTitle}</h2>
                  <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
                    펼치기
                  </span>
                </summary>
                <p className="mt-3 break-keep whitespace-pre-line text-sm leading-6 text-[#5f6670]">
                  {t.safetyBody}
                </p>
              </details>
            </aside>

            <KnowledgeArchiveList
              blockedMessage={blockedMessage}
              filterState={filterState}
              filteredItems={filteredItems}
              isCatalogEmpty={isCatalogEmpty}
              items={articles}
              plannerFavoritesEnabled={plannerFavoritesEnabled}
            />

            <PublicErrorReportNotice />
          </div>
      </ContentSection>
    </AppShell>
  );
}
function KnowledgeQuickLinks() {
  const quickLinks = [
    { label: "청구·접수 기준", href: `/knowledge?category=${KnowledgeArticleCategory.claim}` },
    { label: "고지·심사 전 확인", href: `/knowledge?category=${KnowledgeArticleCategory.underwriting}` },
    { label: "고객 설명 자료", href: `/knowledge?category=${KnowledgeArticleCategory.customer_message}` },
    { label: "전체 자료 보기", href: "/knowledge" },
  ];

  return (
    <section aria-label="주요 자료 빠른 탐색">
      <div className="flex flex-wrap gap-2">
        {quickLinks.map((link, idx) => {
          const isPrimary = idx === 3;
          return (
            <Link
              key={idx}
              href={link.href}
              className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 sm:w-auto ${
                isPrimary
                  ? "border-[#d9c9a8] bg-[#fbf7ee] text-[#102235] hover:border-[#aa8137] hover:bg-[#f7f1e5]"
                  : "border-[#e3ded4] bg-white text-[#102235] shadow-sm hover:border-[#B9975B] hover:shadow"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
