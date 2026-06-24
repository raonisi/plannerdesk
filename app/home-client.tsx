"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  Wrench,
  FileText,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Clock,
  Library,
} from "lucide-react";
import { HomePublicStatsStrip, type HomePublicStats } from "@/components/dashboard/home-public-stats-strip";
import { HomeDataStatusNotice } from "@/components/dashboard/home-data-status-notice";
import {
  PLANNER_ANSWER_ASSISTANT_HUB_NOTE,
  PUBLIC_LANDING_LIMITED_BETA_NOTICE,
  PUBLIC_LANDING_OFFICIAL_SOURCE_NOTICE,
  PUBLIC_WORK_HUB_NO_RESULTS,
  PUBLIC_WORK_HUB_SEARCH_HINT,
  PUBLIC_WORK_HUB_VISIBILITY_NOTICE,
} from "@/lib/dashboard/work-hub-copy";
import { VerifiedWorkLinksSection } from "@/components/work-links/VerifiedWorkLinksSection";
import { PlannerWorkFavoritesPanel } from "@/components/dashboard/planner-work-favorites-panel";
import type { PlannerVerifiedWorkLinkView } from "@/lib/work-links/review-types";
import { HomeScreenInstallNotice } from "@/components/pwa/home-screen-install-notice";
import { PlannerFavoritesLoginPrompt } from "@/components/planner-favorites/planner-favorites-login-prompt";
import { PlannerFavoritesScope } from "@/components/planner-favorites/planner-favorites-scope";
import { EmptyStatePanel } from "@/components/launcher/empty-state-panel";
import { HomeCompactWorkTile } from "@/components/launcher/home-compact-work-tile";
import { SectionHeader } from "@/components/launcher/section-header";
import type { PublicInsurer } from "@/lib/public/insurers";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import type { PublicKnowledgeArticleListItem } from "@/lib/public/knowledge-articles";
import {
  buttons,
  launcherIconTone,
  notices,
  sectionEyebrow,
  shadows,
  surfaces,
  spacing,
  textStyles,
} from "@/lib/design-system";
import {
  HOME_RECENTS_EMPTY_DESCRIPTION,
  HOME_RECENTS_EMPTY_TITLE,
  HOME_RECENTS_FAVORITES_UNIFIED_NOTICE,
} from "@/lib/planner-favorites/copy";
import {
  HOME_RECENT_DISPLAY_LIMIT,
  publicWorkspaceKindLabel,
  pushRecentWorkItem,
  readRecentWorkFromStorage,
  recentWorkStorageKey,
  RECENT_WORK_STORAGE_UPDATE_EVENT,
  writeRecentWorkToStorage,
  type RecentWorkInput,
  type RecentWorkItem,
} from "@/lib/planner-favorites/recent-work";
import {
  mobileCardDescription,
  mobileCardTitleSm,
  mobileCardShell,
} from "@/lib/mobile/card-density";
import { WORK_TOOLS_PUBLIC_HOME_CARD_DESCRIPTION } from "@/lib/work-tools/work-tools-public-copy";
import { uiLabels } from "@/lib/ui-labels";
import type { HomeLoadState } from "@/lib/dashboard/home-data-state";
import type { PublicMessageTemplate } from "@/lib/public/message-templates";

interface HomeClientProps {
  insurers: PublicInsurer[];
  claimDocuments: PublicClaimDocument[];
  knowledgeArticles: PublicKnowledgeArticleListItem[];
  messageTemplates: PublicMessageTemplate[];
  publicStats: HomePublicStats;
  loadState: HomeLoadState;
  plannerFavoritesEnabled: boolean;
  plannerVerifiedWorkLinks: PlannerVerifiedWorkLinkView[];
}

const PRIMARY_CTA_CLASS = `${buttons.base} inline-flex min-h-11 items-center px-4 text-sm`;

