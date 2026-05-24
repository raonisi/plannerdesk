"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  EmptyValue,
  LastVerified,
  PremiumCard,
  StatusBadge
} from "@/components/content-page";
import type {
  InsurerCategory,
  InsurerDirectoryEntry,
  VerificationStatus
} from "@/lib/content";

type CategoryFilter = "all" | InsurerCategory;
type StatusFilter = "all" | VerificationStatus;

const categoryLabels: Record<InsurerCategory, string> = {
  life: "생명보험",
  non_life: "손해보험"
};

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: "전체", value: "all" },
  { label: "손해보험", value: "non_life" },
  { label: "생명보험", value: "life" }
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "검수 완료", value: "verified" },
  { label: "검수 필요", value: "needs_review" },
  { label: "초안", value: "draft" }
];

export function DirectoryExplorer({
  insurers
}: {
  insurers: InsurerDirectoryEntry[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filteredInsurers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return insurers.filter((insurer) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        insurer.name.toLocaleLowerCase("ko-KR").includes(normalizedQuery);
      const matchesCategory = category === "all" || insurer.category === category;
      const matchesStatus =
        status === "all" || insurer.verificationStatus === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, insurers, query, status]);

  return (
    <div className="mt-8 space-y-6">
      <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">보험사 검색</span>
            <input
              className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="보험사 이름을 입력하세요"
              type="search"
              value={query}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#4f5661]">
          {filteredInsurers.length}개 보험사 구조가 표시됩니다. 현재 데이터는
          샘플이며 공개 전 공식 출처 검수가 필요합니다.
        </p>
      </section>

      {filteredInsurers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredInsurers.map((insurer) => (
            <InsurerCard insurer={insurer} key={insurer.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="조건에 맞는 보험사가 없습니다."
          description="검색어를 줄이거나 필터를 변경해 주세요."
        />
      )}
    </div>
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
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              className={`shrink-0 border px-3 py-2 text-sm font-semibold transition ${
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

function InsurerCard({ insurer }: { insurer: InsurerDirectoryEntry }) {
  return (
    <PremiumCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#7a612d]">
            {categoryLabels[insurer.category]}
          </p>
          <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
            {insurer.name}
          </h2>
        </div>
        <StatusBadge status={insurer.verificationStatus} />
      </div>

      <div className="mt-4">
        <LastVerified value={insurer.lastVerifiedAt} />
      </div>

      {insurer.notes ? (
        <p className="mt-4 text-base leading-7 text-[#4f5661]">{insurer.notes}</p>
      ) : null}

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        <ExternalAction href={insurer.officialWebsiteUrl} label="공식 홈페이지" />
        <ExternalAction href={insurer.plannerPortalUrl} label="설계사 전산" />
        <ExternalAction href={insurer.claimPageUrl} label="보험금 청구" />
      </div>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <InfoRow label="고객센터" value={insurer.customerCenterPhone} />
        <InfoRow label="팩스" value={insurer.faxNumber} />
        <InfoRow label="등기주소" value={insurer.mailingAddress} />
      </dl>
    </PremiumCard>
  );
}

function ExternalAction({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    return (
      <span className="inline-flex items-center justify-center border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-center text-sm font-semibold text-[#8b7660]">
        {label} 준비 중
      </span>
    );
  }

  return (
    <a
      className="inline-flex items-center justify-center border border-[#173f36] px-3 py-2 text-center text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border border-[#e3d5b8] bg-white px-3 py-3">
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="mt-1 break-keep text-[#4f5661]">
        {value ? <span className="whitespace-nowrap">{value}</span> : <EmptyValue label="공식 확인 후 업데이트 예정" />}
      </dd>
    </div>
  );
}
