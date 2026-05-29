"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, SearchBar } from "@/components/content-page";
import {
  KNOWLEDGE_SEED_ITEMS,
  type KnowledgeCategory,
  type KnowledgeRiskLevel,
  type KnowledgeSeedItem,
  type KnowledgeStatus,
  type KnowledgeType,
} from "./knowledge-seed";

type CategoryFilter = "all" | KnowledgeCategory;
type StatusFilter = "all" | KnowledgeStatus;
type RiskFilter = "all" | KnowledgeRiskLevel | "blocked";
type TypeFilter = "all" | KnowledgeType;

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: "전체", value: "all" },
  { label: "청구 기준", value: "청구서류·접수 기준" },
  { label: "고지·심사", value: "고지·심사 전 확인" },
  { label: "해지·유지", value: "계약관리·유지 실무" },
  { label: "공시·약관", value: "공시·약관·공식 링크" },
  { label: "고객 안내문", value: "고객 안내문·응대 문구" },
  { label: "운영 안전", value: "운영 안전·금지 영역" },
  { label: "PlannerDesk 사용법", value: "PlannerDesk 사용법" },
];

const typeOptions: Array<{ label: string; value: TypeFilter }> = [
  { label: "전체", value: "all" },
  { label: "FAQ", value: "FAQ" },
  { label: "실무 기준", value: "실무 기준" },
  { label: "체크리스트", value: "체크리스트" },
  { label: "안내문 샘플", value: "안내문 샘플" },
  { label: "링크 가이드", value: "링크 가이드" },
  { label: "안전 경계", value: "안전 경계" },
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "검수 필요", value: "needs_review" },
  { label: "검수 완료", value: "verified" },
  { label: "작성 중", value: "draft" },
  { label: "보관됨", value: "archived" },
];

const riskOptions: Array<{ label: string; value: RiskFilter }> = [
  { label: "전체", value: "all" },
  { label: "낮음", value: "low" },
  { label: "주의", value: "medium" },
  { label: "높음", value: "high" },
  { label: "차단", value: "blocked" },
];

const statusLabels: Record<KnowledgeStatus, string> = {
  draft: "작성 중",
  needs_review: "검수 필요",
  verified: "검수 완료",
  archived: "보관됨",
};

const riskLabels: Record<KnowledgeRiskLevel, string> = {
  low: "낮음",
  medium: "주의",
  high: "높음",
};

const statusClasses: Record<KnowledgeStatus, string> = {
  draft: "border-[#d9c9a8] bg-[#f7f1e5] text-[#5f6670]",
  needs_review: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
  verified: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  archived: "border-[#d6d8dc] bg-[#f4f5f6] text-[#5f6670]",
};

const riskClasses: Record<KnowledgeRiskLevel, string> = {
  low: "border-[#9fb7a4] bg-[#edf4ee] text-[#173f36]",
  medium: "border-[#d9c9a8] bg-[#fff7e6] text-[#7a612d]",
  high: "border-[#c5b08a] bg-[#fff9ed] text-[#6e5127]",
};

function resetFilters(
  setQuery: (v: string) => void,
  setCategory: (v: CategoryFilter) => void,
  setTypeFilter: (v: TypeFilter) => void,
  setStatus: (v: StatusFilter) => void,
  setRisk: (v: RiskFilter) => void
) {
  setQuery("");
  setCategory("all");
  setTypeFilter("all");
  setStatus("all");
  setRisk("all");
}

