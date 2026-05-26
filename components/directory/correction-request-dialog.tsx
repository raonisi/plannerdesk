"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PublicInsurer } from "@/lib/public/insurers";
import {
  CORRECTION_REQUEST_COPY,
  CORRECTION_REQUEST_TYPES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  formatCorrectionRequest,
  validateCorrectionRequest,
  type CorrectionRequestFieldError,
  type CorrectionRequestInput,
} from "@/lib/directory/correction-request";

export interface CorrectionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insurers: PublicInsurer[];
  preselectedInsurerId?: string | null;
}

type FieldErrors = Partial<Record<CorrectionRequestFieldError, string>>;

interface FormState {
  insurerId: string;
  requestType: string;
  message: string;
  sourceUrl: string;
  requesterName: string;
  requesterEmail: string;
}

const initialFormState: FormState = {
  insurerId: "",
  requestType: "",
  message: "",
  sourceUrl: "",
  requesterName: "",
  requesterEmail: "",
};

export function CorrectionRequestDialog({
  open,
  onOpenChange,
  insurers,
  preselectedInsurerId,
}: CorrectionRequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();

  // The native <dialog> element is the external system we are synchronizing
  // here. Only DOM-side methods are called from the effect; no React state is
  // updated, so the form-reset behavior lives inside the child component
  // (re-keyed below) instead.
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

  // Reset the form state by remounting the child each time a new "open
  // session" begins. The key changes whenever `open` flips or the
  // preselected insurer changes, so the user always sees a clean form.
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
}

