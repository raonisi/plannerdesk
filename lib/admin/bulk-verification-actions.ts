import { VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import {
  bulkRunError,
  emptyBulkResult,
  parseBulkIds,
  shouldSkipNeedsReview,
  shouldSkipPublish,
  shouldSkipUnpublish,
  shouldSkipVerified,
  type VerificationContentRow,
} from "@/lib/admin/bulk-run";

type RowSelect = {
  id: string;
  verificationStatus: VerificationStatus;
  isPublished: boolean;
};

async function loadRows(
  model: "insurer" | "claimDocument",
  ids: string[],
): Promise<RowSelect[]> {
  if (model === "insurer") {
    return prisma.insurer.findMany({
      where: { id: { in: ids } },
      select: { id: true, verificationStatus: true, isPublished: true },
    });
  }
  return prisma.claimDocument.findMany({
    where: { id: { in: ids } },
    select: { id: true, verificationStatus: true, isPublished: true },
  });
}

async function runPerIdUpdates(
  model: "insurer" | "claimDocument",
  ids: unknown,
  actionLabel: string,
  shouldSkip: (row: VerificationContentRow) => boolean,
  buildUpdate: (row: VerificationContentRow) => {
    verificationStatus?: VerificationStatus;
    isPublished?: boolean;
  } | null,
  userId: string | null,
): Promise<BulkRunResponse> {
  const parsed = parseBulkIds(ids);
  if (!Array.isArray(parsed)) return parsed;

  const rows = await loadRows(model, parsed);
  const rowById = new Map(rows.map((row) => [row.id, row]));

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of parsed) {
    const row = rowById.get(id);
    if (!row) {
      failed += 1;
      continue;
    }

    if (shouldSkip(row)) {
      skipped += 1;
      continue;
    }

    const data = buildUpdate(row);
    if (!data) {
      skipped += 1;
      continue;
    }

    try {
      if (model === "insurer") {
        await prisma.insurer.update({
          where: { id },
          data: { ...data, updatedById: userId },
        });
      } else {
        await prisma.claimDocument.update({
          where: { id },
          data: { ...data, updatedById: userId },
        });
      }
      succeeded += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    ok: true,
    requested: parsed.length,
    succeeded,
    skipped,
    failed,
    failures: [],
    actionLabel,
  };
}

export async function runBulkMarkNeedsReview(
  model: "insurer" | "claimDocument",
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerIdUpdates(
    model,
    ids,
    "검수 필요로 변경",
    shouldSkipNeedsReview,
    () => ({ verificationStatus: VerificationStatus.needs_review }),
    userId,
  );
}

export async function runBulkMarkVerified(
  model: "insurer" | "claimDocument",
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerIdUpdates(
    model,
    ids,
    "검수 완료로 변경",
    shouldSkipVerified,
    () => ({ verificationStatus: VerificationStatus.verified }),
    userId,
  );
}

export async function runBulkSetPublished(
  model: "insurer" | "claimDocument",
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerIdUpdates(
    model,
    ids,
    "공개 처리",
    shouldSkipPublish,
    () => ({ isPublished: true }),
    userId,
  );
}

export async function runBulkSetUnpublished(
  model: "insurer" | "claimDocument",
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerIdUpdates(
    model,
    ids,
    "비공개(공개 제외) 처리",
    shouldSkipUnpublish,
    () => ({ isPublished: false }),
    userId,
  );
}

export async function runInsurerBulkByAction(
  actionId: string,
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  if (actionId === "markNeedsReview") {
    return runBulkMarkNeedsReview("insurer", ids, userId);
  }
  if (actionId === "markVerified") {
    return runBulkMarkVerified("insurer", ids, userId);
  }
  if (actionId === "setPublishedTrue") {
    return runBulkSetPublished("insurer", ids, userId);
  }
  if (actionId === "setPublishedFalse") {
    return runBulkSetUnpublished("insurer", ids, userId);
  }
  return bulkRunError("지원하지 않는 일괄 작업입니다.");
}

export async function runClaimDocumentBulkByAction(
  actionId: string,
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  if (actionId === "markNeedsReview") {
    return runBulkMarkNeedsReview("claimDocument", ids, userId);
  }
  if (actionId === "markVerified") {
    return runBulkMarkVerified("claimDocument", ids, userId);
  }
  if (actionId === "setPublishedTrue") {
    return runBulkSetPublished("claimDocument", ids, userId);
  }
  if (actionId === "setPublishedFalse") {
    return runBulkSetUnpublished("claimDocument", ids, userId);
  }
  return bulkRunError("지원하지 않는 일괄 작업입니다.");
}

export function guardBulkIds(ids: unknown): BulkRunResponse | string[] {
  const parsed = parseBulkIds(ids);
  if (!Array.isArray(parsed)) return parsed;
  return parsed;
}

export { emptyBulkResult };
