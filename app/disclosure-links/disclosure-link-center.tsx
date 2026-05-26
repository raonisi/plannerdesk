"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  LastVerifiedText,
  MissingFieldText,
  VerificationStatusBadge
} from "@/components/content-page";
import type {
  DisclosureCategory,
  DisclosureLinkEntry,
  VerificationStatus
} from "@/lib/content";

type CategoryFilter = "all" | DisclosureCategory;
type StatusFilter = "all" | VerificationStatus;

const text = {
  all: "\uc804\uccb4",
  searchLabel: "\uacf5\uc2dc\u00b7\uc57d\uad00 \uac80\uc0c9",
  searchPlaceholder:
    "\uc81c\ubaa9, \uce74\ud14c\uace0\ub9ac, \uc124\uba85\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694",
  category: "\uce74\ud14c\uace0\ub9ac",
  status: "\uac80\uc218 \uc0c1\ud0dc",
  verified: "\uac80\uc218 \uc644\ub8cc",
  needsReview: "\uac80\uc218 \ud544\uc694",
  draft: "\ucd08\uc548",
  countSuffix: "\uac1c \ub9c1\ud06c",
  resultSuffix:
    "\uac1c \ud56d\ubaa9\uc774 \ud45c\uc2dc\ub429\ub2c8\ub2e4. \ud604\uc7ac \uc77c\ubd80 \uc815\ubcf4\ub294 \uac80\uc218 \uc804 \uc0d8\ud50c \ub370\uc774\ud130\uc774\uba70, \uc0c1\ub2f4 \uc804 \uacf5\uc2dd \ucd9c\ucc98 \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.",
  lastVerifiedLabel: "\ucd5c\uadfc \uac80\uc218",
  officialSource: "\uacf5\uc2dd \ucd9c\ucc98",
  openSource: "\uacf5\uc2dd \ucd9c\ucc98 \uc5f4\uae30",
  emptyTitle:
    "\uc870\uac74\uc5d0 \ub9de\ub294 \uacf5\uc2dc\u00b7\uc57d\uad00 \ub9c1\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
  emptyDescription:
    "\uac80\uc0c9\uc5b4\ub97c \uc904\uc774\uac70\ub098 \uce74\ud14c\uace0\ub9ac \ud544\ud130\ub97c \ubcc0\uacbd\ud574 \uc8fc\uc138\uc694."
};

const categoryLabels: Record<DisclosureCategory, string> = {
  product_disclosure: "\uc0c1\ud488\uacf5\uc2dc",
  policy_terms: "\uc57d\uad00",
  insurance_association: "\ubcf4\ud5d8\ud611\ud68c",
  insurer_official_materials: "\ubcf4\ud5d8\uc0ac \uacf5\uc2dd\uc790\ub8cc",
  claim_compensation_reference: "\uccad\uad6c\u00b7\ubcf4\uc0c1 \ucc38\uace0",
  education_practice_reference: "\uad50\uc721\u00b7\uc2e4\ubb34 \ucc38\uace0"
};

const categoryDescriptions: Record<DisclosureCategory, string> = {
  product_disclosure:
    "\uc0c1\ud488 \uad6c\uc870\uc640 \uacf5\uc2dd \uacf5\uc2dc\uc790\ub8cc \ud655\uc778",
  policy_terms:
    "\ubcf4\uc7a5 \ubc94\uc704\uc640 \uba74\ucc45\u00b7\uac10\uc561 \uae30\uc900 \ud655\uc778",
  insurance_association:
    "\uacf5\uc2e0\ub825 \uc788\ub294 \uc678\ubd80 \uae30\uc900 \ud655\uc778",
  insurer_official_materials:
    "\ubcf4\ud5d8\uc0ac \uacf5\uc2dd \uc548\ub0b4 \uacbd\ub85c \ud655\uc778",
  claim_compensation_reference:
    "\uccad\uad6c \uc808\ucc28\uc640 \ubcf4\uc0c1 \uc548\ub0b4 \ucc38\uace0",
  education_practice_reference:
    "\uc0c1\ub2f4 \uc900\ube44\uc640 \uc2e4\ubb34 \uad50\uc721 \uc790\ub8cc \ucc38\uace0"
};

