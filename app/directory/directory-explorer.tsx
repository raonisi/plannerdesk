"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/content-page";
import { BrowseNextSteps } from "@/components/search/browse-next-steps";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";
import { InsurerCompactWorkbenchRow } from "@/components/directory/insurer-compact-workbench-row";
import { CorrectionRequestDialog } from "@/components/directory/correction-request-dialog";
import { PlannerFavoritesScope } from "@/components/planner-favorites/planner-favorites-scope";
import { LOCAL_FAVORITES_DEVICE_NOTICE } from "@/lib/planner-favorites/copy";
import { MOBILE_FAVORITES_NOTICE_SHORT } from "@/lib/mobile/field-usability";
import { useFavorites } from "@/hooks/useFavorites";
import { CORRECTION_REQUEST_COPY } from "@/lib/directory/correction-request";
import { DIRECTORY_CORRECTION_SECTION_TITLE } from "@/lib/directory/directory-workbench-copy";
import { DIRECTORY_PUBLIC_GLOBAL_NOTICE } from "@/lib/directory/public-directory-surface";
import {
  buildClaimLibraryItems,
  getClaimItemsForInsurer,
} from "@/lib/claim-documents/claim-library";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import type { PublicInsurer } from "@/lib/public/insurers";
import type { PublicClaimPdfGovernanceOverlay } from "@/lib/claim-documents/governance-repository";

type TabType = "all" | "life" | "non_life" | "mutual" | "digital" | "favorites";
type ViewMode = "grid" | "list";

const tabOptions: { label: string; value: TabType }[] = [
  { label: "전체", value: "all" },
  { label: "생명보험", value: "life" },
  { label: "손해보험", value: "non_life" },
  { label: "공제보험", value: "mutual" },
  { label: "디지털손보사", value: "digital" },
  { label: "즐겨찾기", value: "favorites" },
];

function getDisplayCategory(insurer: PublicInsurer): "life" | "non_life" | "mutual" | "digital" {
  if (
    insurer.id.endsWith("-mutual") ||
    insurer.name.includes("공제") ||
    insurer.name.includes("우체국")
  ) {
    return "mutual";
  }
  if (
    insurer.id.endsWith("-digital") ||
    insurer.name.includes("디지털") ||
    insurer.name.includes("캐롯")
  ) {
    return "digital";
  }
  return insurer.category;
}

const FAVORITES_EMPTY_TITLE = "즐겨찾기한 보험사가 아직 없습니다.";
const FAVORITES_EMPTY_DESC =
  "보험사 행 오른쪽 별표 버튼을 눌러 자주 쓰는 보험사를 이 화면에 고정해 보세요.";

const CHOSUNG_LIST = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

function toChosung(value: string) {
  let result = "";

  for (const char of value) {
    const code = char.charCodeAt(0);

    if (code >= 44032 && code <= 55203) {
      result += CHOSUNG_LIST[Math.floor((code - 44032) / 588)];
    } else {
      result += char;
    }
  }

  return result;
}

