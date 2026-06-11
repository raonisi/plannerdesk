"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { CorrectionTargetType } from "@prisma/client";
import { submitCorrectionRequest } from "@/app/correction-requests/actions";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  CORRECTION_SUBMIT_COPY,
  DIRECTORY_REQUEST_TYPE_OPTIONS,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
} from "@/lib/correction-request/constants";
import { hasClientSensitiveSignal } from "@/lib/correction-request/validation";
import {
  CORRECTION_ALLOWED_REPORT_TOPICS,
  CORRECTION_PROHIBITED_INPUT_TOPICS,
} from "@/lib/correction-request/pii-guard";

export interface CorrectionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurers: PublicInsurer[];
  preselectedInsurerId?: string | null;
  /** Defaults to `insurer` for directory / disclosure flows. */
  targetType?: CorrectionTargetType;
}

type FieldErrors = Partial<
  Record<
    "insurerId" | "title" | "requestType" | "message" | "sourceUrl" | "form",
    string
  >
>;

interface FormState {
  insurerId: string;
  title: string;
  requestType: string;
  message: string;
  sourceUrl: string;
  honeypot: string;
}

const initialFormState: FormState = {
  insurerId: "",
  title: "",
  requestType: "",
  message: "",
  sourceUrl: "",
  honeypot: "",
};

export function CorrectionRequestDialog({
  open,
  onOpenChange,
  insurers,
  preselectedInsurerId,
  targetType = "insurer",
}: CorrectionRequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleNativeClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        handleClose();
      }
    },
    [handleClose],
  );

  const formKey = `${open ? "open" : "closed"}:${preselectedInsurerId ?? ""}`;

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={headingId}
      className="m-0 w-full max-w-2xl rounded-2xl border border-[#d9c9a8] bg-[#fbf7ee] p-0 text-[#102235] shadow-[0_30px_60px_rgba(16,34,53,0.18)] backdrop:bg-[#102235]/40 backdrop:backdrop-blur-sm sm:m-auto"
      onClick={handleBackdropClick}
      onClose={handleNativeClose}
      ref={dialogRef}
    >
      <CorrectionRequestForm
        descriptionId={descriptionId}
        headingId={headingId}
        initialInsurerId={preselectedInsurerId ?? ""}
        insurers={insurers}
        key={formKey}
        onClose={handleClose}
        targetType={targetType}
      />
    </dialog>
  );
}

interface CorrectionRequestFormProps {
  descriptionId: string;
  headingId: string;
  initialInsurerId: string;
  insurers: PublicInsurer[];
  onClose: () => void;
  targetType: CorrectionTargetType;
}

