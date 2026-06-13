import type { ClaimDocumentReviewStatus } from "./governance-types";

export const CLAIM_DOCUMENT_REVIEW_STATUS_VALUES: readonly ClaimDocumentReviewStatus[] =
  ["verified", "needs_review", "outdated", "hidden", "unknown"] as const;

export const GOVERNANCE_CAUTION_TEXT_MAX_LENGTH = 1_000;
export const GOVERNANCE_ADMIN_MEMO_MAX_LENGTH = 2_000;
export const GOVERNANCE_CHANGE_REASON_MAX_LENGTH = 500;
export const GOVERNANCE_OFFICIAL_SOURCE_LABEL_MAX_LENGTH = 120;

const IMMUTABLE_FIELDS = new Set([
  "filePath",
  "fileName",
  "documentTitle",
  "insurerName",
]);

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ClaimDocumentGovernanceSaveInput = {
  documentKey: string;
  officialSourceUrl?: string | null;
  officialSourceLabel?: string | null;
  lastVerifiedAt?: string | null;
  nextReviewDueAt?: string | null;
  reviewStatus: ClaimDocumentReviewStatus;
  isVisible: boolean;
  isDownloadEnabled: boolean;
  cautionText?: string | null;
  adminMemo?: string | null;
  changeReason?: string | null;
};

export type ClaimDocumentGovernanceValidationResult =
  | { ok: true; data: ClaimDocumentGovernanceSaveInput }
  | { ok: false; message: string };

function optionalTrimmedString(
  value: unknown,
  maxLength: number,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function parseOptionalDate(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!DATE_ONLY_PATTERN.test(trimmed)) {
    return undefined;
  }
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return trimmed;
}

function parseOptionalUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

function parseReviewStatus(value: unknown): ClaimDocumentReviewStatus | undefined {
  if (typeof value !== "string") return undefined;
  return CLAIM_DOCUMENT_REVIEW_STATUS_VALUES.includes(
    value as ClaimDocumentReviewStatus,
  )
    ? (value as ClaimDocumentReviewStatus)
    : undefined;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}

export function rejectImmutableGovernanceFields(
  payload: Record<string, unknown>,
): string | null {
  for (const field of IMMUTABLE_FIELDS) {
    if (field in payload) {
      return `${field} 필드는 수정할 수 없습니다.`;
    }
  }
  return null;
}

export function validateClaimDocumentGovernanceSave(
  payload: Record<string, unknown>,
): ClaimDocumentGovernanceValidationResult {
  const documentKey =
    typeof payload.documentKey === "string" ? payload.documentKey.trim() : "";
  if (!documentKey) {
    return { ok: false, message: "documentKey가 필요합니다." };
  }

  const reviewStatus = parseReviewStatus(payload.reviewStatus);
  if (!reviewStatus) {
    return { ok: false, message: "검수 상태 값이 올바르지 않습니다." };
  }

  const isVisible = parseBoolean(payload.isVisible);
  const isDownloadEnabled = parseBoolean(payload.isDownloadEnabled);
  if (isVisible === undefined || isDownloadEnabled === undefined) {
    return { ok: false, message: "노출 여부와 다운로드 허용 값이 올바르지 않습니다." };
  }

  const officialSourceUrl = parseOptionalUrl(payload.officialSourceUrl);
  if (officialSourceUrl === undefined && payload.officialSourceUrl !== undefined) {
    return { ok: false, message: "공식 URL 형식이 올바르지 않습니다." };
  }

  const lastVerifiedAt = parseOptionalDate(payload.lastVerifiedAt);
  if (lastVerifiedAt === undefined && payload.lastVerifiedAt !== undefined) {
    return { ok: false, message: "검수일 형식이 올바르지 않습니다." };
  }

  const nextReviewDueAt = parseOptionalDate(payload.nextReviewDueAt);
  if (nextReviewDueAt === undefined && payload.nextReviewDueAt !== undefined) {
    return { ok: false, message: "다음 검수 예정일 형식이 올바르지 않습니다." };
  }

  return {
    ok: true,
    data: {
      documentKey,
      officialSourceUrl,
      officialSourceLabel: optionalTrimmedString(
        payload.officialSourceLabel,
        GOVERNANCE_OFFICIAL_SOURCE_LABEL_MAX_LENGTH,
      ),
      lastVerifiedAt,
      nextReviewDueAt,
      reviewStatus,
      isVisible,
      isDownloadEnabled,
      cautionText: optionalTrimmedString(
        payload.cautionText,
        GOVERNANCE_CAUTION_TEXT_MAX_LENGTH,
      ),
      adminMemo: optionalTrimmedString(
        payload.adminMemo,
        GOVERNANCE_ADMIN_MEMO_MAX_LENGTH,
      ),
      changeReason: optionalTrimmedString(
        payload.changeReason,
        GOVERNANCE_CHANGE_REASON_MAX_LENGTH,
      ),
    },
  };
}

export function parseClaimDocumentGovernanceFormData(
  formData: FormData,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      payload[key] = value;
    }
  }
  return payload;
}
