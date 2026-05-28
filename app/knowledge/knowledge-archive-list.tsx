"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/content-page";
import {
  KNOWLEDGE_CATEGORIES,
  KNOWLEDGE_SEED_ITEMS,
  type KnowledgeCategory,
  type KnowledgeRiskLevel,
  type KnowledgeSeedItem,
  type KnowledgeStatus,
} from "./knowledge-seed";

type CategoryFilter = "all" | KnowledgeCategory;
type StatusFilter = "all" | "needs_review" | "verified";
type RiskFilter = "all" | KnowledgeRiskLevel;

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: "전체", value: "all" },
  ...KNOWLEDGE_CATEGORIES.map((category) => ({ label: category, value: category })),
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "검수 필요", value: "needs_review" },
  { label: "검수 완료", value: "verified" },
];

const riskOptions: Array<{ label: string; value: RiskFilter }> = [
  { label: "전체", value: "all" },
  { label: "low", value: "low" },
  { label: "medium", value: "medium" },
  { label: "high", value: "high" },
];

const statusLabels: Record<KnowledgeStatus, string> = {
  draft: "작성 중",
  needs_review: "검수 필요",
  verified: "검수 완료",
  archived: "보관됨",
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

export function KnowledgeArchiveList() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
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
        ...item.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesCategory = category === "all" || item.category === category;
      const matchesStatus = status === "all" || item.status === status;
      const matchesRisk = risk === "all" || item.riskLevel === risk;

      return matchesQuery && matchesCategory && matchesStatus && matchesRisk;
    });
  }, [category, query, risk, status]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.04)] sm:p-6">
        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">검색</span>
          <input
            aria-label="지식 아카이브 검색"
            className="mt-2 min-h-12 w-full rounded-lg border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="제목, 요약, 태그를 입력하세요"
            type="search"
            value={query}
          />
        </label>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <FilterGroup
            label="카테고리"
            onChange={(value) => setCategory(value as CategoryFilter)}
            options={categoryOptions}
            value={category}
          />
          <FilterGroup
            label="상태"
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

        <p className="mt-4 text-sm leading-6 text-[#4f5661]">
          {filteredItems.length}개의 정적 샘플이 표시됩니다.
        </p>
      </section>

      {filteredItems.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <KnowledgeCard item={item} key={item.id} />
          ))}
        </div>
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
    <fieldset>
      <legend className="text-sm font-semibold text-[#303845]">{label}</legend>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              aria-pressed={isSelected}
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

function KnowledgeCard({ item }: { item: KnowledgeSeedItem }) {
  return (
    <article className="rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_14px_30px_rgba(16,34,53,0.04)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#d9c9a8] bg-white px-3 py-1 text-xs font-semibold text-[#7a612d]">
          {item.category}
        </span>
        <span className="rounded-full border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-1 text-xs font-semibold text-[#5f6670]">
          {item.type}
        </span>
      </div>

      <h3 className="mt-3 break-keep text-xl font-semibold leading-snug text-[#102235]">
        {item.title}
      </h3>
      <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
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
          위험도: {item.riskLevel}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#5f6670]">
        {item.aiUsable ? "AI 참조 가능" : "AI 참조 전 검수 필요"}
      </p>
      {item.slug ? (
        <Link
          className="mt-1 inline-flex text-xs font-semibold text-[#173f36] underline decoration-[#aa8137] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
          href={`/knowledge/${item.slug}`}
        >
          상세 보기
        </Link>
      ) : (
        <p className="mt-1 text-xs leading-5 text-[#8a909a]">상세 보기 준비 중</p>
      )}

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
    </article>
  );
}
