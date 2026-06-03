// Beta safety feedback validation (PR-101). Blocks PII/medical/prompt storage.

import type {
  AnswerAssistantFeedbackNoteCategory,
  AnswerAssistantFeedbackSeverity,
  AnswerAssistantFeedbackType,
  AnswerAssistantFeedbackUsefulness,
  AnswerAssistantSafetySignal,
} from "@prisma/client";
import { hasClientSensitiveSignal } from "@/lib/correction-request/validation";
import { BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH } from "./beta-feedback-constants";

const FEEDBACK_TYPES = new Set<string>([
  "post_session",
  "blocked_experience",
  "safety_concern",
  "ui_understanding",
  "other_signal",
]);

const SAFETY_SIGNALS = new Set<string>([
  "blocking_felt_wrong",
  "evidence_too_weak",
  "output_too_assertive",
  "missing_disclaimer",
  "prompt_injection_risk",
  "privacy_risk",
  "none",
]);

const SEVERITIES = new Set<string>(["low", "medium", "high"]);

const USEFULNESS = new Set<string>([
  "not_useful",
  "partial",
  "helpful",
  "not_applicable",
]);

const NOTE_CATEGORIES = new Set<string>([
  "blocking",
  "evidence",
  "output_safety",
  "ui_copy",
  "rate_limit",
  "other",
]);

const HTML_PATTERN = /<[^>]+>|javascript:|on\w+\s*=/i;
const URL_COUNT_MAX = 2;

export type BetaFeedbackBlockReason =
  | "VALIDATION"
  | "SENSITIVE_CONTENT"
  | "HTML_INJECTION";

export interface BetaFeedbackSubmitInput {
  feedbackType: string;
  safetySignal: string;
  severity: string;
  usefulness: string;
  noteCategory: string;
  shortNote: string;
  usageAuditId?: string;
}

export interface BetaFeedbackValidatedPayload {
  feedbackType: AnswerAssistantFeedbackType;
  safetySignal: AnswerAssistantSafetySignal;
  severity: AnswerAssistantFeedbackSeverity;
  usefulness: AnswerAssistantFeedbackUsefulness;
  noteCategory: AnswerAssistantFeedbackNoteCategory | null;
  shortNote: string | null;
  usageAuditId: string | null;
}

export interface BetaFeedbackValidationResult {
  ok: boolean;
  reason?: BetaFeedbackBlockReason;
  message: string;
  data?: BetaFeedbackValidatedPayload;
}

export const BETA_FEEDBACK_ERROR_MESSAGES = {
  VALIDATION: "선택 항목을 확인해 주세요.",
  SENSITIVE_CONTENT:
    "개인정보·의료·계약·상담 원문으로 보이는 내용은 저장하지 않습니다. 분류만 선택해 주세요.",
  HTML_INJECTION: "허용되지 않는 형식입니다.",
} as const;

function countUrls(text: string): number {
  const matches = text.match(/https?:\/\/|www\./gi);
  return matches?.length ?? 0;
}

function sanitizeShortNote(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function validateBetaFeedbackSubmit(
  input: BetaFeedbackSubmitInput,
): BetaFeedbackValidationResult {
  if (!FEEDBACK_TYPES.has(input.feedbackType)) {
    return {
      ok: false,
      reason: "VALIDATION",
      message: BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
    };
  }

  if (!SAFETY_SIGNALS.has(input.safetySignal)) {
    return {
      ok: false,
      reason: "VALIDATION",
      message: BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
    };
  }

  if (!SEVERITIES.has(input.severity)) {
    return {
      ok: false,
      reason: "VALIDATION",
      message: BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
    };
  }

  if (!USEFULNESS.has(input.usefulness)) {
    return {
      ok: false,
      reason: "VALIDATION",
      message: BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
    };
  }

  const noteCategoryRaw = input.noteCategory?.trim();
  let noteCategory: AnswerAssistantFeedbackNoteCategory | null = null;
  if (noteCategoryRaw && noteCategoryRaw !== "none") {
    if (!NOTE_CATEGORIES.has(noteCategoryRaw)) {
      return {
        ok: false,
        reason: "VALIDATION",
        message: BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
      };
    }
    noteCategory = noteCategoryRaw as AnswerAssistantFeedbackNoteCategory;
  }

  const usageAuditId = input.usageAuditId?.trim() || null;
  if (usageAuditId && !/^c[a-z0-9]{20,30}$/i.test(usageAuditId)) {
    return {
      ok: false,
      reason: "VALIDATION",
      message: BETA_FEEDBACK_ERROR_MESSAGES.VALIDATION,
    };
  }

  const shortNoteRaw = sanitizeShortNote(input.shortNote ?? "");
  let shortNote: string | null = null;
  if (shortNoteRaw.length > 0) {
    if (shortNoteRaw.length > BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH) {
      return {
        ok: false,
        reason: "VALIDATION",
        message: `추가 메모는 ${BETA_FEEDBACK_SHORT_NOTE_MAX_LENGTH}자 이하로 입력해 주세요.`,
      };
    }
    if (HTML_PATTERN.test(shortNoteRaw)) {
      return {
        ok: false,
        reason: "HTML_INJECTION",
        message: BETA_FEEDBACK_ERROR_MESSAGES.HTML_INJECTION,
      };
    }
    if (countUrls(shortNoteRaw) > URL_COUNT_MAX) {
      return {
        ok: false,
        reason: "VALIDATION",
        message: "링크는 최대 2개까지 입력할 수 있습니다.",
      };
    }
    if (hasClientSensitiveSignal(shortNoteRaw)) {
      return {
        ok: false,
        reason: "SENSITIVE_CONTENT",
        message: BETA_FEEDBACK_ERROR_MESSAGES.SENSITIVE_CONTENT,
      };
    }
    shortNote = shortNoteRaw;
  }

  return {
    ok: true,
    message: "ok",
    data: {
      feedbackType: input.feedbackType as AnswerAssistantFeedbackType,
      safetySignal: input.safetySignal as AnswerAssistantSafetySignal,
      severity: input.severity as AnswerAssistantFeedbackSeverity,
      usefulness: input.usefulness as AnswerAssistantFeedbackUsefulness,
      noteCategory,
      shortNote,
      usageAuditId,
    },
  };
}

/** Suggests incident review when operator triages — not auto-applied. */
export function isBetaFeedbackIncidentCandidateHint(payload: {
  feedbackType: AnswerAssistantFeedbackType;
  safetySignal: AnswerAssistantSafetySignal | null;
  severity: AnswerAssistantFeedbackSeverity;
}): boolean {
  if (payload.severity === "high") return true;
  if (payload.feedbackType === "safety_concern") return true;
  if (
    payload.safetySignal === "privacy_risk" ||
    payload.safetySignal === "prompt_injection_risk" ||
    payload.safetySignal === "output_too_assertive"
  ) {
    return true;
  }
  return false;
}
