"use client";

import { useMemo, useState, useTransition } from "react";
import { hasClientSensitiveSignal } from "@/lib/correction-request/validation";
import { submitAnswerAssistantBetaFeedbackAction } from "@/app/planner/answer-assistant/feedback-actions";
import { BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH } from "@/lib/answer-assistant/beta-feedback-constants";
import {
  BETA_FEEDBACK_NOTE_CATEGORY_OPTIONS,
  BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS,
  BETA_FEEDBACK_SEVERITY_OPTIONS,
  BETA_FEEDBACK_TYPE_OPTIONS,
  BETA_FEEDBACK_USEFULNESS_OPTIONS,
} from "@/lib/answer-assistant/beta-feedback-labels";

export function BetaSafetyFeedbackForm({
  usageAuditId,
}: {
  usageAuditId?: string;
}) {
  const [feedbackType, setFeedbackType] = useState("post_session");
  const [safetySignal, setSafetySignal] = useState("none");
  const [severity, setSeverity] = useState("low");
  const [usefulness, setUsefulness] = useState("not_applicable");
  const [noteCategory, setNoteCategory] = useState("none");
  const [shortNote, setShortNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sensitive = useMemo(
    () => hasClientSensitiveSignal(shortNote),
    [shortNote],
  );

  const handleSubmit = () => {
    if (submitted || sensitive) return;
    const formData = new FormData();
    formData.set("feedbackType", feedbackType);
    formData.set("safetySignal", safetySignal);
    formData.set("severity", severity);
    formData.set("usefulness", usefulness);
    formData.set("noteCategory", noteCategory);
    formData.set("shortNote", shortNote);
    if (usageAuditId) {
      formData.set("usageAuditId", usageAuditId);
    }

    startTransition(async () => {
      const result = await submitAnswerAssistantBetaFeedbackAction(formData);
      if (result.ok) {
        setSubmitted(true);
        setMessage("beta 안전 피드백이 저장되었습니다. 상담 원문·생성 초안은 저장되지 않습니다.");
      } else {
        setMessage(result.message);
      }
    });
  };

  return (
    <section className="rounded-lg border border-[#c8d2dc] bg-[#eef3f7] px-4 py-4 text-sm text-[#102235]">
      <h2 className="font-semibold">beta 안전 피드백 (선택)</h2>
      <p className="mt-2 text-xs leading-relaxed text-[#4f5661]">
        답변 품질 평가가 아니라 beta 운영 안전 신호 수집용입니다. 고객 상담
        원문·생성 초안·개인정보는 입력하지 마세요.
      </p>

      {submitted ? (
        <p className="mt-3 text-sm text-[#1f6b55]" role="status">
          {message}
        </p>
      ) : (
        <fieldset className="mt-4 space-y-3" disabled={isPending}>
          <label className="block">
            <span className="text-xs font-semibold">피드백 유형</span>
            <select
              className="mt-1 min-h-10 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
              onChange={(e) => setFeedbackType(e.target.value)}
              value={feedbackType}
            >
              {BETA_FEEDBACK_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold">안전 신호</span>
            <select
              className="mt-1 min-h-10 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
              onChange={(e) => setSafetySignal(e.target.value)}
              value={safetySignal}
            >
              {BETA_FEEDBACK_SAFETY_SIGNAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold">심각도</span>
              <select
                className="mt-1 min-h-10 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                onChange={(e) => setSeverity(e.target.value)}
                value={severity}
              >
                {BETA_FEEDBACK_SEVERITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold">도움 정도</span>
              <select
                className="mt-1 min-h-10 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
                onChange={(e) => setUsefulness(e.target.value)}
                value={usefulness}
              >
                {BETA_FEEDBACK_USEFULNESS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold">분류 (선택)</span>
            <select
              className="mt-1 min-h-10 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
              onChange={(e) => setNoteCategory(e.target.value)}
              value={noteCategory}
            >
              <option value="none">선택 안 함</option>
              {BETA_FEEDBACK_NOTE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold">
              추가 메모 (선택, {BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH}자 이하)
            </span>
            <textarea
              className="mt-1 min-h-[4rem] w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm"
              maxLength={BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH}
              onChange={(e) => setShortNote(e.target.value)}
              placeholder="상담 원문·고객명·진단명 없이 운영 신호만 간단히"
              value={shortNote}
            />
          </label>

          {sensitive ? (
            <p className="text-xs text-[#8b2e2e]" role="alert">
              민감정보로 보이는 내용은 저장되지 않습니다.
            </p>
          ) : null}

          {message && !submitted ? (
            <p className="text-xs text-[#8b2e2e]" role="alert">
              {message}
            </p>
          ) : null}

          <button
            className="min-h-10 rounded-lg border border-[#102235] bg-white px-4 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5] disabled:opacity-50"
            disabled={isPending || sensitive}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? "제출 중…" : "안전 피드백 제출"}
          </button>
        </fieldset>
      )}
    </section>
  );
}
