"use server";

import { prisma } from "@/lib/prisma";
import {
  CORRECTION_ERROR_MESSAGES,
  validateCorrectionSubmit,
  type CorrectionSubmitBlockReason,
} from "@/lib/correction-request/validation";
import { CORRECTION_SUBMIT_COPY } from "@/lib/correction-request/constants";

const DUPLICATE_WINDOW_MS = 5 * 60 * 1_000;

const FORBIDDEN_FORM_FIELD_NAMES = new Set([
  "requesterName",
  "requesterEmail",
  "customerName",
  "phone",
  "email",
  "residentId",
  "policyNumber",
  "contractNumber",
  "attachment",
  "file",
  "image",
  "ocrText",
]);

export type SubmitCorrectionRequestResult =
  | { ok: true; message: string }
  | {
      ok: false;
      reason: CorrectionSubmitBlockReason | "duplicate" | "server";
      message: string;
    };

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function hasFileUploadAttempt(formData: FormData): boolean {
  for (const [, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      return true;
    }
  }
  return false;
}

function hasForbiddenFields(formData: FormData): boolean {
  for (const key of formData.keys()) {
    if (FORBIDDEN_FORM_FIELD_NAMES.has(key)) {
      return true;
    }
  }
  return false;
}

// TODO(PR-80+): Session/IP rate limiting when shared infra is available.
// IP must not be persisted on CorrectionRequest without policy review.

export async function submitCorrectionRequest(
  formData: FormData,
): Promise<SubmitCorrectionRequestResult> {
  if (hasFileUploadAttempt(formData) || hasForbiddenFields(formData)) {
    return {
      ok: false,
      reason: "file_upload",
      message: CORRECTION_ERROR_MESSAGES.file_upload,
    };
  }

  const validation = validateCorrectionSubmit({
    targetType: textValue(formData, "targetType"),
    targetId: textValue(formData, "targetId") || null,
    requestType: textValue(formData, "requestType"),
    title: textValue(formData, "title"),
    message: textValue(formData, "message"),
    honeypot: textValue(formData, "honeypot"),
    sourceUrl: textValue(formData, "sourceUrl") || null,
  });

  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      reason: validation.reason ?? "validation",
      message:
        validation.message || CORRECTION_ERROR_MESSAGES.validation,
    };
  }

  const { targetType, targetId, requestType, title, message } =
    validation.data;

  try {
    const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const duplicate = await prisma.correctionRequest.findFirst({
      where: {
        title,
        message,
        createdAt: { gte: duplicateSince },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (duplicate) {
      return {
        ok: false,
        reason: "duplicate",
        message: CORRECTION_ERROR_MESSAGES.spam,
      };
    }

    await prisma.correctionRequest.create({
      data: {
        targetType,
        targetId,
        requestType,
        title,
        message,
        status: "new",
        priority: "normal",
        containsSensitiveData: false,
        redactionRequired: false,
      },
    });

    return {
      ok: true,
      message: CORRECTION_SUBMIT_COPY.submitSuccess,
    };
  } catch {
    return {
      ok: false,
      reason: "server",
      message: CORRECTION_SUBMIT_COPY.genericFailure,
    };
  }
}
