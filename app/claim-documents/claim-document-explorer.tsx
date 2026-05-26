"use client";

import { useMemo, useState } from "react";
import {
  EmptyState,
  LastVerified,
  PremiumCard,
  StatusBadge,
} from "@/components/content-page";
import { ClaimDocumentCategory, VerificationStatus } from "@prisma/client";
import type { PublicClaimDocument } from "@/lib/public/claim-documents";
import type { VerificationStatus as ClientVerificationStatus } from "@/lib/content";

// Korean labels for the database-backed ClaimDocument categories.
const categoryLabels: Record<ClaimDocumentCategory, string> = {
  actual_expense: "실손",
  diagnosis: "진단",
  surgery: "수술",
  hospitalization: "입원",
  outpatient: "통원",
  fracture: "골절",
  driver: "운전자",
  death: "사망",
  disability: "후유장해",
  other: "기타",
};

// Logical grouping order for presentation in the public library page.
const categoryOrder: ClaimDocumentCategory[] = [
  "actual_expense",
  "hospitalization",
  "surgery",
  "diagnosis",
  "outpatient",
  "fracture",
  "driver",
  "death",
  "disability",
  "other",
];

const categoryOptions: Array<{ label: string; value: string }> = [
  { label: "전체", value: "all" },
  ...categoryOrder.map((cat) => ({
    label: categoryLabels[cat],
    value: cat,
  })),
];

const statusOptions: Array<{ label: string; value: string }> = [
  { label: "전체", value: "all" },
  { label: "검수 완료", value: VerificationStatus.verified },
  { label: "검수 필요", value: VerificationStatus.needs_review },
];

export function ClaimDocumentExplorer({
  documents,
}: {
  documents: PublicClaimDocument[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>("all");

  // Dynamically extract unique insurers from the fetched documents.
  const uniqueInsurers = useMemo(() => {
    const insurersMap = new Map<string, string>();
    for (const doc of documents) {
      if (doc.insurerId && doc.insurerName) {
        insurersMap.set(doc.insurerId, doc.insurerName);
      }
    }
    return Array.from(insurersMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return documents.filter((doc) => {
      const searchTarget = [
        doc.title,
        doc.summary,
        doc.requiredDocuments,
        doc.optionalDocuments,
        doc.insurerName ?? "공통",
        doc.cautionNote,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesCategory =
        category === "all" || doc.category === category;
      const matchesStatus =
        status === "all" || doc.verificationStatus === status;
      const matchesInsurer =
        selectedInsurerId === "all" ||
        (selectedInsurerId === "common" && doc.insurerId === null) ||
        doc.insurerId === selectedInsurerId;

      return matchesQuery && matchesCategory && matchesStatus && matchesInsurer;
    });
  }, [category, documents, query, status, selectedInsurerId]);

  const groups = useMemo(() => {
    return categoryOrder
      .map((cat) => ({
        category: cat,
        entries: filteredDocuments.filter((doc) => doc.category === cat),
      }))
      .filter((group) => group.entries.length > 0);
  }, [filteredDocuments]);

  return (
    <div className="mt-8 space-y-6">
      <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
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

            <label className="block">
              <span className="text-sm font-semibold text-[#303845]">보험사 선택</span>
              <select
                className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition focus:border-[#aa8137]"
                onChange={(event) => setSelectedInsurerId(event.target.value)}
                value={selectedInsurerId}
              >
                <option value="all">전체 보험사</option>
                <option value="common">공통 기준 서류</option>
                {uniqueInsurers.map((insurer) => (
                  <option key={insurer.id} value={insurer.id}>
                    {insurer.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4">
            <FilterGroup
              label="청구 유형"
              onChange={(value) => setCategory(value)}
              options={categoryOptions}
              value={category}
            />
            <FilterGroup
              label="검수 상태"
              onChange={(value) => setStatus(value)}
              options={statusOptions}
              value={status}
            />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#4f5661]">
          {filteredDocuments.length}개 청구서류 구조가 표시됩니다. 현재 데이터는
          보험사 기준 및 공식 약관 검토 후 실시간으로 반영됩니다.
        </p>
      </section>

      {groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.category}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#7a612d]">
                    Category
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#102235]">
                    {categoryLabels[group.category]}
                  </h2>
                </div>
                <p className="whitespace-nowrap text-sm text-[#5f6670]">
                  {group.entries.length}개 항목
                </p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {group.entries.map((doc) => (
                  <ClaimDocumentCard document={doc} key={doc.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="조건에 맞는 청구서류가 없습니다."
          description="검색어를 줄이거나 청구 유형/보험사 필터를 변경해 주세요."
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

function ClaimDocumentCard({ document }: { document: PublicClaimDocument }) {
  return (
    <PremiumCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              {categoryLabels[document.category]}
            </span>
            <StatusBadge
              status={document.verificationStatus as ClientVerificationStatus}
            />
          </div>
          <h3 className="mt-3 break-keep text-2xl font-semibold text-[#102235]">
            {document.title}
          </h3>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <InfoRow label="관련 보험사" value={document.insurerName ?? "공통 기준"} />
        <InfoRow label="구분" value={categoryLabels[document.category]} />
      </dl>

      {document.summary && (
        <p className="mt-5 text-base leading-7 text-[#4f5661] break-keep">
          {document.summary}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="border border-[#e3d5b8] bg-[#fdfbf7] p-4">
          <h4 className="text-sm font-semibold text-[#173f36]">필수 서류</h4>
          <p className="mt-2 text-sm leading-6 text-[#4f5661] whitespace-pre-line break-keep">
            {document.requiredDocuments || "공식 확인 후 업데이트 예정"}
          </p>
        </div>
        <div className="border border-[#e3d5b8] bg-white p-4">
          <h4 className="text-sm font-semibold text-[#7a612d]">선택/추가 서류</h4>
          <p className="mt-2 text-sm leading-6 text-[#5f6670] whitespace-pre-line break-keep">
            {document.optionalDocuments || "해당사항 없음"}
          </p>
        </div>
      </div>

      {document.customerMessageTemplate && (
        <div className="mt-5 border border-[#e3d5b8] bg-[#fbf7ee] p-4">
          <h4 className="text-sm font-semibold text-[#303845]">안내 문구 템플릿</h4>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-5 text-[#4f5661] break-all">
            {document.customerMessageTemplate}
          </pre>
        </div>
      )}

      {document.cautionNote && (
        <p className="mt-5 border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670] break-keep">
          {document.cautionNote}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t border-[#d9c9a8] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <LastVerified value={document.lastVerifiedAt} />
        <div className="flex flex-wrap gap-2">
          {document.claimFormUrl ? (
            <SourceAction href={document.claimFormUrl} label="청구서 양식" />
          ) : (
            <span className="inline-flex items-center justify-center border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-center text-sm font-semibold text-[#8b7660]">
              청구서 양식 없음
            </span>
          )}
          {document.officialSourceUrl ? (
            <SourceAction href={document.officialSourceUrl} label="공식 출처" />
          ) : (
            <span className="inline-flex items-center justify-center border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-2 text-center text-sm font-semibold text-[#8b7660]">
              공식 확인 후 업데이트 예정
            </span>
          )}
        </div>
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

function SourceAction({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="inline-flex items-center justify-center border border-[#173f36] px-3 py-2 text-center text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label} 열기
    </a>
  );
}
