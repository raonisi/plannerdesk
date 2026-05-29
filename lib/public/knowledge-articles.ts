import { KnowledgeArticleStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  PUBLIC_CATEGORY_LABEL,
  PUBLIC_RISK_LABEL,
  PUBLIC_SOURCE_TYPE_LABEL,
  PUBLIC_STATUS_LABEL,
  PUBLIC_TYPE_LABEL,
  type PublicKnowledgeStatus,
} from "@/lib/public/knowledge-display";

export const PUBLIC_KNOWLEDGE_ARTICLE_STATUSES = [
  KnowledgeArticleStatus.verified,
  KnowledgeArticleStatus.needs_review,
] as const satisfies readonly KnowledgeArticleStatus[];

export type PublicKnowledgeArticleStatus =
  (typeof PUBLIC_KNOWLEDGE_ARTICLE_STATUSES)[number];

/** Canonical server-side filter for every public knowledge read path. */
export const PUBLIC_KNOWLEDGE_WHERE = {
  isPublished: true,
  status: { in: [...PUBLIC_KNOWLEDGE_ARTICLE_STATUSES] },
} as const satisfies Prisma.KnowledgeArticleWhereInput;

export function isPublicKnowledgeArticleStatus(
  status: KnowledgeArticleStatus,
): status is PublicKnowledgeArticleStatus {
  return (
    PUBLIC_KNOWLEDGE_ARTICLE_STATUSES as readonly KnowledgeArticleStatus[]
  ).includes(status);
}

export interface KnowledgeArticleVisibilityFlags {
  isPublished: boolean;
  status: KnowledgeArticleStatus;
}

export function isKnowledgeArticlePubliclyVisible(
  flags: KnowledgeArticleVisibilityFlags,
): boolean {
  return flags.isPublished && isPublicKnowledgeArticleStatus(flags.status);
}

const publicListSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  category: true,
  type: true,
  riskLevel: true,
  status: true,
  isPublished: true,
  aiUsable: true,
  sourceType: true,
  sourceTitle: true,
  sourceUrl: true,
  sourceCheckedAt: true,
  workflowLabel: true,
  tags: true,
  updatedAt: true,
  publishedAt: true,
} as const;

const publicDetailSelect = {
  slug: true,
  title: true,
  summary: true,
  content: true,
  category: true,
  type: true,
  riskLevel: true,
  status: true,
  aiUsable: true,
  sourceType: true,
  sourceTitle: true,
  sourceUrl: true,
  sourceCheckedAt: true,
  workflowLabel: true,
  tags: true,
  safeCopy: true,
  forbiddenClaims: true,
  updatedAt: true,
  publishedAt: true,
} as const;

type PublicListRecord = Prisma.KnowledgeArticleGetPayload<{
  select: typeof publicListSelect;
}>;

type PublicDetailRecord = Prisma.KnowledgeArticleGetPayload<{
  select: typeof publicDetailSelect;
}>;

export interface PublicKnowledgeArticleListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: PublicListRecord["category"];
  categoryLabel: string;
  type: PublicListRecord["type"];
  typeLabel: string;
  riskLevel: PublicListRecord["riskLevel"];
  riskLabel: string;
  status: PublicKnowledgeStatus;
  statusLabel: string;
  aiUsable: boolean;
  sourceType: PublicListRecord["sourceType"];
  sourceTypeLabel: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceCheckedAt: string | null;
  workflowLabel: string | null;
  tags: string[];
  updatedAt: string;
  publishedAt: string | null;
}

export interface PublicKnowledgeArticleDetail {
  slug: string;
  title: string;
  summary: string;
  content: string;
  bodyParagraphs: string[];
  categoryLabel: string;
  typeLabel: string;
  riskLevel: PublicDetailRecord["riskLevel"];
  riskLabel: string;
  status: PublicKnowledgeStatus;
  statusLabel: string;
  aiUsable: boolean;
  sourceTypeLabel: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  sourceCheckedAt: string | null;
  workflowLabel: string | null;
  tags: string[];
  safeCopy: string | null;
  forbiddenClaims: string[];
  updatedAt: string;
  publishedAt: string | null;
  lastReviewedAt: string | null;
}

