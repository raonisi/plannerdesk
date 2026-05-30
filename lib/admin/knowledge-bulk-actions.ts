import { KnowledgeArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isKnowledgeArticlePubliclyVisible } from "@/lib/public/knowledge-articles";
import type { BulkRunResponse } from "@/lib/admin/bulk-run";
import {
  bulkRunError,
  parseBulkIds,
} from "@/lib/admin/bulk-run";

type KnowledgeRow = {
  id: string;
  status: KnowledgeArticleStatus;
  isPublished: boolean;
  publishedAt: Date | null;
};

const TERMINAL_STATUSES = new Set<KnowledgeArticleStatus>([
  KnowledgeArticleStatus.archived,
  KnowledgeArticleStatus.rejected,
]);

async function loadRows(ids: string[]): Promise<Map<string, KnowledgeRow>> {
  const rows = await prisma.knowledgeArticle.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      status: true,
      isPublished: true,
      publishedAt: true,
    },
  });
  return new Map(rows.map((row) => [row.id, row]));
}

function publishTimestamp(
  isPublished: boolean,
  existingPublishedAt: Date | null,
): Date | null | undefined {
  if (!isPublished) return null;
  if (existingPublishedAt) return undefined;
  return new Date();
}

async function runPerId(
  ids: unknown,
  actionLabel: string,
  shouldSkip: (row: KnowledgeRow) => boolean,
  buildUpdate: (
    row: KnowledgeRow,
  ) => Record<string, unknown> | null,
  userId: string | null,
): Promise<BulkRunResponse> {
  const parsed = parseBulkIds(ids);
  if (!Array.isArray(parsed)) return parsed;

  const rowById = await loadRows(parsed);
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
      await prisma.knowledgeArticle.update({
        where: { id },
        data: {
          ...data,
          updatedById: userId,
        },
      });
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
    actionLabel,
  };
}

export function shouldSkipKnowledgeNeedsReview(row: KnowledgeRow): boolean {
  if (TERMINAL_STATUSES.has(row.status)) return true;
  return row.status === KnowledgeArticleStatus.needs_review;
}

export function shouldSkipKnowledgeVerified(row: KnowledgeRow): boolean {
  if (TERMINAL_STATUSES.has(row.status)) return true;
  return row.status === KnowledgeArticleStatus.verified;
}

export function shouldSkipKnowledgePublish(row: KnowledgeRow): boolean {
  if (row.isPublished) return true;
  if (TERMINAL_STATUSES.has(row.status)) return true;
  if (row.status === KnowledgeArticleStatus.draft) return true;
  if (!isKnowledgeArticlePubliclyVisible({ isPublished: true, status: row.status })) {
    return true;
  }
  return false;
}

export function shouldSkipKnowledgeUnpublish(row: KnowledgeRow): boolean {
  return !row.isPublished;
}

export function shouldSkipKnowledgeArchive(row: KnowledgeRow): boolean {
  return row.status === KnowledgeArticleStatus.archived;
}

export async function runBulkMarkKnowledgeNeedsReview(
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerId(
    ids,
    "검수 필요로 변경",
    shouldSkipKnowledgeNeedsReview,
    () => ({
      status: KnowledgeArticleStatus.needs_review,
      aiUsable: false,
    }),
    userId,
  );
}

export async function runBulkMarkKnowledgeVerified(
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerId(
    ids,
    "검수 완료로 변경",
    shouldSkipKnowledgeVerified,
    () => ({
      status: KnowledgeArticleStatus.verified,
      reviewedById: userId,
    }),
    userId,
  );
}

export async function runBulkSetKnowledgePublished(
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerId(
    ids,
    "공개 처리",
    shouldSkipKnowledgePublish,
    (row) => {
      const publishedAt = publishTimestamp(true, row.publishedAt);
      return {
        isPublished: true,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      };
    },
    userId,
  );
}

export async function runBulkSetKnowledgeUnpublished(
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerId(
    ids,
    "비공개 처리",
    shouldSkipKnowledgeUnpublish,
    () => ({
      isPublished: false,
      publishedAt: null,
    }),
    userId,
  );
}

export async function runBulkArchiveKnowledgeArticles(
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  return runPerId(
    ids,
    "보관 처리",
    shouldSkipKnowledgeArchive,
    () => ({
      status: KnowledgeArticleStatus.archived,
      isPublished: false,
      aiUsable: false,
      publishedAt: null,
    }),
    userId,
  );
}

export async function runKnowledgeBulkByAction(
  actionId: string,
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  if (actionId === "markNeedsReview") {
    return runBulkMarkKnowledgeNeedsReview(ids, userId);
  }
  if (actionId === "markVerified") {
    return runBulkMarkKnowledgeVerified(ids, userId);
  }
  if (actionId === "setPublishedTrue") {
    return runBulkSetKnowledgePublished(ids, userId);
  }
  if (actionId === "setPublishedFalse") {
    return runBulkSetKnowledgeUnpublished(ids, userId);
  }
  if (actionId === "archive") {
    return runBulkArchiveKnowledgeArticles(ids, userId);
  }
  return bulkRunError("지원하지 않는 일괄 작업입니다.");
}