export function DirectoryExplorer({
  insurers,
  claimDocuments,
  plannerFavoritesEnabled = false,
  pdfGovernanceOverlay,
}: {
  insurers: PublicInsurer[];
  claimDocuments: PublicClaimDocument[];
  plannerFavoritesEnabled?: boolean;
  pdfGovernanceOverlay?: PublicClaimPdfGovernanceOverlay | null;
}) {
  const searchParams = useSearchParams();
  const searchFromQuery = searchParams.get("search");
  const insurerFromQuery = searchParams.get("insurer");
  const allClaimItems = useMemo(
    () => buildClaimLibraryItems(claimDocuments, pdfGovernanceOverlay),
    [claimDocuments, pdfGovernanceOverlay],
  );
  const [query, setQuery] = useState(() => searchFromQuery ?? "");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { isFavorite, toggle, count: favoriteCount } = useFavorites();
  const visibleTabs = plannerFavoritesEnabled
    ? tabOptions
    : tabOptions.filter((tab) => tab.value !== "favorites");

  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionPreselectedId, setCorrectionPreselectedId] = useState<
    string | null
  >(null);
  const highlightedInsurerRef = useRef<HTMLDivElement | null>(null);

  const insurerFromQueryMatch = useMemo(() => {
    if (!insurerFromQuery) return null;
    return insurers.find((insurer) => insurer.id === insurerFromQuery) ?? null;
  }, [insurerFromQuery, insurers]);

  useEffect(() => {
    if (!insurerFromQueryMatch) return;
    highlightedInsurerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [insurerFromQueryMatch]);

  const openCorrectionRequest = (insurerId?: string) => {
    setCorrectionPreselectedId(insurerId ?? null);
    setCorrectionOpen(true);
  };

  const filteredInsurers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return insurers.filter((insurer) => {
      if (insurerFromQuery && insurer.id !== insurerFromQuery) {
        return false;
      }

      const matchText = [
        insurer.name,
        insurer.officialWebsiteUrl,
        insurer.systemUrl,
        insurer.customerCenterPhone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("ko-KR");
      const matchesQuery =
        normalizedQuery.length === 0 ||
        matchText.includes(normalizedQuery) ||
        toChosung(matchText).includes(normalizedQuery);
      
      const tabCategory = activeTab === "favorites" ? "all" : activeTab;
      const matchesCategory =
        tabCategory === "all" || getDisplayCategory(insurer) === tabCategory;
      const matchesView = activeTab !== "favorites" || isFavorite(insurer.id);

      return matchesQuery && matchesCategory && matchesView;
    });
  }, [activeTab, insurerFromQuery, insurers, isFavorite, query]);

  const showFavoritesEmpty =
    activeTab === "favorites" && filteredInsurers.length === 0;

  return (
    <PlannerFavoritesScope enabled={plannerFavoritesEnabled}>
    <div className="space-y-6">
      {insurerFromQueryMatch ? (
        <section
          aria-label="선택한 보험사 안내"
          className="rounded-xl border border-[#d9c9a8] bg-[#fff9ed] px-4 py-3 text-sm leading-6 text-[#4f5661]"
        >
          <p>
            <span className="font-bold text-[#102235]">
              {insurerFromQueryMatch.name}
            </span>
            {" "}기준으로 청구 정보를 표시합니다.{" "}
            <Link
              className="font-semibold text-[#7a612d] underline underline-offset-2"
              href={`/claim-documents?insurer=${encodeURIComponent(insurerFromQueryMatch.id)}`}
            >
              필요서류 확인
            </Link>
          </p>
        </section>
      ) : insurerFromQuery ? (
        <section className="rounded-xl border border-[#E3DED4] bg-[#F8F7F3] px-4 py-3 text-sm leading-6 text-[#5B6470]">
          요청한 보험사를 찾을 수 없습니다. 검색어로 다시 찾아보세요.
        </section>
      ) : null}

      <section
        aria-label="보험사 링크 안내"
        className="hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 print:hidden sm:block"
      >
        <p>{DIRECTORY_PUBLIC_GLOBAL_NOTICE}</p>
      </section>
      <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm leading-6 text-slate-600 print:hidden sm:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
          안내 보기
        </summary>
        <p className="pb-2 pt-1">{DIRECTORY_PUBLIC_GLOBAL_NOTICE}</p>
      </details>

      {/* 검색 영역 — 모바일에서 탭보다 먼저 */}
      <section className="rounded-xl border border-[#E3DED4] bg-[#F7F4EE] p-4 shadow-sm sm:p-6">
        <label className="block">
          <span className="text-sm font-bold text-[#0F1D2E]">보험사 검색</span>
          <input
            aria-label="보험사명·초성 검색"
            className="mt-2 min-h-12 w-full min-w-0 rounded-lg border border-[#E3DED4] bg-white px-4 py-3 text-base text-[#17202A] outline-none transition placeholder:text-[#5B6470] focus-visible:border-[#B9975B] focus-visible:ring-2 focus-visible:ring-[#B9975B]/30"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="보험사명·초성 검색, 예: 삼성화재 또는 ㅅㅅㅎㅈ"
            type="search"
            value={query}
          />
        </label>
        <p className="mt-3 text-sm leading-6 text-[#4f5661]">
          {filteredInsurers.length}개 보험사
          <span className="sm:hidden"> · {MOBILE_FAVORITES_NOTICE_SHORT}</span>
          <span className="hidden sm:inline">
            {" "}가 표시됩니다. {LOCAL_FAVORITES_DEVICE_NOTICE}
          </span>
        </p>
      </section>

      {/* 탭 영역 */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map((tab) => (
            <ViewTab
              active={activeTab === tab.value}
              key={tab.value}
              label={tab.label}
              onClick={() => setActiveTab(tab.value)}
              count={tab.value === "favorites" ? favoriteCount : undefined}
              compact
            />
          ))}
        </div>
        <div className="hidden shrink-0 rounded-full border border-[#d9c9a8] bg-white p-1 sm:inline-flex">
          <ViewModeButton
            active={viewMode === "grid"}
            label="그리드"
            onClick={() => setViewMode("grid")}
          />
          <ViewModeButton
            active={viewMode === "list"}
            label="리스트"
            onClick={() => setViewMode("list")}
          />
        </div>
      </div>

      {showFavoritesEmpty ? (
        <EmptyState
          title={FAVORITES_EMPTY_TITLE}
          description={FAVORITES_EMPTY_DESC}
        />
      ) : filteredInsurers.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-3 lg:grid-cols-2"
              : "grid grid-cols-1 gap-3"
          }
        >
          {filteredInsurers.map((insurer) => (
            <div
              id={insurer.id === insurerFromQuery ? "directory-insurer-focus" : undefined}
              key={insurer.id}
              ref={
                insurer.id === insurerFromQuery ? highlightedInsurerRef : undefined
              }
            >
              {viewMode === "list" ? (
                <InsurerCompactWorkbenchRow
                  claimItems={getClaimItemsForInsurer(insurer, allClaimItems)}
                  insurer={insurer}
                  isFavorite={plannerFavoritesEnabled ? isFavorite(insurer.id) : false}
                  layout="list"
                  onRequestCorrection={openCorrectionRequest}
                  onToggleFavorite={plannerFavoritesEnabled ? toggle : undefined}
                />
              ) : (
                <InsurerActionCard
                  claimItems={getClaimItemsForInsurer(insurer, allClaimItems)}
                  insurer={insurer}
                  isFavorite={plannerFavoritesEnabled ? isFavorite(insurer.id) : false}
                  onRequestCorrection={openCorrectionRequest}
                  onToggleFavorite={plannerFavoritesEnabled ? toggle : undefined}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          <EmptyState
            description="보험사명·초성을 다르게 입력하거나, 통합 검색에서 청구서류·지식을 찾아보세요."
            title="조건에 맞는 보험사가 없습니다."
          />
          <BrowseNextSteps title="다른 메뉴에서 찾기" />
        </div>
      )}

      <section id="feedback-section" className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a612d]">
              {DIRECTORY_CORRECTION_SECTION_TITLE}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[#102235]">
              {CORRECTION_REQUEST_COPY.triggerLabel}
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#4f5661]">
              {CORRECTION_REQUEST_COPY.triggerHint} {CORRECTION_REQUEST_COPY.reviewNoticeBody}
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-[#aa8137] bg-[#fff7e6] px-4 py-2 text-sm font-semibold text-[#7a612d] transition hover:border-[#7a612d] hover:bg-[#fbf0d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] sm:self-auto"
            onClick={() => openCorrectionRequest()}
            type="button"
          >
            {CORRECTION_REQUEST_COPY.triggerLabel}
          </button>
        </div>
      </section>

      <CorrectionRequestDialog
        insurers={insurers}
        onOpenChange={setCorrectionOpen}
        open={correctionOpen}
        preselectedInsurerId={correctionPreselectedId}
      />
    </div>
    </PlannerFavoritesScope>
  );
}

function ViewTab({
  active,
  label,
  onClick,
  count,
  compact = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: number;
  compact?: boolean;
}) {
  return (
    <button
      aria-pressed={active}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] ${
        active
          ? "border-[#102235] bg-[#102235] text-[#fbf7ee]"
          : "border-[#d9c9a8] bg-white text-[#303845] hover:border-[#aa8137]"
      } ${compact ? "whitespace-nowrap" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span
          className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
            active
              ? "bg-[#fbf7ee] text-[#102235]"
              : "bg-[#f7f1e5] text-[#7a612d]"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function ViewModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`${label} 보기`}
      aria-pressed={active}
      className={`min-h-10 rounded-full px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${
        active
          ? "bg-[#102235] text-[#fbf7ee]"
          : "text-[#5f6670] hover:text-[#102235]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
