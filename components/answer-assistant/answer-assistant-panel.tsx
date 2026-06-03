"use client";

import { useMemo, useState, useTransition } from "react";
import { hasClientSensitiveSignal } from "@/lib/correction-request/validation";
import {
  ANSWER_ASSIST_PAGE_NOTICES,
  ANSWER_ASSIST_QUERY_MAX_LENGTH,
  ANSWER_ASSIST_QUERY_MIN_LENGTH,
  VERIFIED_ANSWER_ASSIST_PAGE_NOTICES,
} from "@/lib/answer-assistant/constants";
import {
  ANSWER_ASSIST_DOMAIN_OPTIONS,
  ANSWER_ASSIST_PURPOSE_OPTIONS,
  ANSWER_ASSIST_TONE_OPTIONS,
  BLOCKED_REASON_LABEL,
  RETRIEVAL_SOURCE_TYPE_LABEL,
} from "@/lib/answer-assistant/labels";
import { BetaSafetyFeedbackForm } from "@/components/answer-assistant/beta-feedback-form";
import type {
  AnswerAssistantDraftResult,
  AnswerAssistantEvidenceItem,
} from "@/lib/answer-assistant/types";

export type AnswerAssistantPanelVariant = "admin" | "verified";

export interface AnswerAssistantPanelShellProps {
  variant: AnswerAssistantPanelVariant;
  generationEnabled: boolean;
  generationDisabledMessage?: string;
  betaActiveNotice?: string;
  showBetaFeedback?: boolean;
  adminTesterNotice?: string;
  submitAction: (formData: FormData) => Promise<AnswerAssistantDraftResult>;
}

