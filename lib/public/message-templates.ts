import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
  MessageTemplateTone,
  type Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findProhibitedPhrase, findSensitiveVariable } from "@/lib/message-template/safety";
import {
  getStaticMessageTemplateFallback,
  mergePublicMessageTemplates,
} from "@/lib/public/message-template-fallback";

/**
 * Canonical public visibility for MessageTemplate (PR-76).
 *
 * Visible only when ALL are true:
 * - isPublished === true
 * - status === published (admin "검수 완료")
 * - isInternalOnly === false
 * - reviewedAt is set
 * - safeCopy is non-empty (customer-facing reviewed wording)
 *
 * draft, needs_review, archived, unpublished, internal-only, unreviewed,
 * and rows without safeCopy must never appear on /message-templates.
 * `body` is never exposed on public routes.
 */
export const PUBLIC_MESSAGE_TEMPLATE_STATUS = MessageTemplateStatus.published;

export const PUBLIC_MESSAGE_TEMPLATE_WHERE = {
  isPublished: true,
  status: PUBLIC_MESSAGE_TEMPLATE_STATUS,
  isInternalOnly: false,
  reviewedAt: { not: null },
  AND: [{ safeCopy: { not: null } }, { safeCopy: { not: "" } }],
} as const satisfies Prisma.MessageTemplateWhereInput;

export interface MessageTemplateVisibilityFlags {
  isPublished: boolean;
  status: MessageTemplateStatus;
  isInternalOnly: boolean;
  reviewedAt: Date | null;
  safeCopy: string | null;
}

export function isMessageTemplatePubliclyVisible(
  flags: MessageTemplateVisibilityFlags,
): boolean {
  const safe = flags.safeCopy?.trim();
  return (
    flags.isPublished &&
    flags.status === PUBLIC_MESSAGE_TEMPLATE_STATUS &&
    !flags.isInternalOnly &&
    flags.reviewedAt !== null &&
    Boolean(safe)
  );
}

/** Public-safe projection. body, forbiddenClaims, complianceNote, etc. are excluded. */
export interface PublicMessageTemplate {
  id: string;
  title: string;
  description: string;
  safeCopy: string;
  category: MessageTemplateCategory;
  channel: MessageTemplateChannel;
  audienceType: MessageTemplateAudienceType;
  useCase: string;
  tone: MessageTemplateTone;
  riskLevel: MessageTemplateRiskLevel;
  sortOrder: number;
  publishedAt: string | null;
  updatedAt: string | null;
}

export type PublicMessageTemplatesResult =
  | { status: "ok"; data: PublicMessageTemplate[] }
  | { status: "error" };

const publicMessageTemplateSelect = {
  id: true,
  title: true,
  description: true,
  safeCopy: true,
  category: true,
  channel: true,
  audienceType: true,
  useCase: true,
  tone: true,
  riskLevel: true,
  sortOrder: true,
  publishedAt: true,
  updatedAt: true,
} as const;

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export async function getPublicMessageTemplates(): Promise<PublicMessageTemplatesResult> {
  const fallback = getStaticMessageTemplateFallback();

  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "ok", data: fallback };
  }

  try {
    const records = await prisma.messageTemplate.findMany({
      where: PUBLIC_MESSAGE_TEMPLATE_WHERE,
      orderBy: [
        { sortOrder: "asc" },
        { category: "asc" },
        { channel: "asc" },
        { publishedAt: "desc" },
        { updatedAt: "desc" },
      ],
      select: publicMessageTemplateSelect,
    });

    const data: PublicMessageTemplate[] = [];

    for (const record of records) {
      const safeCopy = record.safeCopy?.trim();
      if (!safeCopy) continue;
      if (findProhibitedPhrase(safeCopy)) continue;
      if (findSensitiveVariable(safeCopy)) continue;

      data.push({
        id: record.id,
        title: record.title,
        description: record.description,
        safeCopy,
        category: record.category,
        channel: record.channel,
        audienceType: record.audienceType,
        useCase: record.useCase,
        tone: record.tone,
        riskLevel: record.riskLevel,
        sortOrder: record.sortOrder,
        publishedAt: toIsoDate(record.publishedAt),
        updatedAt: toIsoDate(record.updatedAt),
      });
    }

    return { status: "ok", data: mergePublicMessageTemplates(data, fallback) };
  } catch {
    console.warn("[plannerdesk] getPublicMessageTemplates failed.");
    return { status: "ok", data: fallback };
  }
}
