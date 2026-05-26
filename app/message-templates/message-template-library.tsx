"use client";

import { useMemo, useState } from "react";
import type {
  CustomerMessageTemplate,
  MessageSituation,
  MessageTone
} from "@/lib/content";

type SituationFilter = "all" | MessageSituation;
type ToneFilter = "all" | MessageTone;

const situationLabels: Record<MessageSituation, string> = {
  claim_documents_request: "청구서류 요청",
  claim_received_notice: "접수 완료 안내",
  supplement_request: "보완 요청",
  claim_completed_notice: "지급 완료 안내",
  consultation_schedule: "상담 일정 조율",
  coverage_review: "보장점검 안내",
  cancellation_concern: "해지 고민 고객",
  referral_response: "소개 고객 응대",
  long_time_no_contact: "장기 미연락 고객"
};

const toneLabels: Record<MessageTone, string> = {
  professional: "전문적인",
  warm: "친근한",
  concise: "짧은 안내형",
  careful: "정중한",
  formal: "신뢰형",
  calm: "차분한",
  trustworthy: "신뢰형"
};

const situationOrder: MessageSituation[] = [
  "claim_documents_request",
  "claim_received_notice",
  "supplement_request",
  "claim_completed_notice",
  "consultation_schedule",
  "coverage_review",
  "cancellation_concern",
  "referral_response",
  "long_time_no_contact"
];

const situationOptions: Array<{ label: string; value: SituationFilter }> = [
  { label: "전체", value: "all" },
  ...situationOrder.map((value) => ({ label: situationLabels[value], value }))
];

const toneOptions: Array<{ label: string; value: ToneFilter }> = [
  { label: "전체", value: "all" },
  { label: "정중한", value: "careful" },
  { label: "차분한", value: "calm" },
  { label: "친근한", value: "warm" },
  { label: "전문적인", value: "professional" },
  { label: "짧은 안내형", value: "concise" },
  { label: "신뢰형", value: "trustworthy" }
];

export function MessageTemplateLibrary({
  templates
}: {
  templates: CustomerMessageTemplate[];
}) {
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState<SituationFilter>("all");
  const [tone, setTone] = useState<ToneFilter>("all");

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return templates.filter((template) => {
      const searchTarget = [
        template.title,
        template.situation,
        situationLabels[template.situationCategory],
        toneLabels[template.tone],
        template.body
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");

      const matchesQuery =
        normalizedQuery.length === 0 || searchTarget.includes(normalizedQuery);
      const matchesSituation =
        situation === "all" || template.situationCategory === situation;
      const matchesTone = tone === "all" || template.tone === tone;

      return matchesQuery && matchesSituation && matchesTone;
    });
  }, [query, situation, templates, tone]);

  const groups = situationOrder
    .map((situationKey) => ({
      situation: situationKey,
      templates: filteredTemplates.filter(
        (template) => template.situationCategory === situationKey
      )
    }))
    .filter((group) => group.templates.length > 0);

  return (
    <div className="space-y-8">
      <SearchAndFilters
        onQueryChange={setQuery}
        onSituationChange={setSituation}
        onToneChange={setTone}
        query={query}
        resultCount={filteredTemplates.length}
        situation={situation}
        tone={tone}
      />

      {groups.length > 0 ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.situation}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#7a612d]">
                    Customer situation
                  </p>
                  <h2 className="mt-1 break-keep text-2xl font-semibold text-[#102235]">
                    {situationLabels[group.situation]}
                  </h2>
                </div>
                <p className="whitespace-nowrap text-sm text-[#5f6670]">
                  {group.templates.length}개 문구
                </p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {group.templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
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
  onQueryChange,
  onSituationChange,
  onToneChange,
  query,
  resultCount,
  situation,
  tone
}: {
  onQueryChange: (value: string) => void;
  onSituationChange: (value: SituationFilter) => void;
  onToneChange: (value: ToneFilter) => void;
  query: string;
  resultCount: number;
  situation: SituationFilter;
  tone: ToneFilter;
}) {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            고객 안내 문구 검색
          </span>
          <input
            className="mt-2 w-full border border-[#d9c9a8] bg-white px-4 py-3 text-base text-[#18202b] outline-none transition placeholder:text-[#8b7660] focus:border-[#aa8137]"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="제목, 상황, 톤, 문구 내용을 입력해 주세요"
            type="search"
            value={query}
          />
        </label>

        <div className="grid gap-4">
          <FilterGroup
            label="상황"
            onChange={(value) => onSituationChange(value as SituationFilter)}
            options={situationOptions}
            value={situation}
          />
          <FilterGroup
            label="톤"
            onChange={(value) => onToneChange(value as ToneFilter)}
            options={toneOptions}
            value={tone}
          />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#4f5661]">
        {resultCount}개 문구가 표시됩니다. 문구는 실무 참고용 초안이며, 발송
        전 고객 상황과 상품별 기준에 맞게 수정해야 합니다.
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

function TemplateCard({ template }: { template: CustomerMessageTemplate }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(template.body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <article className="border border-[#d9c9a8] bg-[#fbf7ee] p-6 shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="whitespace-nowrap border border-[#d9c9a8] bg-[#f7f1e5] px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              {situationLabels[template.situationCategory]}
            </span>
            <span className="whitespace-nowrap border border-[#9fb7a4] bg-[#edf4ee] px-2.5 py-1 text-xs font-semibold text-[#173f36]">
              {toneLabels[template.tone]}
            </span>
            <span className="whitespace-nowrap border border-[#d9c9a8] bg-white px-2.5 py-1 text-xs font-semibold text-[#7a612d]">
              실무 참고용 초안
            </span>
          </div>
          <h3 className="mt-3 break-keep text-2xl font-semibold leading-snug text-[#102235]">
            {template.title}
          </h3>
        </div>
      </div>

      <p className="mt-4 break-keep text-sm leading-6 text-[#4f5661]">
        {template.situation}
      </p>

      <div className="mt-5 border border-[#e3d5b8] bg-white p-4">
        <p className="whitespace-pre-wrap break-keep text-base leading-8 text-[#303845]">
          {template.body}
        </p>
      </div>

      {template.safetyNote ? (
        <p className="mt-4 border-l border-[#aa8137] pl-4 text-sm leading-6 text-[#5f6670]">
          {template.safetyNote}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-[#d9c9a8] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="whitespace-nowrap text-sm text-[#5f6670]">
          최종 수정: {template.lastUpdatedAt}
        </p>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            className="inline-flex items-center justify-center border border-[#173f36] px-4 py-2 text-sm font-semibold text-[#173f36] transition hover:bg-[#173f36] hover:text-[#fbf7ee]"
            onClick={handleCopy}
            type="button"
          >
            {copied ? "복사 완료" : "문구 복사"}
          </button>
          <p className="break-keep text-xs leading-5 text-[#5f6670]">
            복사 후 고객 상황에 맞게 수정하세요.
          </p>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-8 text-center shadow-[0_18px_40px_rgba(16,34,53,0.05)]">
      <p className="break-keep text-lg font-semibold text-[#102235]">
        조건에 맞는 고객 안내 문구가 없습니다.
      </p>
      <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
        검색어를 줄이거나 상황·톤 필터를 변경해 주세요.
      </p>
    </section>
  );
}
