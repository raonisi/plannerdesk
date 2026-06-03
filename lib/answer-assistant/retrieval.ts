// Answer Assistant retrieval execution (PR-94).

import { PUBLIC_VERIFICATION_STATUSES } from "@/lib/public/insurers";
import { PUBLIC_DISCLOSURE_LINK_WHERE } from "@/lib/public/disclosure-links";
import { PUBLIC_MESSAGE_TEMPLATE_WHERE } from "@/lib/public/message-templates";
import { PUBLIC_CATEGORY_LABEL } from "@/lib/public/knowledge-display";
import { publicDisclosureCategoryLabels } from "@/lib/public/disclosure-display";
import { categoryLabels as claimCategoryLabels } from "@/lib/claim-documents/category-labels";
import { CATEGORY_LABELS as insurerCategoryLabels } from "@/lib/directory/formatting";
import { findProhibitedPhrase as findMessageTemplateProhibitedPhrase } from "@/lib/message-template/safety";
import { isValidAdminUrl } from "@/lib/validators/disclosure-link";
import { prisma } from "@/lib/prisma";
import {
  ANSWER_ASSIST_MAX_CANDIDATES,
  ANSWER_ASSIST_MAX_PER_DOMAIN,
  INSUFFICIENT_EVIDENCE_MESSAGE,
} from "./constants";
import { purposeRequiresOfficialCheck } from "./labels";
import { ANSWER_ASSIST_KNOWLEDGE_WHERE } from "./retrieval-where";
import {
  RETRIEVAL_SOURCE_PRIORITY,
  type RetrievalCandidate,
  type RetrievalQueryInput,
  type RetrievalQueryResult,
  type RetrievalSourceType,
} from "./retrieval-types";
import type { AnswerAssistantPurpose } from "./types";
import type { AnswerAssistantEvidenceItem } from "./types";

function toIsoDate(value: Date | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.toISOString().slice(0, 10);
}

