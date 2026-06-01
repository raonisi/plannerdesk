// Admin unified search (PR-85). Separate from lib/search/public.ts — no public visibility reuse.

import {
  CorrectionRequestStatus,
  DisclosureLinkStatus,
  KnowledgeArticleStatus,
  MessageTemplateStatus,
  VerificationStatus,
  type Prisma,
} from "@prisma/client";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { categoryLabels as claimCategoryLabels } from "@/lib/claim-documents/category-labels";
import { CATEGORY_LABELS as insurerCategoryLabels } from "@/lib/directory/formatting";
import { PUBLIC_CATEGORY_LABEL, PUBLIC_TYPE_LABEL } from "@/lib/public/knowledge-display";
import { publicDisclosureCategoryLabels } from "@/lib/public/disclosure-display";
import {
  REQUEST_TYPE_LABELS,
  TARGET_TYPE_LABELS,
} from "@/lib/correction-request/constants";
import {
  ADMIN_SEARCH_MAX_PER_DOMAIN,
  ADMIN_SEARCH_MAX_TOTAL_RESULTS,
} from "./admin-constants";
import { ADMIN_SEARCH_DOMAIN_LABEL } from "./admin-labels";
import { validatePublicSearchQuery } from "./query-validation";
import type {
  AdminSearchDomain,
  AdminSearchInternalFilter,
  AdminSearchPublishedFilter,
  AdminSearchQueryInput,
  AdminSearchQueryResult,
  AdminSearchResult,
  AdminSearchSensitiveFilter,
  AdminSearchStatusFilter,
} from "./types";

function truncateSummary(text: string | null | undefined, max = 140): string {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

function toIsoDate(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.toISOString().slice(0, 10);
}

function truncateCorrectionTitle(title: string, sensitive: boolean): string {
  const max = sensitive ? 40 : 72;
  if (title.length <= max) return title;
  return `${title.slice(0, max)}…`;
}

const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  unverified: "미검증",
  pending: "대기",
  verified: "검수 완료",
  draft: "초안",
  needs_review: "검수 필요",
};

const KNOWLEDGE_STATUS_LABEL: Record<KnowledgeArticleStatus, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  verified: "검수 완료",
  archived: "보관",
  rejected: "반려",
};

const DISCLOSURE_STATUS_LABEL: Record<DisclosureLinkStatus, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  published: "게시",
  archived: "보관",
};

const MESSAGE_STATUS_LABEL: Record<MessageTemplateStatus, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  published: "게시",
  archived: "보관",
};

const CORRECTION_STATUS_LABEL: Record<CorrectionRequestStatus, string> = {
  new: "신규",
  triaged: "1차 확인",
  needs_redaction: "마스킹 필요",
  accepted: "반영 승인",
  rejected: "반려",
  applied: "반영 완료",
  archived: "보관",
  deleted: "삭제",
};

const MESSAGE_CATEGORY_LABEL: Record<string, string> = {
  greeting: "인사",
  follow_up: "후속 연락",
  appointment: "상담 예약",
  policy_review: "보장 점검",
  claim_guide: "청구 안내",
  contract_maintenance: "계약 유지",
  cancellation_defense: "해지 전 확인",
  rebalancing: "리밸런싱",
  customer_care: "고객 케어",
  notice: "공지",
  other: "기타",
};

function applyPublishedFilter(
  published: AdminSearchPublishedFilter,
): { isPublished: boolean } | undefined {
  if (published === "published") return { isPublished: true };
  if (published === "unpublished") return { isPublished: false };
  return undefined;
}

function applyInternalFilter(
  internal: AdminSearchInternalFilter,
): Pick<Prisma.MessageTemplateWhereInput, "isInternalOnly"> | undefined {
  if (internal === "internal") return { isInternalOnly: true };
  if (internal === "external") return { isInternalOnly: false };
  return undefined;
}

function applySensitiveFilter(
  sensitive: AdminSearchSensitiveFilter,
): Prisma.CorrectionRequestWhereInput | undefined {
  if (sensitive !== "flagged") return undefined;
  return {
    OR: [{ containsSensitiveData: true }, { redactionRequired: true }],
  };
}

function statusAppliesToDomain(
  status: AdminSearchStatusFilter,
  domain: AdminSearchDomain,
): boolean {
  if (status === "all") return true;
  if (status === "new" || status === "needsRedaction") {
    return domain === "all" || domain === "correction_request";
  }
  if (status === "archived") {
    return (
      domain === "all" ||
      domain === "knowledge_article" ||
      domain === "disclosure_link" ||
      domain === "message_template" ||
      domain === "correction_request"
    );
  }
  if (status === "published" || status === "draft" || status === "review") {
    return domain !== "correction_request";
  }
  return true;
}

