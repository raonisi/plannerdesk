import { VerificationStatus } from "@prisma/client";
import {
  isPublicVerificationStatus,
  wouldPublishDraft,
} from "@/lib/public/visibility";

export const BULK_ACTION_MAX_IDS = 100;

export type BulkRunResult = {
  ok: true;
  requested: number;
  succeeded: number;
  skipped: number;
  failed: number;
  actionLabel: string;
};

export type BulkRunError = {
  ok: false;
  message: string;
};

export type BulkRunResponse = BulkRunResult | BulkRunError;

export function bulkRunError(message: string): BulkRunError {
  return { ok: false, message };
}

export function parseBulkIds(ids: unknown): BulkRunError | string[] {
  if (!Array.isArray(ids)) {
    return bulkRunError("선택 항목 형식이 올바르지 않습니다.");
  }

  const unique = [
    ...new Set(
      ids
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
    ),
  ];

  if (unique.length === 0) {
    return bulkRunError("선택된 항목이 없습니다.");
  }

  if (unique.length > BULK_ACTION_MAX_IDS) {
    return bulkRunError(
      `한 번에 최대 ${BULK_ACTION_MAX_IDS}건까지 처리할 수 있습니다.`,
    );
  }

  return unique;
}

export function emptyBulkResult(
  actionLabel: string,
  requested = 0,
): BulkRunResult {
  return {
    ok: true,
    requested,
    succeeded: 0,
    skipped: requested,
    failed: 0,
    actionLabel,
  };
}

export type VerificationContentRow = {
  id: string;
  verificationStatus: VerificationStatus;
  isPublished: boolean;
};

export function shouldSkipNeedsReview(row: VerificationContentRow): boolean {
  return row.verificationStatus === VerificationStatus.needs_review;
}

export function shouldSkipVerified(row: VerificationContentRow): boolean {
  if (row.verificationStatus === VerificationStatus.verified) return true;
  if (row.verificationStatus === VerificationStatus.draft) return true;
  if (
    row.verificationStatus === VerificationStatus.unverified ||
    row.verificationStatus === VerificationStatus.pending
  ) {
    return true;
  }
  return false;
}

export function shouldSkipPublish(row: VerificationContentRow): boolean {
  if (row.isPublished) return true;
  if (row.verificationStatus === VerificationStatus.draft) return true;
  if (!isPublicVerificationStatus(row.verificationStatus)) return true;
  if (wouldPublishDraft(row)) return true;
  return false;
}

export function shouldSkipUnpublish(row: VerificationContentRow): boolean {
  return !row.isPublished;
}
