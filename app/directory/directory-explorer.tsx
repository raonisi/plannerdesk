"use client";

import { useCallback, useMemo, useState } from "react";
import { EmptyState } from "@/components/content-page";
import { CorrectionRequestDialog } from "@/components/directory/correction-request-dialog";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";
import { useFavorites } from "@/hooks/useFavorites";
import { CORRECTION_REQUEST_COPY } from "@/lib/directory/correction-request";
import type { PublicInsurer } from "@/lib/public/insurers";

type CategoryFilter = "all" | PublicInsurer["category"];
type StatusFilter = "all" | "verified" | "needs_review";
type FeaturedFilter = "all" | "featured";
type ViewMode = "all" | "favorites";

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "\uc804\uccb4", value: "all" },
  { label: "\uc190\ud574\ubcf4\ud5d8", value: "non_life" },
  { label: "\uc0dd\uba85\ubcf4\ud5d8", value: "life" },
];

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "\uc804\uccb4", value: "all" },
  { label: "\uac80\uc218 \uc644\ub8cc", value: "verified" },
  { label: "\uac80\uc218 \ud544\uc694", value: "needs_review" },
];

const featuredOptions: { label: string; value: FeaturedFilter }[] = [
  { label: "\uc804\uccb4", value: "all" },
  { label: "\ud2b9\ubcc4 \ud45c\uae30\ub9cc", value: "featured" },
];

const FAVORITES_EMPTY_TITLE =
  "\uc990\uaca8\ucc3e\uae30\ud55c \ubcf4\ud5d8\uc0ac\uac00 \uc544\uc9c1 \uc5c6\uc2b5\ub2c8\ub2e4.";
const FAVORITES_EMPTY_DESC =
  "\ubcf4\ud5d8\uc0ac \uce74\ub4dc \uc0c1\ub2e8 \uc624\ub978\ucabd \ubcc4\ud45c \ubc84\ud2bc\uc744 \ub20c\ub7ec \uc790\uc8fc \uc4f0\ub294 \ubcf4\ud5d8\uc0ac\ub97c \uc774 \ud654\uba74\uc5d0 \uace0\uc815\ud574 \ubcf4\uc138\uc694.";

export function DirectoryExplorer({
  insurers,
}: {
  insurers: PublicInsurer[];
}) {
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
        category === "all" || insurer.category === category;
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
          label="\uc804\uccb4"
          onClick={() => setView("all")}
        />
        <ViewTab
          active={view === "favorites"}
          label="\uc990\uaca8\ucc3e\uae30"
          onClick={() => setView("favorites")}
          count={favoriteCount}
        />
      </div>

      <section className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              \ubcf4\ud5d8\uc0ac \uac80\uc0c9
            </span>
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/20"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="\ubcf4\ud5d8\uc0ac \uc774\ub984\uc744 \uc785\ub825\ud558\uc138\uc694"
              type="search"
              value={query}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <FilterGroup
              label="\ubd84\ub958"
              onChange={(value) => setCategory(value as CategoryFilter)}
              options={categoryOptions}
              value={category}
            />
            <FilterGroup
              label="\uac80\uc218 \uc0c1\ud0dc"
              onChange={(value) => setStatus(value as StatusFilter)}
              options={statusOptions}
              value={status}
            />
            <FilterGroup
              label="\ud2b9\ubcc4 \ud45c\uae30"
              onChange={(value) => setFeatured(value as FeaturedFilter)}
              options={featuredOptions}
              value={featured}
            />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#4f5661]">
          {filteredInsurers.length}\uac1c \ubcf4\ud5d8\uc0ac\uac00 \ud45c\uc2dc\ub429\ub2c8\ub2e4. \ub2f9 \uc815\ubcf4\ub294 \uad00\ub9ac\uc790 \uac80\uc218 \uacb0\uacfc\ub97c \ubc18\uc601\ud55c \uacf5\uac1c\uc6a9 \ub370\uc774\ud130\uc785\ub2c8\ub2e4. \uc990\uaca8\ucc3e\uae30\ub294 \uc774 \uae30\uae30\uc5d0\ub9cc \uc800\uc7a5\ub429\ub2c8\ub2e4.
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
          title="\uc870\uac74\uc5d0 \ub9de\ub294 \ubcf4\ud5d8\uc0ac\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."
          description="\uac80\uc0c9\uc5b4\ub97c \uc904\uc774\uac70\ub098 \ud544\ud130\ub97c \ubcc0\uacbd\ud574 \uc8fc\uc138\uc694."
        />
      )}

      <section className="rounded-2xl border border-[#d9c9a8] bg-white p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
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
