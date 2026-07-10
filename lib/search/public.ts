// Public global search (PR-83). Uses canonical visibility from lib/public/*.

import {
  getCanonicalPublicInsurerId,
  PUBLIC_VERIFICATION_STATUSES,
} from "@/lib/public/insurers";
import { PUBLIC_KNOWLEDGE_WHERE } from "@/lib/public/knowledge-articles";
import { PUBLIC_DISCLOSURE_LINK_WHERE } from "@/lib/public/disclosure-links";
import { DISCLOSURE_ROOM_SEARCH_ALIASES } from "@/lib/content/disclosure-room";
import { PUBLIC_MESSAGE_TEMPLATE_WHERE } from "@/lib/public/message-templates";
import { PUBLIC_CATEGORY_LABEL } from "@/lib/public/knowledge-display";
import { publicDisclosureCategoryLabels } from "@/lib/public/disclosure-display";
import { categoryLabels as claimCategoryLabels } from "@/lib/claim-documents/category-labels";
import { CATEGORY_LABELS as insurerCategoryLabels } from "@/lib/directory/formatting";
import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findProhibitedPhrase } from "@/lib/message-template/safety";
import {
  SEARCH_MAX_PER_DOMAIN,
  SEARCH_MAX_TOTAL_RESULTS,
} from "./constants";
import { validatePublicSearchQuery } from "./query-validation";
import { rankSearchResults } from "./ranking";
import { dedupeSearchResultsByLinkIdentity } from "./search-url-canonicalization";
import { searchWorkLinks } from "./work-links-search";
import { withSearchVerification } from "./search-verification-status";
import {
  SEARCH_DOMAIN_LABEL,
} from "./labels";
import type {
  GlobalSearchQueryInput,
  GlobalSearchQueryResult,
  GlobalSearchResult,
  PublicSearchDomain,
} from "./types";

