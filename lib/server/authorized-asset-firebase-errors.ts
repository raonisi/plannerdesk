/**
 * Firebase authorized asset upload errors with safe diagnostic fields.
 */

import { sanitizeUploadMessageSummary } from "@/lib/assets/authorized-asset-upload-diagnostics";

export class AuthorizedAssetFirebaseUploadError extends Error {
  readonly httpStatus: number | null;
  readonly errorCode: string;
  readonly messageSummary: string;
  readonly retryable: boolean | "unknown";

  constructor(input: {
    httpStatus: number | null;
    errorCode: string;
    messageSummary: string;
    retryable?: boolean | "unknown";
  }) {
    super(input.errorCode);
    this.name = "AuthorizedAssetFirebaseUploadError";
    this.httpStatus = input.httpStatus;
    this.errorCode = input.errorCode;
    this.messageSummary = sanitizeUploadMessageSummary(input.messageSummary);
    this.retryable = input.retryable ?? "unknown";
  }
}

export class AuthorizedAssetFirebaseMetadataError extends Error {
  readonly httpStatus: number | null;
  readonly errorCode: string;
  readonly messageSummary: string;
  readonly retryable: boolean | "unknown";

  constructor(input: {
    httpStatus: number | null;
    errorCode: string;
    messageSummary: string;
    retryable?: boolean | "unknown";
  }) {
    super(input.errorCode);
    this.name = "AuthorizedAssetFirebaseMetadataError";
    this.httpStatus = input.httpStatus;
    this.errorCode = input.errorCode;
    this.messageSummary = sanitizeUploadMessageSummary(input.messageSummary);
    this.retryable = input.retryable ?? "unknown";
  }
}

export function isRetryableHttpStatus(status: number | null): boolean | "unknown" {
  if (status === null) return "unknown";
  if (status === 429 || status >= 500) return true;
  if (status >= 400 && status < 500) return false;
  return "unknown";
}