function truncateText(text: string | null | undefined, max = 240): string {
  if (!text) return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

function compareCandidates(a: RetrievalCandidate, b: RetrievalCandidate): number {
  if (a.priority !== b.priority) return a.priority - b.priority;
  const aDate =
    a.reviewedAt ?? a.lastVerifiedAt ?? a.updatedAt ?? "";
  const bDate =
    b.reviewedAt ?? b.lastVerifiedAt ?? b.updatedAt ?? "";
  return bDate.localeCompare(aDate);
}

function limitPerDomain(
  candidates: RetrievalCandidate[],
  maxTotal: number,
): RetrievalCandidate[] {
  const counts = new Map<RetrievalSourceType, number>();
  const selected: RetrievalCandidate[] = [];

  for (const candidate of candidates) {
    const count = counts.get(candidate.type) ?? 0;
    if (count >= ANSWER_ASSIST_MAX_PER_DOMAIN) continue;
    selected.push(candidate);
    counts.set(candidate.type, count + 1);
    if (selected.length >= maxTotal) break;
  }

  return selected;
}

async function searchKnowledgeArticles(
  query: string,
  limit: number,
): Promise<RetrievalCandidate[]> {
  const records = await prisma.knowledgeArticle.findMany({
    where: {
      ...ANSWER_ASSIST_KNOWLEDGE_WHERE,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { safeCopy: { contains: query, mode: "insensitive" } },
        { workflowLabel: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ],
    },
    take: limit,
    orderBy: [{ updatedAt: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      summary: true,
      safeCopy: true,
      category: true,
      sourceTitle: true,
      sourceUrl: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  return records.map((row) => ({
    id: row.id,
    type: "knowledge_article" as const,
    title: row.title,
    summary: truncateText(row.summary),
    safeText: truncateText(row.safeCopy ?? row.summary),
    sourceName: row.sourceTitle ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    categoryLabel: PUBLIC_CATEGORY_LABEL[row.category],
    priority: RETRIEVAL_SOURCE_PRIORITY.knowledge_article_verified,
    updatedAt: toIsoDate(row.updatedAt),
    reviewedAt: toIsoDate(row.publishedAt),
    isOfficialSource: Boolean(row.sourceUrl),
  }));
}

async function searchDisclosureLinks(
  query: string,
  limit: number,
): Promise<RetrievalCandidate[]> {
  const records = await prisma.disclosureLink.findMany({
    where: {
      ...PUBLIC_DISCLOSURE_LINK_WHERE,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { sourceName: { contains: query, mode: "insensitive" } },
        { insurer: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    take: limit,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      category: true,
      sourceName: true,
      isOfficialSource: true,
      lastVerifiedAt: true,
      updatedAt: true,
      reviewedAt: true,
      insurer: { select: { name: true } },
    },
  });

  const candidates: RetrievalCandidate[] = [];

  for (const row of records) {
    const url = row.url?.trim();
    if (!url || !isValidAdminUrl(url)) continue;

    candidates.push({
      id: row.id,
      type: "disclosure_link",
      title: row.title,
      summary: truncateText(row.description),
      safeText: truncateText(row.description),
      sourceName: row.sourceName ?? row.insurer?.name ?? undefined,
      sourceUrl: url,
      categoryLabel: publicDisclosureCategoryLabels[row.category],
      priority: row.isOfficialSource
        ? RETRIEVAL_SOURCE_PRIORITY.disclosure_link_official
        : RETRIEVAL_SOURCE_PRIORITY.disclosure_link,
      updatedAt: toIsoDate(row.updatedAt),
      reviewedAt: toIsoDate(row.reviewedAt),
      lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
      isOfficialSource: row.isOfficialSource,
    });
  }

  return candidates;
}

async function searchMessageTemplates(
  query: string,
  limit: number,
): Promise<RetrievalCandidate[]> {
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
    take: limit * 2,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      safeCopy: true,
      category: true,
      channel: true,
      audienceType: true,
      useCase: true,
      tone: true,
      updatedAt: true,
      reviewedAt: true,
    },
  });

  const candidates: RetrievalCandidate[] = [];

  for (const row of records) {
    const safeCopy = row.safeCopy?.trim();
    if (!safeCopy) continue;
    if (findMessageTemplateProhibitedPhrase(safeCopy)) continue;

    candidates.push({
      id: row.id,
      type: "message_template",
      title: row.title,
      summary: truncateText(row.description),
      safeText: truncateText(safeCopy),
      categoryLabel: row.useCase || row.category,
      priority: RETRIEVAL_SOURCE_PRIORITY.message_template_safe_copy,
      updatedAt: toIsoDate(row.updatedAt),
      reviewedAt: toIsoDate(row.reviewedAt),
    });

    if (candidates.length >= limit) break;
  }

  return candidates;
}

async function searchInsurers(
  query: string,
  limit: number,
): Promise<RetrievalCandidate[]> {
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
      officialWebsiteUrl: true,
      claimPageUrl: true,
      termsUrl: true,
      customerCenterPhone: true,
      updatedAt: true,
      lastVerifiedAt: true,
    },
  });

  return records.map((row) => {
    const officialUrl =
      row.termsUrl ?? row.claimPageUrl ?? row.officialWebsiteUrl ?? undefined;
    const summaryParts = [
      insurerCategoryLabels[row.category],
      row.customerCenterPhone ? `고객센터 ${row.customerCenterPhone}` : null,
    ].filter(Boolean);

    return {
      id: row.id,
      type: "insurer" as const,
      title: row.name,
      summary: summaryParts.join(" · "),
      safeText: summaryParts.join(" · "),
      sourceUrl: officialUrl,
      sourceName: row.name,
      categoryLabel: insurerCategoryLabels[row.category],
      priority: officialUrl
        ? RETRIEVAL_SOURCE_PRIORITY.insurer_official_url
        : RETRIEVAL_SOURCE_PRIORITY.insurer,
      updatedAt: toIsoDate(row.updatedAt),
      lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
      isOfficialSource: Boolean(officialUrl),
    };
  });
}

async function searchClaimDocuments(
  query: string,
  limit: number,
): Promise<RetrievalCandidate[]> {
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
      summary: true,
      category: true,
      officialSourceUrl: true,
      claimFormUrl: true,
      cautionNote: true,
      updatedAt: true,
      lastVerifiedAt: true,
      insurer: { select: { name: true } },
    },
  });

  return records.map((row) => {
    const sourceUrl = row.officialSourceUrl ?? row.claimFormUrl ?? undefined;
    return {
      id: row.id,
      type: "claim_document" as const,
      title: row.title,
      summary: truncateText(
        [row.summary, row.insurer?.name].filter(Boolean).join(" · "),
      ),
      safeText: truncateText(
        [row.summary, row.cautionNote].filter(Boolean).join(" "),
      ),
      sourceName: row.insurer?.name ?? undefined,
      sourceUrl,
      categoryLabel: claimCategoryLabels[row.category],
      priority: RETRIEVAL_SOURCE_PRIORITY.claim_document,
      updatedAt: toIsoDate(row.updatedAt),
      lastVerifiedAt: toIsoDate(row.lastVerifiedAt),
      isOfficialSource: Boolean(sourceUrl),
    };
  });
}

const DOMAIN_SEARCHERS: Record<
  RetrievalSourceType,
  (query: string, limit: number) => Promise<RetrievalCandidate[]>
> = {
  knowledge_article: searchKnowledgeArticles,
  disclosure_link: searchDisclosureLinks,
  message_template: searchMessageTemplates,
  insurer: searchInsurers,
  claim_document: searchClaimDocuments,
};

function hasOfficialCandidate(candidates: RetrievalCandidate[]): boolean {
  return candidates.some(
    (candidate) =>
      candidate.isOfficialSource ||
      candidate.type === "disclosure_link" ||
      (candidate.type === "insurer" && Boolean(candidate.sourceUrl)),
  );
}

