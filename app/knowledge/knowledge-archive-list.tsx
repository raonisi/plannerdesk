"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  KnowledgeArticleCategory,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
} from "@prisma/client";
import { EmptyState } from "@/components/content-page";
import { PUBLIC_EMPTY_CONTENT_UPDATING } from "@/lib/public/public-surface-terminology";
import { GatedFavoriteButton } from "@/components/planner-favorites/gated-favorite-button";
import { KnowledgeFavoritesStrip } from "@/components/planner-favorites/knowledge-favorites-strip";
import { PlannerFavoritesScope } from "@/components/planner-favorites/planner-favorites-scope";
import { PLANNER_FAVORITE_STORAGE_KEYS } from "@/lib/planner-favorites/storage-keys";
import { useLocalIdFavorites } from "@/hooks/useLocalIdFavorites";
import { BrowseNextSteps } from "@/components/search/browse-next-steps";
import {
  buildKnowledgeArchiveHref,
  defaultKnowledgeArchiveFilterState,
  hasActiveKnowledgeFilters,
  KNOWLEDGE_ARCHIVE_EMPTY_MESSAGE,
  PUBLIC_RISK_GUIDANCE_LABEL,
  type KnowledgeArchiveFilterState,
  type KnowledgeArchiveSort,
} from "@/lib/knowledge/archive-filter";
import {
  PUBLIC_CATEGORY_LABEL,
  PUBLIC_TYPE_LABEL,
} from "@/lib/public/knowledge-display";
import { publicKnowledgeTrustHint } from "@/lib/knowledge/workflow-labels";
import type { PublicKnowledgeArticleListItem } from "@/lib/public/knowledge-articles";
import { recordRecentWorkVisit } from "@/lib/planner-favorites/recent-work-client";
import {
  mobileCardActions,
  mobileCardBadgeRow,
  mobileCardDescription,
  mobileCardPaddingRoomy,
  mobileCardShell,
  mobileCardTitle,
} from "@/lib/mobile/card-density";

const categoryOptions: Array<{
  label: string;
  value: KnowledgeArchiveFilterState["category"];
}> = [
  { label: "전체", value: "all" },
  ...Object.values(KnowledgeArticleCategory).map((value) => ({
    label: PUBLIC_CATEGORY_LABEL[value],
    value,
  })),
];

const typeOptions: Array<{
  label: string;
  value: KnowledgeArchiveFilterState["type"];
}> = [
  { label: "전체", value: "all" },
  ...Object.values(KnowledgeArticleType).map((value) => ({
    label: PUBLIC_TYPE_LABEL[value],
    value,
  })),
];

const reviewOptions: Array<{
  label: string;
  value: KnowledgeArchiveFilterState["review"];
}> = [
  { label: "전체", value: "all" },
  { label: "공식 확인 진행 중", value: "needs_review" },
  { label: "공식 확인 완료", value: "verified" },
];

const riskOptions: Array<{
  label: string;
  value: KnowledgeArchiveFilterState["risk"];
}> = [
  { label: "전체", value: "all" },
  { label: PUBLIC_RISK_GUIDANCE_LABEL.low, value: KnowledgeRiskLevel.low },
  {
    label: PUBLIC_RISK_GUIDANCE_LABEL.medium,
    value: KnowledgeRiskLevel.medium,
  },
  {
    label: PUBLIC_RISK_GUIDANCE_LABEL.high,
    value: KnowledgeRiskLevel.high,
  },
];

const sortOptions: { label: string; value: KnowledgeArchiveSort }[] = [
  { label: "최신 공개순", value: "latest" },
  { label: "업데이트순", value: "updated" },
  { label: "활용 주의도순", value: "risk" },
];

const riskToneClasses: Record<KnowledgeRiskLevel, string> = {
  [KnowledgeRiskLevel.low]: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  [KnowledgeRiskLevel.medium]: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  [KnowledgeRiskLevel.high]: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
  [KnowledgeRiskLevel.blocked]: "border-[#d6d8dc] bg-[#f4f5f6] text-[#5f6670]",
};