function CorrectionRequestForm({
  descriptionId,
  headingId,
  initialInsurerId,
  insurers,
  onClose,
}: CorrectionRequestFormProps) {
  const sensitiveNoticeId = useId();
  const previewRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<FormState>(() => ({
    ...initialFormState,
    insurerId: initialInsurerId,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle",
  );

  const selectedInsurer = useMemo(
    () => insurers.find((i) => i.id === form.insurerId) ?? null,
    [insurers, form.insurerId],
  );

  const formattedPayload = useMemo(() => {
    if (
      !selectedInsurer ||
      !form.requestType ||
      form.message.trim().length === 0
    ) {
      return "";
    }
    return formatCorrectionRequest({
      insurerId: selectedInsurer.id,
      insurerName: selectedInsurer.name,
      requestType: form.requestType,
      message: form.message,
      sourceUrl: form.sourceUrl || undefined,
      requesterName: form.requesterName || undefined,
      requesterEmail: form.requesterEmail || undefined,
    });
  }, [form, selectedInsurer]);

  const handleCopy = useCallback(async () => {
    if (!selectedInsurer) {
      setErrors({
        insurerId: CORRECTION_REQUEST_COPY.validationRequired,
      });
      setCopyState("idle");
      return;
    }

    const input: CorrectionRequestInput = {
      insurerId: selectedInsurer.id,
      insurerName: selectedInsurer.name,
      requestType: form.requestType,
      message: form.message,
      sourceUrl: form.sourceUrl || undefined,
      requesterName: form.requesterName || undefined,
      requesterEmail: form.requesterEmail || undefined,
    };

    const validation = validateCorrectionRequest(input);
    if (!validation.ok) {
      setErrors(validation.errors);
      setCopyState("idle");
      return;
    }

    setErrors({});
    const payload = formatCorrectionRequest(input);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setCopyState("copied");
        return;
      }
    } catch {
      // Clipboard API can throw when the page is not focused or the user has
      // denied permission. Fall through to the manual-copy path below.
    }

    // Fallback for environments without the async Clipboard API (older
    // browsers, insecure contexts). Select the preview textarea so the user
    // can copy with Ctrl/Cmd+C.
    const preview = previewRef.current;
    if (preview) {
      preview.focus();
      preview.select();
    }
    setCopyState("manual");
  }, [form, selectedInsurer]);

  const messageLength = form.message.trim().length;
  const messageOverLimit = messageLength > MESSAGE_MAX_LENGTH;
  const messageUnderLimit =
    messageLength > 0 && messageLength < MESSAGE_MIN_LENGTH;

  return (
    <form
      className="flex max-h-[90dvh] flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        void handleCopy();
      }}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[#e7ddc9] px-6 py-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a612d]">
            PlannerDesk
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#102235]" id={headingId}>
            {CORRECTION_REQUEST_COPY.dialogTitle}
          </h2>
          <p className="mt-1 text-sm text-[#4f5661]" id={descriptionId}>
            {CORRECTION_REQUEST_COPY.dialogDescription}
          </p>
        </div>
        <button
          aria-label={CORRECTION_REQUEST_COPY.cancelAction}
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
            {CORRECTION_REQUEST_COPY.sensitiveWarningTitle}
          </p>
          <p className="mt-1">{CORRECTION_REQUEST_COPY.sensitiveWarningBody}</p>
          <p className="mt-2 text-[#4f5661]">
            {CORRECTION_REQUEST_COPY.reviewNoticeBody}
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_REQUEST_COPY.insurerLabel}
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
              {CORRECTION_REQUEST_COPY.insurerPlaceholder}
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

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_REQUEST_COPY.requestTypeLabel}
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
              {CORRECTION_REQUEST_COPY.requestTypePlaceholder}
            </option>
            {CORRECTION_REQUEST_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.requestType ? (
            <span className="mt-1 block text-xs text-[#a04141]">
              {errors.requestType}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_REQUEST_COPY.messageLabel}
          </span>
          <textarea
            aria-invalid={errors.message ? "true" : "false"}
            className="mt-1 min-h-32 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm leading-6 text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
            maxLength={MESSAGE_MAX_LENGTH + 200}
            name="message"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, message: event.target.value }))
            }
            placeholder={CORRECTION_REQUEST_COPY.messagePlaceholder}
            required
            value={form.message}
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5f6670]">
            <span>
              {messageLength}/{MESSAGE_MAX_LENGTH}
            </span>
            {messageUnderLimit || messageOverLimit ? (
              <span className="text-[#a04141]">
                {CORRECTION_REQUEST_COPY.validationMessageRange}
              </span>
            ) : null}
          </div>
          {errors.message ? (
            <span className="mt-1 block text-xs text-[#a04141]">
              {errors.message}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#303845]">
            {CORRECTION_REQUEST_COPY.sourceUrlLabel}
          </span>
          <input
            aria-invalid={errors.sourceUrl ? "true" : "false"}
            className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
            inputMode="url"
            name="sourceUrl"
            onChange={(event) =>
              setForm((prev) => ({ ...prev, sourceUrl: event.target.value }))
            }
            placeholder={CORRECTION_REQUEST_COPY.sourceUrlPlaceholder}
            type="url"
            value={form.sourceUrl}
          />
          <p className="mt-1 text-xs text-[#5f6670]">
            {CORRECTION_REQUEST_COPY.sourceUrlHint}
          </p>
          {errors.sourceUrl ? (
            <span className="mt-1 block text-xs text-[#a04141]">
              {errors.sourceUrl}
            </span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              {CORRECTION_REQUEST_COPY.requesterNameLabel}
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
              maxLength={120}
              name="requesterName"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  requesterName: event.target.value,
                }))
              }
              value={form.requesterName}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#303845]">
              {CORRECTION_REQUEST_COPY.requesterEmailLabel}
            </span>
            <input
              aria-invalid={errors.requesterEmail ? "true" : "false"}
              className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
              inputMode="email"
              maxLength={200}
              name="requesterEmail"
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  requesterEmail: event.target.value,
                }))
              }
              type="email"
              value={form.requesterEmail}
            />
            {errors.requesterEmail ? (
              <span className="mt-1 block text-xs text-[#a04141]">
                {errors.requesterEmail}
              </span>
            ) : null}
          </label>
        </div>
        <p className="-mt-2 text-xs text-[#5f6670]">
          {CORRECTION_REQUEST_COPY.optionalIdentityHint}
        </p>

        {formattedPayload ? (
          <div className="rounded-md border border-[#d9c9a8] bg-white p-3">
            <p className="text-xs font-semibold text-[#7a612d]">
              {CORRECTION_REQUEST_COPY.copyManualHint}
            </p>
            <textarea
              className="mt-2 h-40 w-full resize-none rounded-md border border-[#e7ddc9] bg-[#fbf7ee] p-3 text-xs leading-5 text-[#102235] outline-none focus:border-[#aa8137] focus:ring-2 focus:ring-[#aa8137]/15"
              readOnly
              ref={previewRef}
              value={formattedPayload}
            />
          </div>
        ) : null}

        {copyState === "copied" ? (
          <p
            aria-live="polite"
            className="rounded-md border border-[#9fb7a4] bg-[#edf4ee] px-3 py-2 text-sm font-semibold text-[#1f6b55]"
            role="status"
          >
            {CORRECTION_REQUEST_COPY.copySuccess}
          </p>
        ) : copyState === "manual" ? (
          <p
            aria-live="polite"
            className="rounded-md border border-[#d9c9a8] bg-[#fff7e6] px-3 py-2 text-sm text-[#7a612d]"
            role="status"
          >
            {CORRECTION_REQUEST_COPY.copyManualHint}
          </p>
        ) : null}

        <p className="text-xs leading-5 text-[#5f6670]">
          {CORRECTION_REQUEST_COPY.submissionChannelNote}
        </p>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#e7ddc9] px-6 py-4 sm:flex-row sm:justify-end">
        <button
          className="min-h-11 rounded-md border border-[#d9c9a8] bg-white px-4 text-sm font-semibold text-[#4f5661] transition hover:border-[#aa8137] hover:text-[#7a612d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137]"
          onClick={onClose}
          type="button"
        >
          {CORRECTION_REQUEST_COPY.cancelAction}
        </button>
        <button
          className="min-h-11 rounded-md bg-[#102235] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b344e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa8137] disabled:cursor-not-allowed disabled:bg-[#8a909a]"
          type="submit"
        >
          {CORRECTION_REQUEST_COPY.copyAction}
        </button>
      </footer>
    </form>
  );
}