export function KnowledgeArchiveList() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [risk, setRisk] = useState<RiskFilter>("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return KNOWLEDGE_SEED_ITEMS.filter((item) => {
      const searchTarget = [
        item.title,
        item.summary,
        item.category,
        item.type,
        ...(item.tags || []),
        item.workflowLabel || "",
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesCategory = category === "all" || item.category === category;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = status === "all" || item.status === status;
      const matchesRisk =
        risk === "all" ||
        (risk === "blocked"
          ? item.type === "안전 경계"
          : item.riskLevel === risk);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesType &&
        matchesStatus &&
        matchesRisk
      );
    });
  }, [category, query, risk, status, typeFilter]);

  const handleReset = () =>
    resetFilters(setQuery, setCategory, setTypeFilter, setStatus, setRisk);

  return (
    <div className="space-y-6">
      <section
        aria-label="지식 아카이브 검색 및 필터"
        className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6"
      >
        <label className="block" htmlFor="knowledge-archive-search">
          <span className="text-sm font-semibold text-[#303845]">검색</span>
          <div className="mt-2">
            <SearchBar
              ariaLabel="지식 문서, 태그, 업무 기준 검색"
              id="knowledge-archive-search"
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="지식 문서, 태그, 업무 기준을 검색하세요"
              value={query}
            />
          </div>
        </label>

        <div className="mt-4 grid gap-5 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <FilterGroup
            label="카테고리"
            onChange={(value) => setCategory(value as CategoryFilter)}
            options={categoryOptions}
            value={category}
          />
          <FilterGroup
            label="문서 유형"
            onChange={(value) => setTypeFilter(value as TypeFilter)}
            options={typeOptions}
            value={typeFilter}
          />
          <FilterGroup
            label="검수상태"
            onChange={(value) => setStatus(value as StatusFilter)}
            options={statusOptions}
            value={status}
          />
          <FilterGroup
            label="위험도"
            onChange={(value) => setRisk(value as RiskFilter)}
            options={riskOptions}
            value={risk}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#e3d5b8] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className="text-sm font-medium text-[#4f5661]"
            role="status"
          >
            총{" "}
            <strong className="text-[#102235]">
              {KNOWLEDGE_SEED_ITEMS.length}
            </strong>
            개 중{" "}
            <strong className="text-[#102235]">{filteredItems.length}</strong>
            개 문서를 표시 중입니다.
          </p>
          <button
            type="button"
            aria-label="검색어 및 필터 초기화"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#7a612d] transition hover:border-[#aa8137] hover:text-[#aa8137] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa8137]/40 focus-visible:ring-offset-2"
            onClick={handleReset}
          >
            필터 초기화
          </button>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <ul className="grid list-none gap-5 p-0 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <KnowledgeCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="조건에 맞는 지식 문서가 없습니다."
          description="검색어를 줄이거나 필터를 초기화해보세요."
        />
      )}
    </div>
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
              aria-label={`${label} ${option.label}`}
              className={`min-h-11 rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa8137]/40 focus-visible:ring-offset-2 ${
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

function KnowledgeCard({ item }: { item: KnowledgeSeedItem }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_14px_30px_rgba(16,34,53,0.04)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#d9c9a8] bg-white px-3 py-1 text-xs font-semibold text-[#7a612d]">
          {item.category}
        </span>
        <span className="rounded-full border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-1 text-xs font-semibold text-[#5f6670]">
          {item.type}
        </span>
      </div>

      <h3 className="mt-3 break-keep text-lg font-semibold leading-snug text-[#102235] sm:text-xl">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-3 break-keep text-sm leading-6 text-[#4f5661]">
        {item.summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[item.status]}`}
        >
          상태: {statusLabels[item.status]}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClasses[item.riskLevel]}`}
        >
          위험도: {riskLabels[item.riskLevel]}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {item.aiUsable ? "AI 참조 가능" : "AI 참조 전 검수 필요"}
      </p>
      {item.slug ? (
        <Link
          className="mt-1 inline-flex min-h-11 items-center text-xs font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa8137]/40 focus-visible:ring-offset-2"
          href={`/knowledge/${item.slug}`}
        >
          상세 보기
        </Link>
      ) : (
        <p className="mt-1 text-xs leading-5 text-[#8a909a]">상세 보기 준비 중</p>
      )}

      {item.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
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
