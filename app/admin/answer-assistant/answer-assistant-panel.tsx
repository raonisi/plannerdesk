"use client";

import { useMemo, useState, useTransition } from "react";
import { hasClientSensitiveSignal } from "@/lib/correction-request/validation";
import {
  ANSWER_ASSIST_PAGE_NOTICES,
  ANSWER_ASSIST_QUERY_MAX_LENGTH,
  ANSWER_ASSIST_QUERY_MIN_LENGTH,
} from "@/lib/answer-assistant/constants";
import {
  ANSWER_ASSIST_DOMAIN_OPTIONS,
  ANSWER_ASSIST_PURPOSE_OPTIONS,
  ANSWER_ASSIST_TONE_OPTIONS,
  RETRIEVAL_SOURCE_TYPE_LABEL,
} from "@/lib/answer-assistant/labels";
import type {
  AnswerAssistantDraftResult,
  AnswerAssistantEvidenceItem,
} from "@/lib/answer-assistant/types";
import { generateAnswerAssistantDraftAction } from "./actions";

export function AnswerAssistantPanel() {
  const [isPending, startTransition] = useTransition();
  const [purpose, setPurpose] = useState("GENERAL_EXPLANATION");
  const [tone, setTone] = useState("neutral");
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [requiresOfficialCheck, setRequiresOfficialCheck] = useState(false);
  const [result, setResult] = useState<AnswerAssistantDraftResult | null>(null);

  const queryLength = query.trim().length;
  const containsSensitiveSignal = useMemo(
    () => hasClientSensitiveSignal(query),
    [query],
  );

  const queryInvalid =
    queryLength > 0 &&
    (queryLength < ANSWER_ASSIST_QUERY_MIN_LENGTH ||
      queryLength > ANSWER_ASSIST_QUERY_MAX_LENGTH);

  const submitDisabled =
    isPending ||
    containsSensitiveSignal ||
    queryInvalid ||
    queryLength < ANSWER_ASSIST_QUERY_MIN_LENGTH;

  const handleSubmit = () => {
    if (submitDisabled) return;

    const formData = new FormData();
    formData.set("purpose", purpose);
    formData.set("tone", tone);
    formData.set("domain", domain);
    formData.set("query", query);
    if (requiresOfficialCheck) {
      formData.set("requiresOfficialCheck", "true");
    }

    startTransition(async () => {
      const next = await generateAnswerAssistantDraftAction(formData);
      setResult(next);
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-[#d6a36e] bg-[#fff8ec] px-4 py-4 text-sm leading-relaxed text-[#5c4520]">
        <p>{ANSWER_ASSIST_PAGE_NOTICES.toolPurpose}</p>
        <p className="mt-2">{ANSWER_ASSIST_PAGE_NOTICES.sensitiveInput}</p>
        <p className="mt-2">{ANSWER_ASSIST_PAGE_NOTICES.prohibitedScope}</p>
      </section>

      <section className="rounded-lg border border-[#d9c9a8] bg-white p-5 sm:p-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-[#102235]">
            요청 목적
            <select
              className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm"
              onChange={(event) => setPurpose(event.target.value)}
              value={purpose}
            >
              {ANSWER_ASSIST_PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-normal text-[#5f6670]">
              {
                ANSWER_ASSIST_PURPOSE_OPTIONS.find(
                  (option) => option.value === purpose,
                )?.description
              }
            </span>
          </label>

          <label className="block text-sm font-semibold text-[#102235]">
            질문 또는 작성 요청
            <textarea
              className="mt-2 min-h-40 w-full rounded-lg border border-[#d9c9a8] px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
              maxLength={ANSWER_ASSIST_QUERY_MAX_LENGTH}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예: 해지 전 고객에게 안내할 일반 기준을 정리해 주세요."
              value={query}
            />
            <span className="mt-1 block text-xs font-normal text-[#5f6670]">
              {queryLength}/{ANSWER_ASSIST_QUERY_MAX_LENGTH}자 (최소{" "}
              {ANSWER_ASSIST_QUERY_MIN_LENGTH}자)
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#102235]">
              답변 톤
              <select
                className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm"
                onChange={(event) => setTone(event.target.value)}
                value={tone}
              >
                {ANSWER_ASSIST_TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#102235]">
              참고 도메인
              <select
                className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm"
                onChange={(event) => setDomain(event.target.value)}
                value={domain}
              >
                {ANSWER_ASSIST_DOMAIN_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-start gap-2 text-sm text-[#303845]">
            <input
              checked={requiresOfficialCheck}
              className="mt-1"
              onChange={(event) =>
                setRequiresOfficialCheck(event.target.checked)
              }
              type="checkbox"
            />
            <span>
              공식 확인 필요 항목을 결과에 강조합니다 (약관·공시·보험사 안내
              확인 경로).
            </span>
          </label>

          {containsSensitiveSignal ? (
            <p className="text-sm text-[#9a4b1f]" role="alert">
              개인정보·의료정보·보험금 판단성 표현이 포함되어 있으면 처리되지
              않습니다.
            </p>
          ) : null}

          <button
            className="min-h-11 rounded-lg bg-[#102235] px-5 text-sm font-semibold text-white hover:bg-[#1b344e] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={submitDisabled}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? "초안 생성 중…" : "관리자 검수용 초안 생성"}
          </button>
        </div>
      </section>

      {result ? <AnswerAssistantResultPanel result={result} /> : null}
    </div>
  );
}

function AnswerAssistantResultPanel({
  result,
}: {
  result: AnswerAssistantDraftResult;
}) {
  if (!result.ok) {
    return (
      <section
        className="rounded-lg border border-[#d6a36e] bg-[#fff5e1] px-4 py-4"
        role="alert"
      >
        <h2 className="text-sm font-semibold text-[#7b4b19]">처리되지 않음</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7b4b19]">
          {result.message}
        </p>
        {result.blockedReason ? (
          <p className="mt-2 text-xs text-[#9a6a3a]">
            사유 코드: {result.blockedReason}
          </p>
        ) : null}
        {result.evidence.length > 0 ? (
          <EvidenceList count={result.candidateCount} items={result.evidence} />
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#aa8137]">
          {result.draftLabel}
        </p>
        {result.providerNotice ? (
          <p className="mt-2 text-sm text-[#5f6670]">{result.providerNotice}</p>
        ) : null}
      </div>

      <article className="rounded-lg border border-[#e8dcc4] bg-white p-4">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[#102235]">
          {result.draft}
        </pre>
      </article>

      <EvidenceList count={result.candidateCount} items={result.evidence} />

      {result.officialCheckItems.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-[#102235]">
            공식 확인 필요 항목
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4f5661]">
            {result.officialCheckItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.warnings.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-[#102235]">경고</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#7b4b19]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="rounded-md border border-[#d9c9a8] bg-white px-3 py-3 text-xs leading-relaxed text-[#5f6670]">
        {result.footerDisclaimer}
      </p>
    </section>
  );
}

function EvidenceList({
  items,
  count,
}: {
  items: AnswerAssistantEvidenceItem[];
  count: number;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#102235]">
        참고 근거 ({count}건)
      </h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            className="rounded-md border border-[#e8dcc4] bg-white px-3 py-2 text-sm"
            key={`${item.type}-${item.id}`}
          >
            <p className="font-semibold text-[#102235]">
              [{RETRIEVAL_SOURCE_TYPE_LABEL[item.type]}] {item.title}
            </p>
            {item.summary ? (
              <p className="mt-1 text-[#4f5661]">{item.summary}</p>
            ) : null}
            {item.sourceUrl ? (
              <p className="mt-1 break-all text-xs text-[#7a612d]">
                {item.sourceUrl}
              </p>
            ) : null}
            {item.isOfficialSource ? (
              <p className="mt-1 text-xs font-semibold text-[#2f6b3a]">
                공식 출처
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