function verificationStatusWhere(
  status: AdminSearchStatusFilter,
): Prisma.InsurerWhereInput | undefined {
  if (status === "draft") return { verificationStatus: VerificationStatus.draft };
  if (status === "review") {
    return { verificationStatus: VerificationStatus.needs_review };
  }
  if (status === "published") {
    return { verificationStatus: VerificationStatus.verified };
  }
  if (status === "archived") return { id: { in: [] } };
  return undefined;
}

function knowledgeStatusWhere(
  status: AdminSearchStatusFilter,
): Prisma.KnowledgeArticleWhereInput | undefined {
  if (status === "draft") return { status: KnowledgeArticleStatus.draft };
  if (status === "review") return { status: KnowledgeArticleStatus.needs_review };
  if (status === "published") return { status: KnowledgeArticleStatus.verified };
  if (status === "archived") return { status: KnowledgeArticleStatus.archived };
  if (status === "new" || status === "needsRedaction") return { id: { in: [] } };
  return undefined;
}

function disclosureStatusWhere(
  status: AdminSearchStatusFilter,
): Prisma.DisclosureLinkWhereInput | undefined {
  if (status === "draft") return { status: DisclosureLinkStatus.draft };
  if (status === "review") return { status: DisclosureLinkStatus.needs_review };
  if (status === "published") return { status: DisclosureLinkStatus.published };
  if (status === "archived") return { status: DisclosureLinkStatus.archived };
  if (status === "new" || status === "needsRedaction") return { id: { in: [] } };
  return undefined;
}

function messageStatusWhere(
  status: AdminSearchStatusFilter,
): Prisma.MessageTemplateWhereInput | undefined {
  if (status === "draft") return { status: MessageTemplateStatus.draft };
  if (status === "review") return { status: MessageTemplateStatus.needs_review };
  if (status === "published") return { status: MessageTemplateStatus.published };
  if (status === "archived") return { status: MessageTemplateStatus.archived };
  if (status === "new" || status === "needsRedaction") return { id: { in: [] } };
  return undefined;
}

function correctionStatusWhere(
  status: AdminSearchStatusFilter,
): Prisma.CorrectionRequestWhereInput | undefined {
  if (status === "new") return { status: CorrectionRequestStatus.new };
  if (status === "needsRedaction") {
    return {
      OR: [
        { status: CorrectionRequestStatus.needs_redaction },
        { redactionRequired: true },
      ],
    };
  }
  if (status === "archived") {
    return { status: CorrectionRequestStatus.archived };
  }
  if (status === "draft" || status === "review" || status === "published") {
    return { id: { in: [] } };
  }
  return undefined;
}

function mergeWhere<T extends object>(...parts: (T | undefined)[]): T {
  const and = parts.filter(Boolean) as T[];
  if (and.length === 0) return {} as T;
  if (and.length === 1) return and[0];
  return { AND: and } as unknown as T;
}