const categoryOrder: DisclosureCategory[] = [
  "product_disclosure",
  "policy_terms",
  "insurance_association",
  "insurer_official_materials",
  "claim_compensation_reference",
  "education_practice_reference"
];

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: text.all, value: "all" },
  ...categoryOrder.map((value) => ({ label: categoryLabels[value], value }))
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: text.all, value: "all" },
  { label: text.verified, value: "verified" },
  { label: text.needsReview, value: "needs_review" },
  { label: text.draft, value: "draft" }
];

export function DisclosureLinkCenter({
  entries
}: {
  entries: DisclosureLinkEntry[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return entries.filter((entry) => {
      const searchTarget = [
        entry.title,
        categoryLabels[entry.category],
        entry.description,
        entry.notes ?? ""
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesCategory = category === "all" || entry.category === category;
      const matchesStatus =
        status === "all" || entry.verificationStatus === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, entries, query, status]);

  const groups = categoryOrder
    .map((categoryKey) => ({
      category: categoryKey,
      entries: filteredEntries.filter((entry) => entry.category === categoryKey)
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="space-y-8">
      <SearchAndFilters
        category={category}
        onCategoryChange={setCategory}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        query={query}
        resultCount={filteredEntries.length}
        status={status}
      />

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.category}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold text-[#7a612d]">
                    Reference category
                  </p>
                  <h2 className="mt-1 break-keep text-2xl font-semibold text-[#102235]">
                    {categoryLabels[group.category]}
                  </h2>
                  <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
                    {categoryDescriptions[group.category]}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm text-[#5f6670]">
                  {group.entries.length}
                  {text.countSuffix}
                </p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {group.entries.map((entry) => (
                  <DisclosureCard entry={entry} key={entry.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function SearchAndFilters({
  category,
  onCategoryChange,
  onQueryChange,
  onStatusChange,
  query,
  resultCount,
  status
}: {
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  query: string;
  resultCount: number;
  status: StatusFilter;
}) {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {text.searchLabel}
          </span>
          <input
            className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137]"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={text.searchPlaceholder}
            type="search"
            value={query}
          />
        </label>

        <div className="grid gap-4">
          <FilterGroup
            label={text.category}
            onChange={(value) => onCategoryChange(value as CategoryFilter)}
            options={categoryOptions}
            value={category}
          />
          <FilterGroup
            label={text.status}
            onChange={(value) => onStatusChange(value as StatusFilter)}
            options={statusOptions}
            value={status}
          />
        </div>
      </div>
      <p className="mt-4 break-keep text-sm leading-6 text-[#4f5661]">
        {resultCount}
        {text.resultSuffix}
      </p>
    </section>
  );
}

function FilterGroup({
  label,
  onChange,
  options,
  value
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
              className={`shrink-0 whitespace-nowrap border px-3 py-2 text-sm font-semibold transition ${
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

function DisclosureCard({ entry }: { entry: DisclosureLinkEntry }) {
  return (
    <article className="border border-[#d9c9a8] bg-[#fbf7ee] p-6 shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              {categoryLabels[entry.category]}
            </span>
            <VerificationStatusBadge status={entry.verificationStatus} />
          </div>
          <h3 className="mt-3 break-keep text-2xl font-semibold leading-snug text-[#102235]">
            {entry.title}
          </h3>
        </div>
      </div>

      <p className="mt-5 break-keep text-base leading-7 text-[#4f5661]">
        {entry.description}
      </p>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <InfoBlock label={text.lastVerifiedLabel}>
          <LastVerifiedText value={entry.lastVerifiedAt} />
        </InfoBlock>
        <InfoBlock label={text.officialSource}>
          <SourceAction href={entry.sourceUrl} />
        </InfoBlock>
      </dl>

      {entry.notes ? (
        <div className="mt-5 border-l border-[#aa8137] bg-white px-4 py-3 text-sm leading-6 text-[#5f6670]">
          {entry.notes}
        </div>
      ) : null}
    </article>
  );
}

function InfoBlock({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="border border-[#e3d5b8] bg-white px-3 py-3">
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="mt-1 break-keep text-[#4f5661]">{children}</dd>
    </div>
  );
}

function SourceAction({ href }: { href: string | null }) {
  if (!href) {
    return <MissingFieldText />;
  }

  return (
    <a
      className="inline-flex items-center justify-center border border-[#173f36] px-3 py-2 text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text.openSource}
    </a>
  );
}

function EmptyState() {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-8 text-center shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
      <p className="break-keep text-lg font-semibold text-[#102235]">
        {text.emptyTitle}
      </p>
      <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
        {text.emptyDescription}
      </p>
    </section>
  );
}