export type PublicKnowledgeArticlesResult =
  | { status: "ok"; articles: PublicKnowledgeArticleListItem[] }
  | { status: "unavailable" };

export type PublicKnowledgeArticleBySlugResult =
  | { status: "ok"; article: PublicKnowledgeArticleDetail }
  | { status: "not_found" }
  | { status: "unavailable" };

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function splitContentParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function mapListItem(record: PublicListRecord): PublicKnowledgeArticleListItem {
  const status = record.status as PublicKnowledgeArticleStatus;

  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    category: record.category,
    categoryLabel: PUBLIC_CATEGORY_LABEL[record.category],
    type: record.type,
    typeLabel: PUBLIC_TYPE_LABEL[record.type],
    riskLevel: record.riskLevel,
    riskLabel: PUBLIC_RISK_LABEL[record.riskLevel],
    status,
    statusLabel: PUBLIC_STATUS_LABEL[status],
    aiUsable: record.aiUsable,
    sourceType: record.sourceType,
    sourceTypeLabel: PUBLIC_SOURCE_TYPE_LABEL[record.sourceType],
    sourceTitle: record.sourceTitle,
    sourceUrl: record.sourceUrl,
    sourceCheckedAt: toIsoDate(record.sourceCheckedAt),
    workflowLabel: record.workflowLabel,
    tags: record.tags,
    updatedAt: toIsoDate(record.updatedAt) ?? "",
    publishedAt: toIsoDate(record.publishedAt),
  };
}

function mapDetail(record: PublicDetailRecord): PublicKnowledgeArticleDetail {
  const status = record.status as PublicKnowledgeStatus;

  return {
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    content: record.content,
    bodyParagraphs: splitContentParagraphs(record.content),
    categoryLabel: PUBLIC_CATEGORY_LABEL[record.category],
    typeLabel: PUBLIC_TYPE_LABEL[record.type],
    riskLevel: record.riskLevel,
    riskLabel: PUBLIC_RISK_LABEL[record.riskLevel],
    status,
    statusLabel: PUBLIC_STATUS_LABEL[status],
    aiUsable: record.aiUsable,
    sourceTypeLabel: PUBLIC_SOURCE_TYPE_LABEL[record.sourceType],
    sourceTitle: record.sourceTitle,
    sourceUrl: record.sourceUrl,
    sourceCheckedAt: toIsoDate(record.sourceCheckedAt),
    workflowLabel: record.workflowLabel,
    tags: record.tags,
    safeCopy: record.safeCopy,
    forbiddenClaims: record.forbiddenClaims,
    updatedAt: toIsoDate(record.updatedAt) ?? "",
    publishedAt: toIsoDate(record.publishedAt),
    lastReviewedAt:
      toIsoDate(record.sourceCheckedAt) ?? toIsoDate(record.publishedAt),
  };
}

export async function getPublicKnowledgeArticles(): Promise<PublicKnowledgeArticlesResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "unavailable" };
  }

  try {
    const records = await prisma.knowledgeArticle.findMany({
      where: PUBLIC_KNOWLEDGE_WHERE,
      orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
      select: publicListSelect,
    });

    return {
      status: "ok",
      articles: records.map(mapListItem),
    };
  } catch {
    console.warn("[plannerdesk] getPublicKnowledgeArticles failed.");
    return { status: "unavailable" };
  }
}

/**
 * Fetches a single article by slug with the same visibility where clause as the list.
 * Never query by slug alone.
 */
export async function getPublicKnowledgeArticleBySlug(
  slug: string,
): Promise<PublicKnowledgeArticleBySlugResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "unavailable" };
  }

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    return { status: "not_found" };
  }

  try {
    const record = await prisma.knowledgeArticle.findFirst({
      where: {
        slug: normalizedSlug,
        ...PUBLIC_KNOWLEDGE_WHERE,
      },
      select: publicDetailSelect,
    });

    if (!record) {
      return { status: "not_found" };
    }

    return { status: "ok", article: mapDetail(record) };
  } catch {
    console.warn("[plannerdesk] getPublicKnowledgeArticleBySlug failed.");
    return { status: "unavailable" };
  }
}