function hasFactualCandidate(candidates: RetrievalCandidate[]): boolean {
  return candidates.some(
    (candidate) =>
      candidate.type === "knowledge_article" ||
      candidate.type === "disclosure_link" ||
      candidate.type === "claim_document" ||
      (candidate.type === "insurer" && Boolean(candidate.sourceUrl)),
  );
}

function assessEvidencePolicy(
  candidates: RetrievalCandidate[],
  purpose: AnswerAssistantPurpose,
  requiresOfficialCheck: boolean,
): { needsOfficialCheck: boolean; insufficientEvidence: boolean } {
  if (candidates.length === 0) {
    return { needsOfficialCheck: true, insufficientEvidence: true };
  }

  const officialRequired =
    requiresOfficialCheck || purposeRequiresOfficialCheck(purpose);
  const hasOfficial = hasOfficialCandidate(candidates);
  const hasFactual = hasFactualCandidate(candidates);
  const onlyTemplates = candidates.every(
    (candidate) => candidate.type === "message_template",
  );

  let needsOfficialCheck = false;
  let insufficientEvidence = false;

  if (officialRequired && !hasOfficial) {
    needsOfficialCheck = true;
    insufficientEvidence = true;
  }

  if (
    onlyTemplates &&
    (purpose === "GENERAL_EXPLANATION" ||
      purpose === "KNOWLEDGE_SUMMARY" ||
      purpose === "DISCLOSURE_GUIDE")
  ) {
    needsOfficialCheck = true;
    insufficientEvidence = true;
  }

  if (purpose === "DISCLOSURE_GUIDE" && !hasOfficial) {
    needsOfficialCheck = true;
    insufficientEvidence = true;
  }

  if (purpose === "KNOWLEDGE_SUMMARY" && !hasFactual) {
    insufficientEvidence = true;
  }

  if (
    purpose === "CLAIM_DOCUMENT_GUIDE" &&
    !candidates.some((candidate) => candidate.type === "claim_document")
  ) {
    insufficientEvidence = true;
  }

  return { needsOfficialCheck, insufficientEvidence };
}

export async function retrieveAnswerCandidates(
  input: RetrievalQueryInput,
): Promise<RetrievalQueryResult> {
  if (input.audience !== "admin" && input.audience !== "verified_planner") {
    return {
      ok: false,
      allowed: false,
      blockedReason: "unauthorized",
      blockedMessage: "답변 보조 기능을 사용할 권한이 없습니다.",
      candidates: [],
    };
  }

  const query = input.query.trim();
  const limit = input.limit ?? ANSWER_ASSIST_MAX_CANDIDATES;
  const perDomainLimit = Math.min(ANSWER_ASSIST_MAX_PER_DOMAIN, limit);

  const domains: RetrievalSourceType[] =
    input.domain && input.domain !== "all"
      ? [input.domain]
      : [
          "disclosure_link",
          "knowledge_article",
          "message_template",
          "claim_document",
          "insurer",
        ];

  const batches = await Promise.all(
    domains.map((domain) => DOMAIN_SEARCHERS[domain](query, perDomainLimit)),
  );

  const merged = batches.flat().sort(compareCandidates);
  const candidates = limitPerDomain(merged, limit);

  const purpose = input.purpose ?? "GENERAL_EXPLANATION";
  const requiresOfficialCheck = Boolean(input.requiresOfficialCheck);
  const policy = assessEvidencePolicy(
    candidates,
    purpose,
    requiresOfficialCheck,
  );

  return {
    ok: true,
    allowed: true,
    candidates,
    needsOfficialCheck: policy.needsOfficialCheck,
    insufficientEvidence: policy.insufficientEvidence,
    blockedMessage: policy.insufficientEvidence
      ? INSUFFICIENT_EVIDENCE_MESSAGE
      : undefined,
  };
}

export function toEvidenceItems(
  candidates: RetrievalCandidate[],
): AnswerAssistantEvidenceItem[] {
  return candidates.map((candidate) => ({
    id: candidate.id,
    type: candidate.type,
    title: candidate.title,
    summary: candidate.summary,
    safeTextSummary: candidate.safeText ?? candidate.summary,
    sourceName: candidate.sourceName,
    sourceUrl: candidate.sourceUrl,
    categoryLabel: candidate.categoryLabel,
    isOfficialSource: candidate.isOfficialSource,
    reviewedAt: candidate.reviewedAt,
    lastVerifiedAt: candidate.lastVerifiedAt,
    updatedAt: candidate.updatedAt,
    needsOfficialConfirmation:
      !candidate.isOfficialSource &&
      (candidate.type === "knowledge_article" ||
        candidate.type === "claim_document" ||
        Boolean(candidate.sourceUrl)),
  }));
}