const MESSAGE_CATEGORY_LABEL: Record<MessageTemplateCategory, string> = {
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

const MESSAGE_CHANNEL_LABEL: Record<MessageTemplateChannel, string> = {
  kakao: "카카오톡",
  sms: "문자",
  phone_script: "전화",
  email: "이메일",
  blog: "블로그",
  threads: "스레드",
  instagram: "인스타",
  general: "일반",
};

const MESSAGE_AUDIENCE_LABEL: Record<MessageTemplateAudienceType, string> = {
  new_customer: "신규 고객",
  existing_customer: "기존 고객",
  dormant_customer: "휴면 고객",
  claim_customer: "청구 고객",
  cancellation_risk: "해지 고민",
  referral: "소개",
  general: "일반",
};

function truncateSummary(text: string | null | undefined, max = 160): string {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

function toIsoDate(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.toISOString().slice(0, 10);
}

async function searchInsurers(
  query: string,
  limit: number,
): Promise<GlobalSearchResult[]> {
  const records = await prisma.insurer.findMany({
    where: {
      isPublished: true,
      verificationStatus: { in: [...PUBLIC_VERIFICATION_STATUSES] },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { cardPaymentNote: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      updatedAt: true,
      lastVerifiedAt: true,
    },
  });

  const results: GlobalSearchResult[] = records.map((row) => withSearchVerification({
    id: row.id,
    type: "insurer",
    title: row.name,
    summary: insurerCategoryLabels[row.category],
    url: `/directory?search=${encodeURIComponent(row.name)}`,
    categoryLabel: insurerCategoryLabels[row.category],
    updatedAt: toIsoDate(row.updatedAt),
    publishedAt: toIsoDate(row.lastVerifiedAt),
    lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
  }, row.lastVerifiedAt));

  return dedupeSearchResultsByLinkIdentity(results, (result) => ({
    insurerKey: getCanonicalPublicInsurerId(result.id),
    action: "insurer",
    url: result.url,
  }));
}

async function searchClaimDocuments(
  query: string,
  limit: number,
): Promise<GlobalSearchResult[]> {
  const records = await prisma.claimDocument.findMany({
    where: {
      isPublished: true,
      verificationStatus: { in: [...PUBLIC_VERIFICATION_STATUSES] },
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { requiredDocuments: { contains: query, mode: "insensitive" } },
        { optionalDocuments: { contains: query, mode: "insensitive" } },
        { customerMessageTemplate: { contains: query, mode: "insensitive" } },
        { cautionNote: { contains: query, mode: "insensitive" } },
        { insurer: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    take: limit,
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      category: true,
      updatedAt: true,
      lastVerifiedAt: true,
      insurer: { select: { name: true } },
    },
  });

  return records.map((row) => withSearchVerification({
    id: row.id,
    type: "claim_document",
    title: row.title,
    summary: truncateSummary(
      [row.summary, row.insurer?.name].filter(Boolean).join(" · "),
    ),
    url: "/claim-documents",
    categoryLabel: claimCategoryLabels[row.category],
    sourceLabel: row.insurer?.name ?? undefined,
    updatedAt: toIsoDate(row.updatedAt),
    publishedAt: toIsoDate(row.lastVerifiedAt),
    lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
  }, row.lastVerifiedAt));
}

async function searchKnowledgeArticles(
  query: string,
  limit: number,
): Promise<GlobalSearchResult[]> {
  const records = await prisma.knowledgeArticle.findMany({
    where: {
      ...PUBLIC_KNOWLEDGE_WHERE,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { workflowLabel: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      category: true,
      updatedAt: true,
      publishedAt: true,
      sourceCheckedAt: true,
    },
  });

  return records.map((row) => withSearchVerification({
    id: row.id,
    type: "knowledge_article",
    title: row.title,
    summary: truncateSummary(row.summary),
    url: `/knowledge/${encodeURIComponent(row.slug)}`,
    categoryLabel: PUBLIC_CATEGORY_LABEL[row.category],
    updatedAt: toIsoDate(row.updatedAt),
    publishedAt: toIsoDate(row.publishedAt),
    lastVerifiedAt: toIsoDate(row.sourceCheckedAt),
  }, row.sourceCheckedAt));
}

async function searchDisclosureLinks(
  query: string,
  limit: number,
): Promise<GlobalSearchResult[]> {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const aliasMatchesRoom = DISCLOSURE_ROOM_SEARCH_ALIASES.some((alias) =>
    normalizedQuery.includes(alias.toLocaleLowerCase("ko-KR")),
  );
  const searchTerms = aliasMatchesRoom
    ? Array.from(new Set([query, "공시실", "공시"]))
    : [query];

  const records = await prisma.disclosureLink.findMany({
    where: {
      ...PUBLIC_DISCLOSURE_LINK_WHERE,
      OR: searchTerms.flatMap((term) => [
        { title: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
        { sourceName: { contains: term, mode: "insensitive" as const } },
        { insurer: { name: { contains: term, mode: "insensitive" as const } } },
      ]),
    },
    take: limit,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      sourceName: true,
      updatedAt: true,
      publishedAt: true,
      lastVerifiedAt: true,
      insurer: { select: { name: true } },
    },
  });

  return records.map((row) => withSearchVerification({
    id: row.id,
    type: "disclosure_link",
    title: row.title,
    summary: truncateSummary(row.description),
    url: "/disclosure-links",
    categoryLabel: publicDisclosureCategoryLabels[row.category],
    sourceLabel: row.sourceName ?? row.insurer?.name ?? undefined,
    updatedAt: toIsoDate(row.updatedAt),
    publishedAt: toIsoDate(row.publishedAt),
    lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
  }, row.lastVerifiedAt));
}

async function searchMessageTemplates(
  query: string,
  limit: number,
): Promise<GlobalSearchResult[]> {
  const records = await prisma.messageTemplate.findMany({
    where: {
      ...PUBLIC_MESSAGE_TEMPLATE_WHERE,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { safeCopy: { contains: query, mode: "insensitive" } },
        { useCase: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      safeCopy: true,
      category: true,
      channel: true,
      audienceType: true,
      updatedAt: true,
      publishedAt: true,
      reviewedAt: true,
    },
  });

  const results: GlobalSearchResult[] = [];

  for (const row of records) {
    const safeCopy = row.safeCopy?.trim();
    if (!safeCopy || findProhibitedPhrase(safeCopy)) continue;

    results.push(withSearchVerification({
      id: row.id,
      type: "message_template",
      title: row.title,
      summary: truncateSummary(safeCopy),
      url: "/message-templates",
      categoryLabel: [
        MESSAGE_CATEGORY_LABEL[row.category],
        MESSAGE_CHANNEL_LABEL[row.channel],
        MESSAGE_AUDIENCE_LABEL[row.audienceType],
      ].join(" · "),
      updatedAt: toIsoDate(row.updatedAt),
      publishedAt: toIsoDate(row.publishedAt),
      lastVerifiedAt: toIsoDate(row.reviewedAt),
    }, row.reviewedAt));

    if (results.length >= limit) break;
  }

  return results;
}

const DOMAIN_SEARCHERS: Record<
  Exclude<PublicSearchDomain, "all">,
  (query: string, limit: number) => Promise<GlobalSearchResult[]>
> = {
  insurer: searchInsurers,
  claim_document: searchClaimDocuments,
  knowledge_article: searchKnowledgeArticles,
  disclosure_link: searchDisclosureLinks,
  message_template: searchMessageTemplates,
  work_link: searchWorkLinks,
};

function shouldSearchDomain(
  domain: PublicSearchDomain,
  target: Exclude<PublicSearchDomain, "all">,
): boolean {
  return domain === "all" || domain === target;
}

/**
 * Public global search. Never queries CorrectionRequest or admin-only fields.
 */
export async function searchPublicContent(
  input: GlobalSearchQueryInput,
): Promise<GlobalSearchQueryResult> {
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

  if (!process.env.DATABASE_URL?.trim()) {
    return { ok: true, results: [], total: 0 };
  }

  try {
    const perDomainLimit =
      domain === "all"
        ? SEARCH_MAX_PER_DOMAIN
        : Math.min(SEARCH_MAX_TOTAL_RESULTS, SEARCH_MAX_PER_DOMAIN * 2);

    const buckets: GlobalSearchResult[] = [];

    const targets = Object.keys(DOMAIN_SEARCHERS) as Exclude<
      PublicSearchDomain,
      "all"
    >[];

    await Promise.all(
      targets.map(async (target) => {
        if (!shouldSearchDomain(domain, target)) return;
        const rows = await DOMAIN_SEARCHERS[target](query, perDomainLimit);
        buckets.push(...rows);
      }),
    );

    const ranked = rankSearchResults(buckets, query).slice(
      0,
      SEARCH_MAX_TOTAL_RESULTS,
    );

    return { ok: true, results: ranked, total: ranked.length };
  } catch {
    console.warn("[plannerdesk] searchPublicContent failed.");
    return { ok: true, results: [], total: 0 };
  }
}

export { SEARCH_DOMAIN_LABEL };
