"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  LastVerified,
  PremiumCard,
  StatusBadge
} from "@/components/content-page";
import type {
  ClaimDocumentEntry,
  ClaimType,
  InsurerDirectoryEntry,
  VerificationStatus
} from "@/lib/content";

type ClaimTypeFilter = "all" | ClaimType;
type StatusFilter = "all" | VerificationStatus;

const claimTypeLabels: Record<ClaimType, string> = {
  actual_medical: "실손",
  hospitalization: "입원",
  surgery: "수술",
  diagnosis: "진단",
  fracture: "골절",
  medication: "약제비",
  common: "공통"
};

const claimTypeOrder: ClaimType[] = [
  "actual_medical",
  "hospitalization",
  "surgery",
  "diagnosis",
  "fracture",
  "medication",
  "common"
];

const claimTypeOptions: Array<{ label: string; value: ClaimTypeFilter }> = [
  { label: "전체", value: "all" },
  { label: "실손", value: "actual_medical" },
  { label: "입원", value: "hospitalization" },
  { label: "수술", value: "surgery" },
  { label: "진단", value: "diagnosis" },
  { label: "골절", value: "fracture" },
  { label: "약제비", value: "medication" },
  { label: "공통", value: "common" }
];

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "검수 완료", value: "verified" },
  { label: "검수 필요", value: "needs_review" },
  { label: "초안", value: "draft" }
];

export function ClaimDocumentExplorer({
  documents,
  insurers
}: {
  documents: ClaimDocumentEntry[];
  insurers: InsurerDirectoryEntry[];
}) {
  const [query, setQuery] = useState("");
  const [claimType, setClaimType] = useState<ClaimTypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const insurerNameById = useMemo(
    () => new Map(insurers.map((insurer) => [insurer.id, insurer.name])),
    [insurers]
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return documents.filter((document) => {
      const insurerName = document.insurerId
        ? insurerNameById.get(document.insurerId) ?? ""
        : "공통";
      const searchTarget = [
        document.title,
        document.documentName,
        document.description,
        insurerName
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesType =
        claimType === "all" || document.claimType === claimType;
      const matchesStatus =
        status === "all" || document.verificationStatus === status;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [claimType, documents, insurerNameById, query, status]);

  const groups = claimTypeOrder
    .map((type) => ({
      claimType: type,
      entries: filteredDocuments.filter((document) => document.claimType === type)
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="mt-8 space-y-6">
      <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">서류 검색</span>
            <input
              className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="서류명, 제목, 설명, 보험사명을 입력하세요"
              type="search"
              value={query}
            />
          </label>

          <div className="grid gap-4">
            <FilterGroup
              label="청구 유형"
              onChange={(value) => setClaimType(value as ClaimTypeFilter)}
              options={claimTypeOptions}
              value={claimType}
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
          {filteredDocuments.length}개 청구서류 구조가 표시됩니다. 현재 데이터는
          샘플이며 실제 고객 안내 전 공식 보험사 기준 확인이 필요합니다.
        </p>
      </section>

      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.claimType}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#7a612d]">
                    Claim Type
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#102235]">
                    {claimTypeLabels[group.claimType]}
                  </h2>
                </div>
                <p className="whitespace-nowrap text-sm text-[#5f6670]">
                  {group.entries.length}개 항목
                </p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {group.entries.map((document) => (
                  <ClaimDocumentCard
                    document={document}
                    insurerName={
                      document.insurerId
                        ? insurerNameById.get(document.insurerId) ??
                          "보험사 확인 필요"
                        : "공통 기준"
                    }
                    key={document.id}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="조건에 맞는 청구서류가 없습니다."
          description="검색어를 줄이거나 청구 유형 필터를 변경해 주세요."
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

function ClaimDocumentCard({
  document,
  insurerName
}: {
  document: ClaimDocumentEntry;
  insurerName: string;
}) {
  return (
    <PremiumCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              {claimTypeLabels[document.claimType]}
            </span>
            <StatusBadge status={document.verificationStatus} />
          </div>
          <h3 className="mt-3 break-keep text-2xl font-semibold text-[#102235]">
            {document.title}
          </h3>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <InfoRow label="서류명" value={document.documentName} />
        <InfoRow label="관련 보험사" value={insurerName} />
      </dl>

      <p className="mt-5 text-base leading-7 text-[#4f5661]">
        {document.description}
      </p>
      <p className="mt-4 border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
        {document.cautionNote}
      </p>

      <div className="mt-6 flex flex-col gap-4 border-t border-[#d9c9a8] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <LastVerified value={document.lastVerifiedAt} />
        <SourceAction href={document.sourceUrl} />
      </div>
    </PremiumCard>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#e3d5b8] bg-white px-3 py-3">
      <dt className="font-semibold text-[#303845]">{label}</dt>
      <dd className="mt-1 break-keep text-[#4f5661]">{value}</dd>
    </div>
  );
}

function SourceAction({ href }: { href: string | null }) {
  if (!href) {
    return (
      <span className="inline-flex items-center justify-center border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-center text-sm font-semibold text-[#8b7660]">
        공식 확인 후 업데이트 예정
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
      공식 출처 열기
    </a>
  );
}
