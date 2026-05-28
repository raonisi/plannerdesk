"use client";

import { useCallback, useMemo, useState } from "react";
import { EmptyState } from "@/components/content-page";
import { CorrectionRequestDialog } from "@/components/directory/correction-request-dialog";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";
import { useFavorites } from "@/hooks/useFavorites";
import { CORRECTION_REQUEST_COPY } from "@/lib/directory/correction-request";
import {
  buildClaimLibraryItems,
  getClaimItemsForInsurer,
} from "@/lib/claim-documents/claim-library";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import type { PublicInsurer } from "@/lib/public/insurers";

type CategoryFilter = "all" | "non_life" | "life" | "mutual" | "digital";
type StatusFilter = "all" | "verified" | "needs_review";
type FeaturedFilter = "all" | "featured";
type ViewMode = "all" | "favorites";

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "전체", value: "all" },
  { label: "손해보험", value: "non_life" },
  { label: "생명보험", value: "life" },
  { label: "공제보험", value: "mutual" },
  { label: "디지털손보사", value: "digital" },
];

function getDisplayCategory(insurer: PublicInsurer): CategoryFilter {
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

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "all" },
  { label: "검수 완료", value: "verified" },
  { label: "검수 필요", value: "needs_review" },
];

const featuredOptions: { label: string; value: FeaturedFilter }[] = [
  { label: "전체", value: "all" },
  { label: "특별 표기만", value: "featured" },
];

const FAVORITES_EMPTY_TITLE =
  "즐겨찾기한 보험사가 아직 없습니다.";
const FAVORITES_EMPTY_DESC =
  "보험사 카드 상단 오른쪽 별표 버튼을 눌러 자주 쓰는 보험사를 이 화면에 고정해 보세요.";

export function DirectoryExplorer({
  insurers,
  claimDocuments,
}: {
  insurers: PublicInsurer[];
  claimDocuments: PublicClaimDocument[];
}) {
  const allClaimItems = useMemo(
    () => buildClaimLibraryItems(claimDocuments),
    [claimDocuments],
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");
  const [view, setView] = useState<ViewMode>("all");

  const { isFavorite, toggle, count: favoriteCount } = useFavorites();

  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionPreselectedId, setCorrectionPreselectedId] = useState<
    string | null
  >(null);

  const openCorrectionRequest = useCallback((insurerId?: string) => {
    setCorrectionPreselectedId(insurerId ?? null);
    setCorrectionOpen(true);
  }, []);

  // Apply the standard filters first. Favorites view then filters this set.
  // Crucially, the favorites view operates on the already-published insurer
  // list, so any cached favorite id pointing to an unpublished or removed
  // record is silently skipped — never expose unpublished data.
  const filteredInsurers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return insurers.filter((insurer) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        insurer.name.toLocaleLowerCase("ko-KR").includes(normalizedQuery);
      const matchesCategory =
        category === "all" || getDisplayCategory(insurer) === category;
      const matchesStatus =
        status === "all" || insurer.verificationStatus === status;
      const matchesFeatured = featured === "all" || insurer.isFeatured === true;
      const matchesView = view === "all" || isFavorite(insurer.id);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured &&
        matchesView
      );
    });
  }, [category, featured, insurers, isFavorite, query, status, view]);

  // The favorites tab is only reachable via user click after hydration, so we
  // can show the empty state synchronously without a hydration gate.
  const showFavoritesEmpty =
    view === "favorites" && filteredInsurers.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <ViewTab
          active={view === "all"}
          label="전체"
          onClick={() => setView("all")}
        />
        <ViewTab
          active={view === "favorites"}
          label="즐겨찾기"
          onClick={() => setView("favorites")}
          count={favoriteCount}
        />
      </div>

      <section className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              보험사 검색
            </span>
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="보험사 이름을 입력하세요"
              type="search"
              value={query}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <FilterGroup
              label="분류"
              onChange={(value) => setCategory(value as CategoryFilter)}
              options={categoryOptions}
              value={category}
            />
            <FilterGroup
              label="검수 상태"
              onChange={(value) => setStatus(value as StatusFilter)}
              options={statusOptions}
              value={status}
            />
            <FilterGroup
              label="특별 표기"
              onChange={(value) => setFeatured(value as FeaturedFilter)}
              options={featuredOptions}
              value={featured}
            />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#4f5661]">
          {filteredInsurers.length}개 보험사가 표시됩니다. 당 정보는 관리자 검수 결과를 반영한 공개용 데이터입니다. 즐겨찾기는 이 기기에만 저장됩니다.
        </p>
      </section>

      {showFavoritesEmpty ? (
        <EmptyState
          title={FAVORITES_EMPTY_TITLE}
          description={FAVORITES_EMPTY_DESC}
        />
      ) : filteredInsurers.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredInsurers.map((insurer) => (
            <InsurerActionCard
              claimItems={getClaimItemsForInsurer(insurer, allClaimItems)}
              insurer={insurer}
              isFavorite={isFavorite(insurer.id)}
              key={insurer.id}
              onRequestCorrection={openCorrectionRequest}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="조건에 맞는 보험사가 없습니다."
          description="검색어를 줄이거나 필터를 변경해 주세요."
        />
      )}

      <section id="feedback-section" className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a612d]">
              FEEDBACK
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
  );
}

function ViewTab({
  active,
  label,
  onClick,
  count,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  // The count comes from useSyncExternalStore. During SSR and the initial
  // hydration render it is 0; React will re-render with the real value if
  // localStorage holds favorites.
  return (
    <button
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] ${
        active
          ? "border-[#102235] bg-[#102235] text-[#fbf7ee]"
          : "border-[#d9c9a8] bg-white text-[#303845] hover:border-[#aa8137]"
      }`}
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

function FilterGroup({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#303845]">{label}</legend>
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] ${
                isSelected
                  ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee]"
                  : "border-[#d9c9a8] bg-white text-[#303845] hover:border-[#aa8137]"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