interface KnowledgeArchiveListProps {
  items: PublicKnowledgeArticleListItem[];
  filteredItems: PublicKnowledgeArticleListItem[];
  filterState: KnowledgeArchiveFilterState;
  blockedMessage: string | null;
  isCatalogEmpty: boolean;
  plannerFavoritesEnabled?: boolean;
}

function mergeState(
  base: KnowledgeArchiveFilterState,
  patch: Partial<KnowledgeArchiveFilterState>,
): KnowledgeArchiveFilterState {
  return { ...base, ...patch };
}

export function KnowledgeArchiveList({
  items,
  filteredItems,
  filterState,
  blockedMessage,
  isCatalogEmpty,
  plannerFavoritesEnabled = false,
}: KnowledgeArchiveListProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeChips = useMemo(() => {
    const chips: { label: string; href: string }[] = [];
    if (filterState.q) {
      chips.push({
        label: `검색: ${filterState.q}`,
        href: buildKnowledgeArchiveHref(mergeState(filterState, { q: "" })),
      });
    }
    if (filterState.category !== "all") {
      chips.push({
        label: PUBLIC_CATEGORY_LABEL[filterState.category],
        href: buildKnowledgeArchiveHref(
          mergeState(filterState, { category: "all" }),
        ),
      });
    }
    if (filterState.type !== "all") {
      chips.push({
        label: PUBLIC_TYPE_LABEL[filterState.type],
        href: buildKnowledgeArchiveHref(mergeState(filterState, { type: "all" })),
      });
    }
    if (filterState.risk !== "all") {
      chips.push({
        label: PUBLIC_RISK_GUIDANCE_LABEL[filterState.risk],
        href: buildKnowledgeArchiveHref(mergeState(filterState, { risk: "all" })),
      });
    }
    if (filterState.review !== "all") {
      const reviewLabel =
        filterState.review === "needs_review"
          ? "공식 확인 진행 중"
          : "공식 확인 완료";
      chips.push({
        label: reviewLabel,
        href: buildKnowledgeArchiveHref(
          mergeState(filterState, { review: "all" }),
        ),
      });
    }
    if (filterState.sort !== "latest") {
      const sortLabel =
        sortOptions.find((o) => o.value === filterState.sort)?.label ??
        filterState.sort;
      chips.push({
        label: sortLabel,
        href: buildKnowledgeArchiveHref(
          mergeState(filterState, { sort: "latest" }),
        ),
      });
    }
    return chips;
  }, [filterState]);

  const navigate = (patch: Partial<KnowledgeArchiveFilterState>) => {
    router.push(buildKnowledgeArchiveHref(mergeState(filterState, patch)));
  };

  if (isCatalogEmpty) {
    return (
      <EmptyState
        description={PUBLIC_EMPTY_CONTENT_UPDATING}
        title="등록된 지식 콘텐츠가 없습니다."
      />
    );
  }

  return (
    <PlannerFavoritesScope enabled={plannerFavoritesEnabled}>
    <div className="space-y-6">
      <section
        aria-label="지식 아카이브 검색 및 필터"
        className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6"
      >
        <form action="/knowledge" className="space-y-4" method="get" role="search">
          <label className="block" htmlFor="knowledge-archive-search">
            <span className="text-sm font-semibold text-[#303845]">검색</span>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#E3DED4] bg-white px-4 text-base font-medium text-[#17202A] outline-none placeholder:text-[#4A5565] focus:ring-2 focus:ring-[#B9975B]/40"
                defaultValue={filterState.q}
                id="knowledge-archive-search"
                maxLength={50}
                name="q"
                placeholder="지식 문서, 태그, 업무 기준을 검색하세요"
                type="search"
              />
              <button
                className="min-h-12 rounded-xl bg-[#102235] px-5 text-sm font-semibold text-white hover:bg-[#1b344e]"
                type="submit"
              >
                검색
              </button>
            </div>
          </label>
          <PreserveFiltersExceptQ filterState={filterState} />
          <p className="text-xs leading-5 text-[#5f6670]">
            개인정보·의료정보·계약정보·보험금 지급 판단 관련 검색은 제공하지
            않습니다. 준비 중인 항목은 표시되지 않습니다.
          </p>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 lg:hidden">
          <button
            aria-expanded={mobileFiltersOpen}
            className="min-h-11 rounded-full border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#303845]"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            type="button"
          >
            {mobileFiltersOpen ? "필터 닫기" : "필터 열기"}
          </button>
          <Link
            className="min-h-11 rounded-full border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#7a612d]"
            href={buildKnowledgeArchiveHref(defaultKnowledgeArchiveFilterState())}
          >
            초기화
          </Link>
        </div>

        <div
          className={`mt-4 grid gap-5 lg:grid-cols-2 xl:grid-cols-4 ${mobileFiltersOpen ? "grid" : "hidden lg:grid"}`}
        >
          <FilterGroup
            label="카테고리"
            onSelect={(value) =>
              navigate({ category: value as KnowledgeArchiveFilterState["category"] })
            }
            options={categoryOptions}
            value={filterState.category}
          />
          <FilterGroup
            label="문서 유형"
            onSelect={(value) =>
              navigate({ type: value as KnowledgeArchiveFilterState["type"] })
            }
            options={typeOptions}
            value={filterState.type}
          />
          <FilterGroup
            label="활용 주의도"
            onSelect={(value) =>
              navigate({ risk: value as KnowledgeArchiveFilterState["risk"] })
            }
            options={riskOptions}
            value={filterState.risk}
          />
          <FilterGroup
            label="확인 단계"
            onSelect={(value) =>
              navigate({ review: value as KnowledgeArchiveFilterState["review"] })
            }
            options={reviewOptions}
            value={filterState.review}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block text-sm font-semibold text-[#303845]">
            정렬
            <select
              className="mt-1 min-h-11 w-full min-w-[12rem] rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm text-[#102235] sm:w-auto"
              onChange={(event) =>
                navigate({ sort: event.target.value as KnowledgeArchiveSort })
              }
              value={filterState.sort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Link
            className="hidden min-h-11 items-center justify-center rounded-lg border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#7a612d] hover:border-[#aa8137] lg:inline-flex"
            href={buildKnowledgeArchiveHref(defaultKnowledgeArchiveFilterState())}
          >
            필터 초기화
          </Link>
        </div>

        {activeChips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e3d5b8] pt-4">
            {activeChips.map((chip) => (
              <Link
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#d9c9a8] bg-white px-3 text-xs font-semibold text-[#4f5661] hover:border-[#aa8137]"
                href={chip.href}
                key={chip.label}
              >
                {chip.label}
                <span aria-hidden="true">×</span>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-t border-[#e3d5b8] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="text-sm font-medium text-[#4f5661]"
            role="status"
          >
            공개 문서{" "}
            <strong className="text-[#102235]">{items.length}</strong>개 중{" "}
            <strong className="text-[#102235]">{filteredItems.length}</strong>
            개 표시
            {hasActiveKnowledgeFilters(filterState) ? " (필터 적용)" : ""}
          </p>
        </div>
      </section>

      {plannerFavoritesEnabled ? <KnowledgeFavoritesStrip articles={items} /> : null}

      {blockedMessage ? (
        <div
          className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
          role="alert"
        >
          {blockedMessage}
        </div>
      ) : null}

      {!blockedMessage && filteredItems.length > 0 ? (
        <ul className="grid list-none gap-5 p-0 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <KnowledgeCard item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      {!blockedMessage && filteredItems.length === 0 ? (
        <div className="space-y-5">
          <EmptyState
            description={KNOWLEDGE_ARCHIVE_EMPTY_MESSAGE}
            title="조건에 맞는 지식 문서가 없습니다."
          />
          <BrowseNextSteps title="다른 공개 정보 찾기" />
        </div>
      ) : null}
    </div>
    </PlannerFavoritesScope>
  );
}

function PreserveFiltersExceptQ({
  filterState,
}: {
  filterState: KnowledgeArchiveFilterState;
}) {
  return (
    <>
      {filterState.category !== "all" ? (
        <input name="category" type="hidden" value={filterState.category} />
      ) : null}
      {filterState.type !== "all" ? (
        <input name="type" type="hidden" value={filterState.type} />
      ) : null}
      {filterState.risk !== "all" ? (
        <input name="risk" type="hidden" value={filterState.risk} />
      ) : null}
      {filterState.review !== "all" ? (
        <input name="review" type="hidden" value={filterState.review} />
      ) : null}
      {filterState.sort !== "latest" ? (
        <input name="sort" type="hidden" value={filterState.sort} />
      ) : null}
    </>
  );
}

function FilterGroup({
  label,
  onSelect,
  options,
  value,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold text-[#303845]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              aria-pressed={isSelected}
              className={`min-h-11 rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa8137]/40 focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-[#173f36] bg-[#173f36] text-[#fbf7ee]"
                  : "border-[#d9c9a8] bg-white text-[#303845] hover:border-[#aa8137]"
              }`}
              key={option.value}
              onClick={() => onSelect(option.value)}
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

function KnowledgeCard({ item }: { item: PublicKnowledgeArticleListItem }) {
  const { isFavorite, toggle } = useLocalIdFavorites(
    PLANNER_FAVORITE_STORAGE_KEYS.knowledgeArticles,
  );
  const dateParts: string[] = [];
  if (item.publishedAt) dateParts.push(`공개 ${item.publishedAt}`);
  if (item.updatedAt) dateParts.push(`업데이트 ${item.updatedAt}`);
  const trustHint = publicKnowledgeTrustHint(item.status);

  const recordVisit = () => {
    recordRecentWorkVisit({
      id: item.id,
      label: item.title,
      href: `/knowledge/${item.slug}`,
      type: "knowledge",
    });
  };

  return (
    <article className={`flex h-full flex-col ${mobileCardShell} ${mobileCardPaddingRoomy} rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] shadow-[0_14px_30px_rgba(16,34,53,0.04)]`}>
      <h3 className={mobileCardTitle}>
        <Link
          className="hover:text-[#7a612d] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
          href={`/knowledge/${item.slug}`}
          onClick={recordVisit}
        >
          {item.title}
        </Link>
      </h3>

      <div className={`mt-2 ${mobileCardBadgeRow}`}>
        <span className="rounded-full border border-[#d9c9a8] bg-white px-3 py-1 text-xs font-semibold text-[#7a612d]">
          {item.categoryLabel}
        </span>
        <span className="rounded-full border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-1 text-xs font-semibold text-[#5f6670]">
          {item.typeLabel}
        </span>
        <GatedFavoriteButton
          active={isFavorite(item.id)}
          callbackPath="/knowledge"
          label={item.title}
          onToggle={() => toggle(item.id)}
        />
      </div>

      <p className={`mt-2 ${mobileCardDescription}`}>
        {item.summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {trustHint ? (
          <span className="inline-flex items-center rounded-full border border-[#c5b08a] bg-[#fff9ed] px-2.5 py-1 text-xs font-semibold text-[#6e5127]">
            {trustHint}
          </span>
        ) : null}
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskToneClasses[item.riskLevel]}`}
        >
          {PUBLIC_RISK_GUIDANCE_LABEL[item.riskLevel]}
        </span>
      </div>

      {dateParts.length > 0 ? (
        <p className="mt-3 text-xs text-[#5f6670]">{dateParts.join(" · ")}</p>
      ) : null}

      <div className={mobileCardActions}>
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#102235] px-4 text-sm font-semibold text-white hover:bg-[#1b344e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] sm:w-fit"
        href={`/knowledge/${item.slug}`}
        onClick={recordVisit}
      >
          자세히 보기
        </Link>
      </div>

      {item.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.slice(0, 6).map((tag) => (
            <span
              className="rounded-full border border-[#e3d5b8] bg-white px-2.5 py-1 text-xs text-[#4f5661]"
              key={`${item.id}-${tag}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