async function searchAdminInsurers(
  query: string,
  filters: AdminSearchQueryInput,
  limit: number,
): Promise<AdminSearchResult[]> {
  const where = mergeWhere<Prisma.InsurerWhereInput>(
    {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
        { sourceNote: { contains: query, mode: "insensitive" } },
        { cardPaymentNote: { contains: query, mode: "insensitive" } },
      ],
    },
    verificationStatusWhere(filters.status ?? "all"),
    applyPublishedFilter(filters.published ?? "all"),
  );

  const records = await prisma.insurer.findMany({
    where,
    take: limit,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      category: true,
      verificationStatus: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  return records.map((row) => ({
    id: row.id,
    type: "insurer",
    title: row.name,
    summary: insurerCategoryLabels[row.category],
    status: VERIFICATION_STATUS_LABEL[row.verificationStatus],
    isPublished: row.isPublished,
    categoryLabel: insurerCategoryLabels[row.category],
    updatedAt: toIsoDate(row.updatedAt),
    adminUrl: `/admin/insurers/${row.id}/edit`,
  }));
}

async function searchAdminClaimDocuments(
  query: string,
  filters: AdminSearchQueryInput,
  limit: number,
): Promise<AdminSearchResult[]> {
  const where = mergeWhere<Prisma.ClaimDocumentWhereInput>(
    {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { insurer: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    verificationStatusWhere(filters.status ?? "all") as
      | Prisma.ClaimDocumentWhereInput
      | undefined,
    applyPublishedFilter(filters.published ?? "all"),
  );

  const records = await prisma.claimDocument.findMany({
    where,
    take: limit,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      verificationStatus: true,
      isPublished: true,
      updatedAt: true,
      insurer: { select: { name: true } },
    },
  });

  return records.map((row) => ({
    id: row.id,
    type: "claim_document",
    title: row.title,
    summary: row.insurer?.name
      ? `${row.insurer.name} · ${claimCategoryLabels[row.category]}`
      : claimCategoryLabels[row.category],
    status: VERIFICATION_STATUS_LABEL[row.verificationStatus],
    isPublished: row.isPublished,
    categoryLabel: claimCategoryLabels[row.category],
    sourceLabel: row.insurer?.name ?? undefined,
    updatedAt: toIsoDate(row.updatedAt),
    adminUrl: `/admin/claim-documents/${row.id}/edit`,
  }));
}

async function searchAdminKnowledge(
  query: string,
  filters: AdminSearchQueryInput,
  limit: number,
): Promise<AdminSearchResult[]> {
  const where = mergeWhere<Prisma.KnowledgeArticleWhereInput>(
    {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { workflowLabel: { contains: query, mode: "insensitive" } },
        { sourceTitle: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    knowledgeStatusWhere(filters.status ?? "all"),
    applyPublishedFilter(filters.published ?? "all"),
  );

  const records = await prisma.knowledgeArticle.findMany({
    where,
    take: limit,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      category: true,
      type: true,
      status: true,
      riskLevel: true,
      isPublished: true,
      updatedAt: true,
    },
  });

  return records.map((row) => ({
    id: row.id,
    type: "knowledge_article",
    title: row.title,
    summary: truncateSummary(row.summary),
    status: KNOWLEDGE_STATUS_LABEL[row.status],
    isPublished: row.isPublished,
    riskBadge: row.riskLevel,
    categoryLabel: [
      PUBLIC_CATEGORY_LABEL[row.category],
      PUBLIC_TYPE_LABEL[row.type],
    ].join(" · "),
    updatedAt: toIsoDate(row.updatedAt),
    adminUrl: `/admin/knowledge/${row.id}/edit`,
  }));
}

async function searchAdminDisclosureLinks(
  query: string,
  filters: AdminSearchQueryInput,
  limit: number,
): Promise<AdminSearchResult[]> {
  const where = mergeWhere<Prisma.DisclosureLinkWhereInput>(
    {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { url: { contains: query, mode: "insensitive" } },
        { sourceName: { contains: query, mode: "insensitive" } },
        { adminMemo: { contains: query, mode: "insensitive" } },
        { insurer: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    disclosureStatusWhere(filters.status ?? "all"),
    applyPublishedFilter(filters.published ?? "all"),
  );

  const records = await prisma.disclosureLink.findMany({
    where,
    take: limit,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      isPublished: true,
      sourceName: true,
      reviewedAt: true,
      lastVerifiedAt: true,
      updatedAt: true,
      insurer: { select: { name: true } },
    },
  });

  return records.map((row) => ({
    id: row.id,
    type: "disclosure_link",
    title: row.title,
    summary: truncateSummary(row.description),
    status: DISCLOSURE_STATUS_LABEL[row.status],
    isPublished: row.isPublished,
    categoryLabel: publicDisclosureCategoryLabels[row.category],
    sourceLabel: row.sourceName ?? row.insurer?.name ?? undefined,
    updatedAt: toIsoDate(row.updatedAt),
    adminUrl: `/admin/disclosure-links/${row.id}/edit`,
  }));
}

async function searchAdminMessageTemplates(
  query: string,
  filters: AdminSearchQueryInput,
  limit: number,
): Promise<AdminSearchResult[]> {
  const where = mergeWhere<Prisma.MessageTemplateWhereInput>(
    {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
        { safeCopy: { contains: query, mode: "insensitive" } },
        { useCase: { contains: query, mode: "insensitive" } },
      ],
    },
    messageStatusWhere(filters.status ?? "all"),
    applyPublishedFilter(filters.published ?? "all"),
    applyInternalFilter(filters.internal ?? "all"),
  );

  const records = await prisma.messageTemplate.findMany({
    where,
    take: limit,
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      safeCopy: true,
      category: true,
      status: true,
      riskLevel: true,
      isPublished: true,
      isInternalOnly: true,
      updatedAt: true,
    },
  });

  return records.map((row) => ({
    id: row.id,
    type: "message_template",
    title: row.title,
    summary: truncateSummary(row.safeCopy ?? row.description),
    status: MESSAGE_STATUS_LABEL[row.status],
    isPublished: row.isPublished,
    isInternalOnly: row.isInternalOnly,
    riskBadge: row.riskLevel,
    categoryLabel: MESSAGE_CATEGORY_LABEL[row.category] ?? row.category,
    updatedAt: toIsoDate(row.updatedAt),
    adminUrl: `/admin/message-templates/${row.id}/edit`,
  }));
}

async function searchAdminCorrectionRequests(
  query: string,
  filters: AdminSearchQueryInput,
  limit: number,
): Promise<AdminSearchResult[]> {
  const where = mergeWhere<Prisma.CorrectionRequestWhereInput>(
    { deletedAt: null },
    {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { adminMemo: { contains: query, mode: "insensitive" } },
      ],
    },
    correctionStatusWhere(filters.status ?? "all"),
    applySensitiveFilter(filters.sensitive ?? "all"),
  );

  const records = await prisma.correctionRequest.findMany({
    where,
    take: limit,
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      requestType: true,
      targetType: true,
      status: true,
      priority: true,
      containsSensitiveData: true,
      redactionRequired: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return records.map((row) => {
    const sensitive =
      row.containsSensitiveData || row.redactionRequired;
    return {
      id: row.id,
      type: "correction_request",
      title: truncateCorrectionTitle(row.title, sensitive),
      summary: `${REQUEST_TYPE_LABELS[row.requestType]} · ${TARGET_TYPE_LABELS[row.targetType]}`,
      status: CORRECTION_STATUS_LABEL[row.status],
      containsSensitiveData: row.containsSensitiveData,
      redactionRequired: row.redactionRequired,
      sensitiveBadge: sensitive ? "민감정보 의심" : undefined,
      riskBadge: row.redactionRequired ? "마스킹 필요" : undefined,
      createdAt: toIsoDate(row.createdAt),
      updatedAt: toIsoDate(row.updatedAt),
      adminUrl: `/admin/corrections/${row.id}`,
    };
  });
}

type AdminDomainTarget = Exclude<AdminSearchDomain, "all">;

const ADMIN_DOMAIN_SEARCHERS: Record<
  AdminDomainTarget,
  (
    query: string,
    filters: AdminSearchQueryInput,
    limit: number,
  ) => Promise<AdminSearchResult[]>
> = {
  insurer: searchAdminInsurers,
  claim_document: searchAdminClaimDocuments,
  knowledge_article: searchAdminKnowledge,
  disclosure_link: searchAdminDisclosureLinks,
  message_template: searchAdminMessageTemplates,
  correction_request: searchAdminCorrectionRequests,
};

function shouldSearchAdminDomain(
  domain: AdminSearchDomain,
  target: AdminDomainTarget,
  status: AdminSearchStatusFilter,
): boolean {
  if (domain !== "all" && domain !== target) return false;
  return statusAppliesToDomain(status, target);
}

function sortAdminResults(results: AdminSearchResult[]): AdminSearchResult[] {
  return [...results].sort((a, b) => {
    const dateA = a.updatedAt ?? a.createdAt ?? "";
    const dateB = b.updatedAt ?? b.createdAt ?? "";
    const dateDiff = dateB.localeCompare(dateA);
    if (dateDiff !== 0) return dateDiff;
    return a.title.localeCompare(b.title, "ko-KR");
  });
}

/**
 * Admin unified search. Requires content_admin or super_admin.
 * Never exposes CorrectionRequest message body or public URLs.
 */
export async function searchAdminContent(
  input: AdminSearchQueryInput,
): Promise<AdminSearchQueryResult> {
  try {
    await requireAdminAccess();
  } catch {
    return {
      ok: false,
      blockedReason: "unauthorized",
      message: "관리자 권한이 필요합니다.",
    };
  }

  const trimmed = input.q?.trim() ?? "";
  if (!trimmed) {
    return { ok: true, results: [], total: 0 };
  }

  const validation = validatePublicSearchQuery(trimmed);
  if (!validation.ok) {
    return {
      ok: false,
      blockedReason: validation.blockedReason,
      message: validation.message,
    };
  }

  const query = validation.query;
  const domain = input.domain ?? "all";
  const status = input.status ?? "all";

  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: true, results: [], total: 0 };
  }

  try {
    const perDomainLimit =
      domain === "all"
        ? ADMIN_SEARCH_MAX_PER_DOMAIN
        : Math.min(
            ADMIN_SEARCH_MAX_TOTAL_RESULTS,
            ADMIN_SEARCH_MAX_PER_DOMAIN * 2,
          );

    const targets = Object.keys(ADMIN_DOMAIN_SEARCHERS) as AdminDomainTarget[];
    const buckets: AdminSearchResult[] = [];

    await Promise.all(
      targets.map(async (target) => {
        if (!shouldSearchAdminDomain(domain, target, status)) return;
        const rows = await ADMIN_DOMAIN_SEARCHERS[target](
          query,
          input,
          perDomainLimit,
        );
        buckets.push(...rows);
      }),
    );

    const sorted = sortAdminResults(buckets).slice(
      0,
      ADMIN_SEARCH_MAX_TOTAL_RESULTS,
    );

    return { ok: true, results: sorted, total: sorted.length };
  } catch (error) {
    console.warn("[plannerdesk] searchAdminContent failed.", error);
    return { ok: true, results: [], total: 0 };
  }
}

export { ADMIN_SEARCH_DOMAIN_LABEL };