function CorrectionRequestForm({
  descriptionId,
  headingId,
  initialInsurerId,
  insurers,
  onClose,
  targetType,
}: CorrectionRequestFormProps) {
  const sensitiveNoticeId = useId();
  const honeypotId = useId();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(() => ({
    ...initialFormState,
    insurerId: initialInsurerId,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [resultMessage, setResultMessage] = useState("");
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  const combinedText = `${form.title}\n${form.message}\n${form.sourceUrl}`;
  const containsSensitiveSignal = useMemo(
    () => hasClientSensitiveSignal(combinedText),
    [combinedText],
  );

  const titleLength = form.title.trim().length;
  const messageLength = form.message.trim().length;
  const titleInvalid =
    titleLength > 0 &&
    (titleLength < TITLE_MIN_LENGTH || titleLength > TITLE_MAX_LENGTH);
  const messageInvalid =
    messageLength > 0 &&
    (messageLength < MESSAGE_MIN_LENGTH || messageLength > MESSAGE_MAX_LENGTH);

  const submitDisabled =
    isPending ||
    !safetyConfirmed ||
    containsSensitiveSignal ||
    titleInvalid ||
    messageInvalid ||
    (targetType === "insurer" && !form.insurerId);

  const handleSubmit = useCallback(() => {
    if (!safetyConfirmed || containsSensitiveSignal) {
      return;
    }

    if (targetType === "insurer" && !form.insurerId.trim()) {
      setErrors({ insurerId: CORRECTION_SUBMIT_COPY.validationRequired });
      return;
    }

    if (
      titleLength < TITLE_MIN_LENGTH ||
      titleLength > TITLE_MAX_LENGTH ||
      messageLength < MESSAGE_MIN_LENGTH ||
      messageLength > MESSAGE_MAX_LENGTH ||
      !form.requestType
    ) {
      setErrors({
        form: "제보 제목, 요청 종류, 내용을 확인해 주세요.",
      });
      return;
    }

    const payload = new FormData();
    payload.set("targetType", targetType);
    payload.set("targetId", form.insurerId.trim());
    payload.set("requestType", form.requestType);
    payload.set("title", form.title);
    payload.set("message", form.message);
    payload.set("honeypot", form.honeypot);
    if (form.sourceUrl.trim()) {
      payload.set("sourceUrl", form.sourceUrl.trim());
    }

    setErrors({});
    setSubmitState("idle");
    setResultMessage("");

    startTransition(async () => {
      const result = await submitCorrectionRequest(payload);
      if (result.ok) {
        setSubmitState("success");
        setResultMessage(result.message);
        return;
      }
      setSubmitState("error");
      setResultMessage(result.message);
    });
  }, [
    containsSensitiveSignal,
    form,
    messageLength,
    safetyConfirmed,
    targetType,
    titleLength,
  ]);

  return (
    <form
      className="flex max-h-[90dvh] flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[#e7ddc9] px-6 py-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a612d]">
            PlannerDesk
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#102235]" id={headingId}>
            {CORRECTION_SUBMIT_COPY.dialogTitle}
          </h2>
          <p className="mt-1 text-sm text-[#4f5661]" id={descriptionId}>
            {CORRECTION_SUBMIT_COPY.dialogDescription}
          </p>
        </div>
        <button
          aria-label={CORRECTION_SUBMIT_COPY.cancelAction}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9c9a8] bg-white text-lg text-[#4f5661] transition hover:border-[#aa8137] hover:text-[#7a612d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
          onClick={onClose}
          type="button"
        >
          <span aria-hidden="true">{"\u00d7"}</span>
        </button>
      </header>

      <div className="space-y-5 overflow-y-auto px-6 py-5">
        <div
          aria-labelledby={sensitiveNoticeId}
          className="rounded-md border border-[#d6a36e] bg-[#fff5e1] px-4 py-3 text-sm leading-relaxed text-[#7b4b19]"
          role="note"
        >
          <p className="font-semibold" id={sensitiveNoticeId}>
            {CORRECTION_SUBMIT_COPY.sensitiveWarningTitle}
          </p>
          <p className="mt-1">{CORRECTION_SUBMIT_COPY.sensitiveWarningBody}</p>
          <p className="mt-2 text-[#4f5661]">
            {CORRECTION_SUBMIT_COPY.officialSourceReminder}
          </p>
          <p className="mt-2 text-[#4f5661]">
            {CORRECTION_SUBMIT_COPY.reviewNoticeBody}
          </p>
          <p className="mt-2 text-[#4f5661]">
            {CORRECTION_SUBMIT_COPY.noAutoApplyNotice}
          </p>
        </div>

        <section className="rounded-md border border-[#d9c9a8] bg-white px-4 py-3">
          <h3 className="text-sm font-semibold text-[#102235]">제보 가능 항목</h3>
          <ul className="mt-2 grid gap-1 text-xs leading-5 text-[#4f5661] sm:grid-cols-2">
            {CORRECTION_ALLOWED_REPORT_TOPICS.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-[#d9c9a8] bg-[#fbf7ee] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#102235]">제보 금지 항목</h3>
          <ul className="mt-2 grid gap-1 text-xs leading-5 text-[#5f6670] sm:grid-cols-2">
            {CORRECTION_PROHIBITED_INPUT_TOPICS.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <input
          aria-hidden="true"
          autoComplete="off"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
          id={honeypotId}
          name="honeypot"
          onChange={(event) =>
            setForm((prev) => ({ ...prev, honeypot: event.target.value }))
          }
          tabIndex={-1}
          type="text"
          value={form.honeypot}
        />

        {targetType === "insurer" ? (
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              {CORRECTION_SUBMIT_COPY.insurerLabel}
            </span>
            <select
              aria-invalid={errors.insurerId ? "true" : "false"}
              className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
              name="insurerId"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, insurerId: event.target.value }))
              }
              required
              value={form.insurerId}
            >
              <option value="">
                {CORRECTION_SUBMIT_COPY.insurerPlaceholder}
              </option>
              {insurers.map((insurer) => (
                <option key={insurer.id} value={insurer.id}>
                  {insurer.name}
                </option>
              ))}
            </select>
            {errors.insurerId ? (
              <span className="mt-1 block text-xs text-[#a04141]">
                {errors.insurerId}
              </span>
            ) : null}
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_SUBMIT_COPY.titleLabel}
          </span>
          <input
            aria-invalid={errors.title ? "true" : "false"}
            className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
            maxLength={TITLE_MAX_LENGTH + 50}
            name="title"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder={CORRECTION_SUBMIT_COPY.titlePlaceholder}
            required
            value={form.title}
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5f6670]">
            <span>
              {titleLength}/{TITLE_MAX_LENGTH}
            </span>
            {titleInvalid ? (
              <span className="text-[#a04141]">
                {CORRECTION_SUBMIT_COPY.validationTitleRange}
              </span>
            ) : null}
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_SUBMIT_COPY.requestTypeLabel}
          </span>
          <select
            aria-invalid={errors.requestType ? "true" : "false"}
            className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
            name="requestType"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, requestType: event.target.value }))
            }
            required
            value={form.requestType}
          >
            <option value="">
              {CORRECTION_SUBMIT_COPY.requestTypePlaceholder}
            </option>
            {DIRECTORY_REQUEST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_SUBMIT_COPY.messageLabel}
          </span>
          <textarea
            aria-invalid={errors.message ? "true" : "false"}
            className="mt-1 min-h-32 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm leading-6 text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
            maxLength={MESSAGE_MAX_LENGTH + 200}
            name="message"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, message: event.target.value }))
            }
            placeholder={CORRECTION_SUBMIT_COPY.messagePlaceholder}
            required
            value={form.message}
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5f6670]">
            <span>
              {messageLength}/{MESSAGE_MAX_LENGTH}
            </span>
            {messageInvalid ? (
              <span className="text-[#a04141]">
                {CORRECTION_SUBMIT_COPY.validationMessageRange}
              </span>
            ) : null}
          </div>
        </label>

        {containsSensitiveSignal ? (
          <p
            aria-live="assertive"
            className="rounded-md border border-[#d9c9a8] bg-[#fff7e6] px-3 py-2 text-sm text-[#7a612d]"
            role="alert"
          >
            {CORRECTION_SUBMIT_COPY.piiBlockedMessage}
          </p>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_SUBMIT_COPY.sourceUrlLabel}
          </span>
          <input
            aria-invalid={errors.sourceUrl ? "true" : "false"}
            className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
            inputMode="url"
            name="sourceUrl"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sourceUrl: event.target.value }))
            }
            placeholder={CORRECTION_SUBMIT_COPY.sourceUrlPlaceholder}
            type="url"
            value={form.sourceUrl}
          />
          <p className="mt-1 text-xs text-[#5f6670]">
            {CORRECTION_SUBMIT_COPY.sourceUrlHint}
          </p>
        </label>

        <label className="flex items-start gap-3 rounded-md border border-[#d9c9a8] bg-white px-3 py-3">
          <input
            checked={safetyConfirmed}
            className="mt-0.5 h-4 w-4 rounded border-[#aa8137] text-[#173f36] focus:ring-[#aa8137]"
            onChange={(event) => setSafetyConfirmed(event.target.checked)}
            type="checkbox"
          />
          <span className="text-sm leading-6 text-[#303845]">
            {CORRECTION_SUBMIT_COPY.declarationLabel}
          </span>
        </label>

        {submitState === "success" ? (
          <p
            aria-live="polite"
            className="rounded-md border border-[#9fb7a4] bg-[#edf4ee] px-3 py-2 text-sm font-semibold text-[#1f6b55]"
            role="status"
          >
            {resultMessage}
          </p>
        ) : submitState === "error" ? (
          <p
            aria-live="assertive"
            className="rounded-md border border-[#d9c9a8] bg-[#fff7e6] px-3 py-2 text-sm text-[#7a612d]"
            role="alert"
          >
            {resultMessage}
          </p>
        ) : null}

        {errors.form ? (
          <p className="text-xs text-[#a04141]" role="alert">
            {errors.form}
          </p>
        ) : null}
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#e7ddc9] px-6 py-4 sm:flex-row sm:justify-end">
        <button
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#4f5661] transition hover:border-[#aa8137] hover:text-[#7a612d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
          onClick={onClose}
          type="button"
        >
          {CORRECTION_SUBMIT_COPY.cancelAction}
        </button>
        <button
          className="min-h-11 rounded-md bg-[#102235] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b344e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] disabled:cursor-not-allowed disabled:bg-[#8a909a]"
          disabled={submitDisabled}
          type="submit"
        >
          {isPending ? "접수 중…" : CORRECTION_SUBMIT_COPY.submitAction}
        </button>
      </footer>
      {!safetyConfirmed ? (
        <p className="px-6 pb-4 text-xs text-[#7a612d]">
          {CORRECTION_SUBMIT_COPY.declarationRequired}
        </p>
      ) : null}
    </form>
  );
}
