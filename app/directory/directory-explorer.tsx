"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/content-page";
import { InsurerActionCard } from "@/components/directory/insurer-action-card";
import type { PublicInsurer } from "@/lib/public/insurers";

type CategoryFilter = "all" | PublicInsurer["category"];
type StatusFilter = "all" | "verified" | "needs_review";
type FeaturedFilter = "all" | "featured";

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

export function DirectoryExplorer({
  insurers,
}: {
  insurers: PublicInsurer[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");

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

      return matchesQuery && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [category, featured, insurers, query, status]);

  return (
    <div className="space-y-6">
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
          {filteredInsurers.length}\uac1c \ubcf4\ud5d8\uc0ac\uac00 \ud45c\uc2dc\ub429\ub2c8\ub2e4. \ub2f9 \uc815\ubcf4\ub294 \uad00\ub9ac\uc790 \uac80\uc218 \uacb0\uacfc\ub97c \ubc18\uc601\ud55c \uacf5\uac1c\uc6a9 \ub370\uc774\ud130\uc785\ub2c8\ub2e4.
        </p>
      </section>

      {filteredInsurers.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredInsurers.map((insurer) => (
            <InsurerActionCard insurer={insurer} key={insurer.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="\uc870\uac74\uc5d0 \ub9de\ub294 \ubcf4\ud5d8\uc0ac\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."
          description="\uac80\uc0c9\uc5b4\ub97c \uc904\uc774\uac70\ub098 \ud544\ud130\ub97c \ubcc0\uacbd\ud574 \uc8fc\uc138\uc694."
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
