import {
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminBulkActionId } from "@/lib/admin/bulk-policies";
import {
  bulkRunError,
  type BulkRunResponse,
  runBulkPerRow,
} from "@/lib/admin/bulk-run";
import { getMessageTemplateBulkPublishBlockReason } from "@/lib/admin/message-template-bulk-publish";
import { wouldPublishBlocked } from "@/lib/validators/message-template";

type MessageTemplateBulkRow = {
  id: string;
  status: MessageTemplateStatus;
  isPublished: boolean;
  isInternalOnly: boolean;
  publishedAt: Date | null;
  reviewedAt: Date | null;
  safeCopy: string | null;
  riskLevel: MessageTemplateRiskLevel;
};

const TERMINAL_STATUSES = new Set<MessageTemplateStatus>([
  MessageTemplateStatus.archived,
]);

async function loadMessageTemplateBulkRows(
  ids: string[],
): Promise<Map<string, MessageTemplateBulkRow>> {
  const rows = await prisma.messageTemplate.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      status: true,
      isPublished: true,
      isInternalOnly: true,
      publishedAt: true,
      reviewedAt: true,
      safeCopy: true,
      riskLevel: true,
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
  status: MessageTemplateStatus,
  userId: string | null,
  existingReviewedAt: Date | null,
): { reviewedAt?: Date | null; reviewedById?: string | null } {
  if (status === MessageTemplateStatus.published) {
    return {
      reviewedAt: existingReviewedAt ?? new Date(),
      reviewedById: userId,
    };
  }
  if (
    status === MessageTemplateStatus.draft ||
    status === MessageTemplateStatus.needs_review
  ) {
    return { reviewedAt: null, reviewedById: null };
  }
  return {};
}

export async function runMessageTemplateBulkByAction(
  actionId: AdminBulkActionId,
  ids: unknown,
  userId: string | null,
): Promise<BulkRunResponse> {
  if (actionId === "markNeedsReview") {
    return runBulkPerRow({
      ids,
      actionLabel: "검수 필요로 변경",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (TERMINAL_STATUSES.has(row.status)) return { outcome: "skipped" };
        if (row.status === MessageTemplateStatus.needs_review) {
          return { outcome: "skipped" };
        }
        return {
          outcome: "succeeded",
          data: {
            status: MessageTemplateStatus.needs_review,
            ...reviewFields(
              MessageTemplateStatus.needs_review,
              userId,
              row.reviewedAt,
            ),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "markVerified") {
    return runBulkPerRow({
      ids,
      actionLabel: "검수 완료로 변경",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (TERMINAL_STATUSES.has(row.status)) return { outcome: "skipped" };
        if (row.status === MessageTemplateStatus.published) {
          return { outcome: "skipped" };
        }
        if (row.status === MessageTemplateStatus.draft) {
          return {
            outcome: "failed",
            reason: "초안 상태는 검수 완료로 변경할 수 없습니다.",
          };
        }
        return {
          outcome: "succeeded",
          data: {
            status: MessageTemplateStatus.published,
            ...reviewFields(
              MessageTemplateStatus.published,
              userId,
              row.reviewedAt,
            ),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "setStatusDraft") {
    return runBulkPerRow({
      ids,
      actionLabel: "초안으로 변경",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (TERMINAL_STATUSES.has(row.status)) return { outcome: "skipped" };
        if (row.status === MessageTemplateStatus.draft) {
          return { outcome: "skipped" };
        }
        if (
          wouldPublishBlocked({
            isPublished: row.isPublished,
            status: MessageTemplateStatus.draft,
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
            status: MessageTemplateStatus.draft,
            ...reviewFields(MessageTemplateStatus.draft, userId, row.reviewedAt),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "setPublishedTrue") {
    return runBulkPerRow({
      ids,
      actionLabel: "공개 처리",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (row.isPublished) return { outcome: "skipped" };
        const block = getMessageTemplateBulkPublishBlockReason(row);
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
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "setPublishedFalse") {
    return runBulkPerRow({
      ids,
      actionLabel: "비공개 처리",
      loadRows: loadMessageTemplateBulkRows,
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
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "setInternalOnlyTrue") {
    return runBulkPerRow({
      ids,
      actionLabel: "내부 전용 처리",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (row.isInternalOnly && !row.isPublished) {
          return { outcome: "skipped" };
        }
        const publishedAt = row.isPublished
          ? publishTimestamp(false, row.publishedAt)
          : undefined;
        return {
          outcome: "succeeded",
          data: {
            isInternalOnly: true,
            isPublished: false,
            ...(publishedAt !== undefined ? { publishedAt } : {}),
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "setInternalOnlyFalse") {
    return runBulkPerRow({
      ids,
      actionLabel: "내부 전용 해제",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (!row.isInternalOnly) return { outcome: "skipped" };
        return {
          outcome: "succeeded",
          data: {
            isInternalOnly: false,
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  if (actionId === "archive") {
    return runBulkPerRow({
      ids,
      actionLabel: "보관 처리",
      loadRows: loadMessageTemplateBulkRows,
      resolve: (row) => {
        if (row.status === MessageTemplateStatus.archived) {
          return { outcome: "skipped" };
        }
        return {
          outcome: "succeeded",
          data: {
            status: MessageTemplateStatus.archived,
            isPublished: false,
            publishedAt: null,
            updatedById: userId,
          },
        };
      },
      applyUpdate: async (id, data) => {
        await prisma.messageTemplate.update({ where: { id }, data });
      },
    });
  }

  return bulkRunError("이 고객문구 목록에서 지원하지 않는 일괄 작업입니다.");
}