export function AnswerAssistantPanelShell({
  variant,
  generationEnabled,
  generationDisabledMessage,
  betaActiveNotice,
  showBetaFeedback = false,
  adminTesterNotice,
  submitAction,
}: AnswerAssistantPanelShellProps) {
  const notices =
    variant === "verified"
      ? VERIFIED_ANSWER_ASSIST_PAGE_NOTICES
      : ANSWER_ASSIST_PAGE_NOTICES;
  const checklistTitle =
    variant === "verified"
      ? "검증 설계사 검수 체크리스트"
      : "관리자 검수 체크리스트";
  const submitLabel =
    variant === "verified"
      ? "업무 참고용 초안 생성"
      : "관리자 검수용 초안 생성";

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
    !generationEnabled ||
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
      const next = await submitAction(formData);
      setResult(next);
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-[#d6a36e] bg-[#fff8ec] px-4 py-4 text-sm leading-relaxed text-[#5c4520]">
        <p>{notices.toolPurpose}</p>
        <p className="mt-2">{notices.sensitiveInput}</p>
        <p className="mt-2">{notices.prohibitedScope}</p>
        {"customerReview" in notices ? (
          <p className="mt-2">{notices.customerReview}</p>
        ) : null}
      </section>

      {!generationEnabled && generationDisabledMessage ? (
        <section
          className="rounded-lg border border-[#d9c9a8] bg-[#f4f6f8] px-4 py-4 text-sm text-[#4f5661]"
          role="status"
        >
          <p className="font-semibold text-[#102235]">
            {variant === "verified" ? "제한 beta" : "제한 공개 준비 중"}
          </p>
          <p className="mt-2">{generationDisabledMessage}</p>
        </section>
      ) : null}

      {generationEnabled && betaActiveNotice ? (
        <section
          className="rounded-lg border border-[#d6a36e] bg-[#fff3e0] px-4 py-4 text-sm leading-relaxed text-[#5c4520]"
          role="status"
        >
          <p className="font-semibold text-[#102235]">제한 beta 운영 중</p>
          <p className="mt-2">{betaActiveNotice}</p>
        </section>
      ) : null}

      {adminTesterNotice ? (
        <section className="rounded-lg border border-[#c9d8ea] bg-[#eef4fb] px-4 py-3 text-sm text-[#2f4a66]">
          {adminTesterNotice}
        </section>
      ) : null}

      <section className="rounded-lg border border-[#d9c9a8] bg-white p-5 sm:p-6">
        <fieldset className="space-y-4" disabled={!generationEnabled}>
          <label className="block text-sm font-semibold text-[#102235]">
            요청 목적
            <select
              className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-[#f4f6f8]"
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
              className="mt-2 min-h-40 w-full rounded-lg border border-[#d9c9a8] px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15 disabled:cursor-not-allowed disabled:bg-[#f4f6f8]"
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
                className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-[#f4f6f8]"
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
                className="mt-1 min-h-10 w-full rounded-lg border border-[#d9c9a8] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-[#f4f6f8]"
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
            {isPending ? "초안 생성 중…" : submitLabel}
          </button>
        </fieldset>
      </section>

      {result ? (
        <>
          <AnswerAssistantResultPanel
            checklistTitle={checklistTitle}
            result={result}
          />
          {variant === "verified" && showBetaFeedback ? (
            <BetaSafetyFeedbackForm usageAuditId={result.usageAuditId} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function AnswerAssistantResultPanel({
  result,
  checklistTitle,
}: {
  result: AnswerAssistantDraftResult;
  checklistTitle: string;
}) {
  if (!result.ok) {
    const reasonLabel = result.blockedReason
      ? BLOCKED_REASON_LABEL[result.blockedReason]
      : "처리되지 않음";
    const showPartialSuccess =
      result.safetyGatePassed &&
      (result.retrievalCompleted ||
        result.blockedReason === "PROVIDER_NOT_CONFIGURED");

    return (
      <section
        className="space-y-4 rounded-lg border border-[#d6a36e] bg-[#fff5e1] px-4 py-4"
        role="alert"
      >
        <div>
          <h2 className="text-sm font-semibold text-[#7b4b19]">{reasonLabel}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#7b4b19]">
            {result.message}
          </p>
          {result.blockedReason ? (
            <p className="mt-2 text-xs text-[#9a6a3a]">
              사유 코드: {result.blockedReason}
            </p>
          ) : null}
        </div>

        {showPartialSuccess ? (
          <p className="rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-xs text-[#4f5661]">
            입력 안전성 검사는 통과했습니다.
            {result.retrievalCompleted
              ? " 근거 후보 조회까지 완료되었습니다."
              : null}
            {result.blockedReason === "PROVIDER_NOT_CONFIGURED"
              ? " 초안 생성 provider가 구성되지 않아 본문 초안은 생성하지 않았습니다."
              : null}
          </p>
        ) : null}

        {result.insufficientEvidenceReasons &&
        result.insufficientEvidenceReasons.length > 0 ? (
          <InsufficientEvidenceDetails
            reasons={result.insufficientEvidenceReasons}
          />
        ) : null}

        {result.warnings.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#7b4b19]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
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

      <ReviewChecklist items={result.adminReviewChecklist} title={checklistTitle} />

      <p className="rounded-md border border-[#d9c9a8] bg-white px-3 py-3 text-xs leading-relaxed text-[#5f6670]">
        {result.footerDisclaimer}
      </p>
    </section>
  );
}

function InsufficientEvidenceDetails({ reasons }: { reasons: string[] }) {
  return (
    <div className="rounded-md border border-[#d9c9a8] bg-white px-3 py-3">
      <h3 className="text-sm font-semibold text-[#102235]">근거 부족 상세</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4f5661]">
        {reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

function ReviewChecklist({
  items,
  title,
}: {
  items: readonly string[];
  title: string;
}) {
  return (
    <div className="rounded-md border border-[#d9c9a8] bg-white px-3 py-3">
      <h3 className="text-sm font-semibold text-[#102235]">{title}</h3>
      <p className="mt-1 text-xs text-[#5f6670]">
        고객 발송·커뮤니티 게시 전 아래 항목을 직접 확인하세요. (화면 표시용,
        저장되지 않습니다. 복사 버튼은 제공하지 않습니다.)
      </p>
      <ul className="mt-3 space-y-2 text-sm text-[#303845]">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span aria-hidden className="text-[#7a612d]">
              ☐
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatEvidenceDate(value?: string): string | null {
  if (!value) return null;
  return value;
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
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            className="rounded-md border border-[#e8dcc4] bg-white px-3 py-3 text-sm"
            key={`${item.type}-${item.id}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#f3ead8] px-2 py-0.5 text-xs font-semibold text-[#7a612d]">
                {RETRIEVAL_SOURCE_TYPE_LABEL[item.type]}
              </span>
              {item.isOfficialSource ? (
                <span className="rounded bg-[#e8f5ea] px-2 py-0.5 text-xs font-semibold text-[#2f6b3a]">
                  공식 출처
                </span>
              ) : null}
              {item.needsOfficialConfirmation ? (
                <span className="rounded bg-[#fff5e1] px-2 py-0.5 text-xs font-semibold text-[#7b4b19]">
                  공식 확인 필요
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-semibold text-[#102235]">{item.title}</p>
            {item.sourceName ? (
              <p className="mt-1 text-xs text-[#5f6670]">
                출처: {item.sourceName}
              </p>
            ) : null}
            {item.categoryLabel ? (
              <p className="mt-1 text-xs text-[#5f6670]">
                분류: {item.categoryLabel}
              </p>
            ) : null}
            {item.safeTextSummary ? (
              <p className="mt-2 text-[#4f5661]">{item.safeTextSummary}</p>
            ) : item.summary ? (
              <p className="mt-2 text-[#4f5661]">{item.summary}</p>
            ) : null}
            {item.sourceUrl ? (
              <p className="mt-2 break-all text-xs text-[#7a612d]">
                {item.sourceUrl}
              </p>
            ) : null}
            <dl className="mt-2 grid gap-1 text-xs text-[#5f6670] sm:grid-cols-3">
              {formatEvidenceDate(item.reviewedAt) ? (
                <div>
                  <dt className="inline font-semibold">검수일 </dt>
                  <dd className="inline">{item.reviewedAt}</dd>
                </div>
              ) : null}
              {formatEvidenceDate(item.lastVerifiedAt) ? (
                <div>
                  <dt className="inline font-semibold">확인일 </dt>
                  <dd className="inline">{item.lastVerifiedAt}</dd>
                </div>
              ) : null}
              {formatEvidenceDate(item.updatedAt) ? (
                <div>
                  <dt className="inline font-semibold">수정일 </dt>
                  <dd className="inline">{item.updatedAt}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