export function HomeClient({
  insurers,
  claimDocuments,
  knowledgeArticles,
  messageTemplates,
  publicStats,
  loadState,
  plannerFavoritesEnabled,
  plannerVerifiedWorkLinks,
}: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [recents, setRecents] = useState<RecentWorkItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !plannerFavoritesEnabled) return;

    const syncRecents = () => {
      const savedRecents = window.localStorage.getItem(recentWorkStorageKey());
      setRecents(readRecentWorkFromStorage(savedRecents));
    };

    syncRecents();
    window.addEventListener(RECENT_WORK_STORAGE_UPDATE_EVENT, syncRecents);
    const onStorage = (event: StorageEvent) => {
      if (event.key === recentWorkStorageKey()) syncRecents();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(RECENT_WORK_STORAGE_UPDATE_EVENT, syncRecents);
      window.removeEventListener("storage", onStorage);
    };
  }, [plannerFavoritesEnabled]);

  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().replace(/\s+/g, "");

    const items: Array<{
      id: string;
      label: string;
      sub: string;
      href: string;
      type: "insurer" | "tool" | "doc" | "message" | "knowledge";
    }> = [];

    insurers.forEach((ins) => {
      if (ins.name.toLowerCase().includes(query)) {
        items.push({
          id: ins.id,
          label: ins.name,
          sub: `${ins.category === "life" ? "생명보험" : "손해보험"} | 전산 및 청구 정보`,
          href: `/directory?search=${encodeURIComponent(ins.name)}`,
          type: "insurer",
        });
      }
    });

    claimDocuments.forEach((doc) => {
      if (doc.title.toLowerCase().includes(query)) {
        items.push({
          id: doc.id,
          label: doc.title,
          sub: `청구서류 | ${doc.insurerName || "공통"}`,
          href: `/claim-documents?search=${encodeURIComponent(doc.title)}`,
          type: "doc",
        });
      }
    });

    knowledgeArticles.forEach((article) => {
      const haystack = `${article.title}${article.summary}`.toLowerCase();
      if (haystack.includes(query)) {
        items.push({
          id: article.id,
          label: article.title,
          sub: `지식 아카이브 | ${article.categoryLabel}`,
          href: `/knowledge/${article.slug}`,
          type: "knowledge",
        });
      }
    });

    if (
      "고객안내문".includes(query) ||
      "고객 문구".replace(/\s/g, "").includes(query)
    ) {
      items.push({
        id: "message-templates",
        label: "고객 안내문",
        sub: "고객 문구 | 상황별 템플릿",
        href: "/message-templates",
        type: "message",
      });
    }

    if ("통합검색".includes(query) || "검색".includes(query)) {
      items.push({
        id: "search-hub",
        label: "통합 검색",
        sub: "보험사·청구서류·지식·공시 통합 탐색",
        href: `/search?q=${encodeURIComponent(searchQuery.trim())}`,
        type: "tool",
      });
    }

    return items.slice(0, 8);
  })();

  const trackRecent = (item: RecentWorkInput) => {
    if (!plannerFavoritesEnabled || typeof window === "undefined") return;
    const updated = pushRecentWorkItem(recents, item);
    setRecents(updated);
    try {
      window.localStorage.setItem(
        recentWorkStorageKey(),
        writeRecentWorkToStorage(updated),
      );
      window.dispatchEvent(new Event(RECENT_WORK_STORAGE_UPDATE_EVENT));
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-5 py-6 pb-12 sm:px-8 lg:px-10">
      {/* 1. 업무 시작 히어로 */}
      <section
        aria-labelledby="home-work-start-heading"
        className="relative overflow-hidden rounded-2xl border border-[#E3DED4] bg-gradient-to-br from-[#F8F7F3] via-white to-[#F7F4EE] p-5 shadow-sm sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#16382C]/5" />
        <div className="relative max-w-3xl">
          <p className={sectionEyebrow}>실무 업무 시작</p>
          <h1
            id="home-work-start-heading"
            className="mt-2 break-keep text-2xl font-extrabold tracking-tight text-[#0F1D2E] sm:text-3xl"
          >
            오늘 필요한 업무를 빠르게 시작하세요
          </h1>
          <p className={`mt-3 max-w-2xl break-keep ${textStyles.body}`}>
            보험사 전산, 청구서류, 공시·약관을 한곳에서 확인합니다. 상담 전
            확인할 자료를 빠르게 찾습니다.
          </p>
          <p className={`mt-2 max-w-2xl break-keep text-sm text-[#4A5565]`}>
            {PUBLIC_WORK_HUB_SEARCH_HINT}
          </p>

          <div className="relative z-10 mt-5 max-w-2xl">
            <label className="sr-only" htmlFor="home-unified-search">
              통합 검색
            </label>
            <div className="flex min-h-12 items-center rounded-xl border border-[#E3DED4] bg-white px-4 shadow-md ring-1 ring-[#E3DED4]/80 focus-within:ring-2 focus-within:ring-[#B9975B]/50">
              <Search aria-hidden className="h-5 w-5 shrink-0 text-[#4A5565]" />
              <input
                id="home-unified-search"
                type="search"
                placeholder="보험사명, 청구서류, 지식, 업무 도구, 고객 문구 검색"
                className="ml-3 min-w-0 flex-1 bg-transparent text-base font-medium text-[#17202A] outline-none placeholder:text-[#4A5565]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="검색어 지우기"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[#4A5565] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                >
                  지우기
                </button>
              ) : null}
            </div>

            {showResults && searchQuery.trim() ? (
              <div
                className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-[#E3DED4] bg-white p-2 shadow-lg"
                role="listbox"
                aria-label="검색 결과"
              >
                <p className={`px-3 py-1.5 ${sectionEyebrow}`}>검색 결과</p>
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#E3DED4]/60">
                    {searchResults.map((res) => (
                      <Link
                        key={res.type + res.id}
                        href={res.href}
                        onClick={() =>
                          trackRecent({
                            id: res.id,
                            label: res.label,
                            href: res.href,
                            type: res.type,
                          })
                        }
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition hover:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                        role="option"
                      >
                        <div className={`min-w-0 ${mobileCardShell}`}>
                          <p className={mobileCardTitleSm}>{res.label}</p>
                          <p className={`mt-0.5 ${mobileCardDescription}`}>
                            {res.sub}
                          </p>
                        </div>
                        <ArrowRight
                          aria-hidden
                          className="h-4 w-4 shrink-0 text-[#B9975B]"
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-[#4A5565]">
                    <p>{PUBLIC_WORK_HUB_NO_RESULTS}</p>
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                      className="mt-2 inline-flex min-h-9 items-center font-semibold text-[#0F1D2E] underline decoration-[#B9975B] underline-offset-2"
                    >
                      통합 검색에서 더 보기
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            <Link
              href="/directory"
              className={`${PRIMARY_CTA_CLASS} ${buttons.primary}`}
            >
              보험사 전산 찾기
            </Link>
            <Link
              href="/claim-documents"
              className={`${PRIMARY_CTA_CLASS} ${buttons.secondary}`}
            >
              청구서류 찾기
            </Link>
            <Link
              href="/work-tools"
              className={`${PRIMARY_CTA_CLASS} ${buttons.secondary}`}
            >
              업무 도구 열기
            </Link>
          </div>

          <details
            className="mt-4 max-w-2xl rounded-lg border border-[#E3DED4]/90 bg-white/80 px-4 py-3 text-sm text-[#4A5565] group"
            role="note"
          >
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 break-keep font-medium text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 [&::-webkit-details-marker]:hidden">
              제한 베타·공식 안내
              <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
                펼치기
              </span>
            </summary>
            <div className="mt-2 space-y-1.5 border-t border-[#E3DED4]/60 pt-3 text-xs">
              <p className="break-keep">{PUBLIC_LANDING_LIMITED_BETA_NOTICE}</p>
              <p className="break-keep">{PUBLIC_WORK_HUB_VISIBILITY_NOTICE}</p>
              <p className="break-keep">{PUBLIC_LANDING_OFFICIAL_SOURCE_NOTICE}</p>
              <p className="break-keep">
                <Link
                  href="/planner/answer-assistant"
                  className="font-semibold text-[#0F1D2E] underline decoration-[#B9975B] underline-offset-2"
                >
                  답변 보조(베타)
                </Link>
                {" — "}
                {PLANNER_ANSWER_ASSISTANT_HUB_NOTE}
              </p>
            </div>
          </details>

          <HomeDataStatusNotice
            loadState={loadState}
            showQuickLinks={loadState === "error" || loadState === "partial-error"}
          />
        </div>
      </section>

      {/* 2. 오늘 바로 쓰는 업무 */}
      <section aria-labelledby="home-work-tiles-heading" className="mt-8">
        <SectionHeader
          eyebrow={uiLabels.homeHub}
          id="home-work-tiles-heading"
          title="오늘 바로 쓰는 업무"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
          <HomeCompactWorkTile
            description="전산·고객센터·팩스 바로가기"
            href="/directory"
            icon={Building2}
            iconToneClass={launcherIconTone.green}
            onNavigate={() =>
              trackRecent({
                id: "directory",
                label: "보험사 전산",
                href: "/directory",
                type: "shortcut",
              })
            }
            title="보험사 전산"
          />
          <HomeCompactWorkTile
            description="보험사별 필요서류 확인"
            href="/claim-documents"
            icon={FileText}
            iconToneClass={launcherIconTone.navy}
            onNavigate={() =>
              trackRecent({
                id: "claim-documents",
                label: "청구서류",
                href: "/claim-documents",
                type: "shortcut",
              })
            }
            title="청구서류"
          />
          <HomeCompactWorkTile
            description={WORK_TOOLS_PUBLIC_HOME_CARD_DESCRIPTION}
            href="/work-tools"
            icon={Wrench}
            iconToneClass={launcherIconTone.navy}
            onNavigate={() =>
              trackRecent({
                id: "work-tools",
                label: "업무 도구",
                href: "/work-tools",
                type: "tool",
              })
            }
            title="업무 도구"
          />
          <HomeCompactWorkTile
            description="상황별 안내 멘트 복사"
            href="/message-templates"
            icon={MessageSquare}
            iconToneClass={launcherIconTone.gold}
            onNavigate={() =>
              trackRecent({
                id: "message-templates",
                label: "고객 문구",
                href: "/message-templates",
                type: "shortcut",
              })
            }
            title="고객 문구"
          />
          <HomeCompactWorkTile
            description="상품공시·통합 약관 확인"
            href="/disclosure-links"
            icon={BookOpen}
            iconToneClass={launcherIconTone.gold}
            onNavigate={() =>
              trackRecent({
                id: "disclosure-links",
                label: "공시·약관",
                href: "/disclosure-links",
                type: "shortcut",
              })
            }
            title="공시·약관"
          />
          <HomeCompactWorkTile
            description="상담·청구 실무 참고"
            href="/knowledge"
            icon={Library}
            iconToneClass={launcherIconTone.green}
            onNavigate={() =>
              trackRecent({
                id: "knowledge",
                label: "지식 아카이브",
                href: "/knowledge",
                type: "knowledge",
              })
            }
            title="지식 아카이브"
          />
        </div>
      </section>

      {/* 3. 공개 데이터 현황 */}
      <div className="mt-8">
        <HomePublicStatsStrip loadState={loadState} stats={publicStats} />
      </div>

      {/* 4. 최근 사용·즐겨찾기 */}
      <section aria-labelledby="home-quick-exec-heading" className="mt-8">
        <SectionHeader
          eyebrow="빠른 실행"
          id="home-quick-exec-heading"
          title="최근 사용·즐겨찾기"
        />
        <p className={`mt-2 break-keep ${textStyles.small}`}>
          {HOME_RECENTS_FAVORITES_UNIFIED_NOTICE}
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0 lg:col-span-1">
            {plannerFavoritesEnabled ? (
              <PlannerFavoritesScope enabled>
                <PlannerWorkFavoritesPanel
                  claimDocuments={claimDocuments}
                  insurers={insurers.map((ins) => ({ id: ins.id, name: ins.name }))}
                  knowledgeArticles={knowledgeArticles}
                  messageTemplates={messageTemplates.map((template) => ({
                    id: template.id,
                    title: template.title,
                  }))}
                />
              </PlannerFavoritesScope>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-4 py-3">
                <p className={`min-w-0 flex-1 break-keep ${textStyles.small}`}>
                  즐겨찾기는 로그인 후 이 기기에 저장됩니다. 고객 개인정보는
                  입력하지 않습니다.
                </p>
                <PlannerFavoritesLoginPrompt callbackPath="/" compact />
              </div>
            )}

            {plannerFavoritesEnabled && plannerVerifiedWorkLinks.length > 0 ? (
              <div className="mt-4">
                <VerifiedWorkLinksSection
                  compact
                  links={plannerVerifiedWorkLinks}
                  mode="planner"
                />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-1">
            {plannerFavoritesEnabled ? (
              <section
                className={`${mobileCardShell} rounded-xl border border-[#E3DED4] bg-white p-3.5 sm:p-4 ${shadows.card}`}
              >
                <h2 className={`flex items-center gap-1.5 ${sectionEyebrow}`}>
                  <Clock className="h-3.5 w-3.5 text-[#B9975B]" />
                  최근 사용
                </h2>
                {recents.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {recents.slice(0, HOME_RECENT_DISPLAY_LIMIT).map((rec) => (
                      <li key={`${rec.kind}:${rec.id}`}>
                        <Link
                          href={rec.href}
                          aria-label={`${rec.label} ${publicWorkspaceKindLabel(rec.kind)} 바로가기`}
                          className="flex min-h-9 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-[#4A5565] transition hover:bg-[#F7F4EE] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20"
                        >
                          <span className="line-clamp-2 min-w-0 flex-1 break-keep font-medium">
                            {rec.label}
                          </span>
                          <span className="shrink-0 rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-1.5 py-0.5 text-[10px] font-semibold text-[#4A5565]">
                            {publicWorkspaceKindLabel(rec.kind)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3">
                    <EmptyStatePanel
                      description={HOME_RECENTS_EMPTY_DESCRIPTION}
                      title={HOME_RECENTS_EMPTY_TITLE}
                    />
                  </div>
                )}
              </section>
            ) : null}

            {plannerFavoritesEnabled ? (
              <HomeScreenInstallNotice compact variant="planner" />
            ) : (
              <HomeScreenInstallNotice compact variant="public" />
            )}
          </div>
        </div>
      </section>

      {/* 5. 안전 기준 안내 */}
      <details
        className={`group mt-8 ${surfaces.card} ${spacing.cardPadding} ${shadows.card}`}
      >
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={notices.safetyTitle}>{uiLabels.safetyBoundary}</p>
              <p className={`mt-1 ${textStyles.small}`}>
                고객 개인정보는 입력하지 않고, 공식 안내를 기준으로 확인합니다.
                보험금 지급 판단은 제공하지 않습니다.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold text-[#B9975B] group-open:hidden">
              펼치기
            </span>
            <span className="hidden shrink-0 text-xs font-bold text-[#B9975B] group-open:inline">
              접기
            </span>
          </div>
        </summary>
        <ul
          className={`mt-4 border-t border-[#E3DED4] pt-4 space-y-2 break-keep ${textStyles.small}`}
        >
          <li>
            플래너데스크 정보는 반복 검색을 줄이기 위한 참고용 가이드입니다.
          </li>
          <li>
            보험사별 서류·접수 기준은 수시로 변경될 수 있으므로 제출 전 공식 안내를
            재확인해 주세요.
          </li>
          <li>
            보험금 지급 판단·금액 산정·손해사정 업무는 제공하지 않습니다.
          </li>
          <li>
            고객명, 주민번호, 연락처, 계약번호, 병력 등 개인정보와 민감정보는
            입력하지 마세요.
          </li>
          <li>{PLANNER_ANSWER_ASSISTANT_HUB_NOTE}</li>
        </ul>
      </details>
    </div>
  );
}
