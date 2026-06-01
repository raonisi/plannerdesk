import { DisclosureLinkStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import {
  bulkRunError,
  type BulkRunResponse,
  runBulkPerRow,
} from "@/lib/admin/bulk-run";
import { getDisclosureBulkPublishBlockReason } from "@/lib/admin/disclosure-link-bulk-publish";

function wouldPublishBlocked(flags: {
  isPublished: boolean;
  status: DisclosureLinkStatus;
}): boolean {
  return flags.isPublished && flags.status !== DisclosureLinkStatus.published;
}

type DisclosureBulkRow = {
  id: string;
  title: string;
  url: string;
  status: DisclosureLinkStatus;
  isPublished: boolean;
  publishedAt: Date | null;
  reviewedAt: Date | null;
};

const TERMINAL_STATUSES = new Set<DisclosureLinkStatus>([
  DisclosureLinkStatus.archived,
]);

async function loadDisclosureBulkRows(
  ids: string[],
): Promise<Map<string, DisclosureBulkRow>> {
  const rows = await prisma.disclosureLink.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      url: true,
      status: true,
      isPublished: true,
      publishedAt: true,
      reviewedAt: true,
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

function reviewFields(
  status: DisclosureLinkStatus,
  userId: string | null,
  existingReviewedAt: Date | null,
): { reviewedAt?: Date | null; reviewedById?: string | null } {
  if (status === DisclosureLinkStatus.published) {
    return {
      reviewedAt: existingReviewedAt ?? new Date(),
      reviewedById: userId,
    };
  }
  if (
    status === DisclosureLinkStatus.draft ||
    status === DisclosureLinkStatus.needs_review
  ) {
    return { reviewedAt: null, reviewedById: null };
  }
  return {};
}

export async function runDisclosureLinkBulkByAction(
  actionId: AdminBulkActionId,
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  switch (actionId) {
  case "markNeedsReview": {
    return runBulkPerRow({
      ids,
      actionLabel: "검수 필요로 변경",
      loadRows: loadDisclosureBulkRows,
      resolve: (row) => {
        if (TERMINAL_STATUSES.has(row.status)) {
          return { outcome: "skipped" };
        }
        if (row.status === DisclosureLinkStatus.needs_review) {
          return { outcome: "skipped" };
        }
        return {
          outcome: "succeeded",
          data: {
            status: DisclosureLinkStatus.needs_review,
            ...reviewFields(
              DisclosureLinkStatus.needs_review,
              userId,
              row.reviewedAt,
            ),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.disclosureLink.update({ where: { id }, data });
      },
    });
  }
  case "markVerified": {
    return runBulkPerRow({
      ids,
      actionLabel: "검수 완료로 변경",
      loadRows: loadDisclosureBulkRows,
      resolve: (row) => {
        if (TERMINAL_STATUSES.has(row.status)) {
          return { outcome: "skipped" };
        }
        if (row.status === DisclosureLinkStatus.published) {
          return { outcome: "skipped" };
        }
        if (row.status === DisclosureLinkStatus.draft) {
          return {
            outcome: "failed",
            reason: "초안 상태는 검수 완료로 변경할 수 없습니다.",
          };
        }
        return {
          outcome: "succeeded",
          data: {
            status: DisclosureLinkStatus.published,
            ...reviewFields(
              DisclosureLinkStatus.published,
              userId,
              row.reviewedAt,
            ),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.disclosureLink.update({ where: { id }, data });
      },
    });
  }
  case "setStatusDraft": {
    return runBulkPerRow({
      ids,
      actionLabel: "초안으로 변경",
      loadRows: loadDisclosureBulkRows,
      resolve: (row) => {
        if (TERMINAL_STATUSES.has(row.status)) {
          return { outcome: "skipped" };
        }
        if (row.status === DisclosureLinkStatus.draft) {
          return { outcome: "skipped" };
        }
        if (
          wouldPublishBlocked({
            isPublished: row.isPublished,
            status: DisclosureLinkStatus.draft,
          })
        ) {
          return {
            outcome: "failed",
            reason: "게시 중인 항목은 초안으로 변경할 수 없습니다. 먼저 비공개하세요.",
          };
        }
        return {
          outcome: "succeeded",
          data: {
            status: DisclosureLinkStatus.draft,
            ...reviewFields(DisclosureLinkStatus.draft, userId, row.reviewedAt),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.disclosureLink.update({ where: { id }, data });
      },
    });
  }
  case "setPublishedTrue": {
    return runBulkPerRow({
      ids,
      actionLabel: "공개 처리",
      loadRows: loadDisclosureBulkRows,
      resolve: (row) => {
        if (row.isPublished) return { outcome: "skipped" };
        const block = getDisclosureBulkPublishBlockReason(row);
        if (block) return { outcome: "failed", reason: block };
        const publishedAt = publishTimestamp(true, row.publishedAt);
        return {
          outcome: "succeeded",
          data: {
            isPublished: true,
            ...(publishedAt !== undefined ? { publishedAt } : {}),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.disclosureLink.update({ where: { id }, data });
      },
    });
  }
  case "setPublishedFalse": {
    return runBulkPerRow({
      ids,
      actionLabel: "비공개 처리",
      loadRows: loadDisclosureBulkRows,
      resolve: (row) => {
        if (!row.isPublished) return { outcome: "skipped" };
        const publishedAt = publishTimestamp(false, row.publishedAt);
        return {
          outcome: "succeeded",
          data: {
            isPublished: false,
            ...(publishedAt !== undefined ? { publishedAt } : {}),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.disclosureLink.update({ where: { id }, data });
      },
    });
  }
  case "archive": {
    return runBulkPerRow({
      ids,
      actionLabel: "보관 처리",
      loadRows: loadDisclosureBulkRows,
      resolve: (row) => {
        if (row.status === DisclosureLinkStatus.archived) {
          return { outcome: "skipped" };
        }
        return {
          outcome: "succeeded",
          data: {
            status: DisclosureLinkStatus.archived,
            isPublished: false,
            publishedAt: null,
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.disclosureLink.update({ where: { id }, data });
      },
    });
  }
  default:
    return bulkRunError("이 공시·약관 목록에서 지원하지 않는 일괄 작업입니다.");
  }
}
