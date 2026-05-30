import { KnowledgeArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  knowledgeStarterDrafts,
  type KnowledgeStarterDraft,
} from "@/lib/content/knowledge-starter-drafts";
import { isValidSlug } from "@/lib/validators/knowledge-article";

const REQUIRED_FIELDS = [
  "title",
  "slug",
  "summary",
  "category",
  "type",
  "riskLevel",
  "content",
  "safeCopy",
  "forbiddenClaims",
] as const;

const FORCED_STATUS = KnowledgeArticleStatus.draft;
const FORCED_PUBLISHED = false;
const FORCED_AI_USABLE = false;

export type StarterDraftValidationIssue = {
  slug: string;
  reason: string;
};

export type StarterImportPreviewResult = {
  ok: true;
  totalDocuments: number;
  readyToCreate: number;
  duplicateSlugCount: number;
  invalidCount: number;
  invalidReasons: StarterDraftValidationIssue[];
  duplicateSlugs: string[];
  allStatusDraft: boolean;
  allIsPublishedFalse: boolean;
  allAiUsableFalse: boolean;
};

export type StarterImportApplyResult = {
  ok: true;
  requested: number;
  created: number;
  skippedExistingSlug: number;
  failed: number;
  failures: StarterDraftValidationIssue[];
};

export type StarterImportError = { ok: false; message: string };

function validateDraft(draft: KnowledgeStarterDraft): StarterDraftValidationIssue | null {
  for (const field of REQUIRED_FIELDS) {
    const value = draft[field];
    if (field === "forbiddenClaims") {
      if (!Array.isArray(value) || value.length < 3) {
        return {
          slug: draft.slug || "(missing slug)",
          reason: "forbiddenClaims는 3개 이상 필요합니다.",
        };
      }
      continue;
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      return {
        slug: draft.slug || "(missing slug)",
        reason: `필수 필드 누락: ${field}`,
      };
    }
  }

  if (!isValidSlug(draft.slug)) {
    return { slug: draft.slug, reason: "슬러그 형식이 올바르지 않습니다." };
  }

  return null;
}

export function toForcedCreatePayload(draft: KnowledgeStarterDraft) {
  return {
    slug: draft.slug,
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    category: draft.category,
    type: draft.type,
    riskLevel: draft.riskLevel,
    status: FORCED_STATUS,
    isPublished: FORCED_PUBLISHED,
    aiUsable: FORCED_AI_USABLE,
    sourceType: draft.sourceType,
    sourceTitle: draft.sourceTitle,
    sourceUrl: draft.sourceUrl,
    sourceCheckedAt: null,
    workflowLabel: draft.workflowLabel,
    tags: draft.tags,
    safeCopy: draft.safeCopy,
    forbiddenClaims: draft.forbiddenClaims,
    publishedAt: null,
  };
}

function analyzeStarterData(existingSlugs: Set<string>) {
  const invalid: StarterDraftValidationIssue[] = [];
  const duplicateSlugs: string[] = [];
  let readyToCreate = 0;

  for (const draft of knowledgeStarterDrafts) {
    const issue = validateDraft(draft);
    if (issue) {
      invalid.push(issue);
      continue;
    }
    if (existingSlugs.has(draft.slug)) {
      duplicateSlugs.push(draft.slug);
      continue;
    }
    readyToCreate += 1;
  }

  const allStatusDraft = knowledgeStarterDrafts.every(
    (d) => (d.status as KnowledgeArticleStatus) === FORCED_STATUS,
  );
  const allIsPublishedFalse = knowledgeStarterDrafts.every((d) => !d.isPublished);
  const allAiUsableFalse = knowledgeStarterDrafts.every((d) => !d.aiUsable);

  return {
    invalid,
    duplicateSlugs,
    readyToCreate,
    allStatusDraft,
    allIsPublishedFalse,
    allAiUsableFalse,
  };
}

export async function previewKnowledgeStarterDrafts(): Promise<
  StarterImportPreviewResult | StarterImportError
> {
  const slugs = knowledgeStarterDrafts.map((d) => d.slug);
  const duplicateInFile = slugs.filter((slug, i) => slugs.indexOf(slug) !== i);
  if (duplicateInFile.length > 0) {
    return {
      ok: false,
      message: `starter 데이터 내 슬러그 중복: ${[...new Set(duplicateInFile)].join(", ")}`,
    };
  }

  let existingSlugs = new Set<string>();
  try {
    const rows = await prisma.knowledgeArticle.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    });
    existingSlugs = new Set(rows.map((r) => r.slug));
  } catch {
    return { ok: false, message: "DB 연결 없이 미리보기를 완료할 수 없습니다." };
  }

  const analysis = analyzeStarterData(existingSlugs);

  return {
    ok: true,
    totalDocuments: knowledgeStarterDrafts.length,
    readyToCreate: analysis.readyToCreate,
    duplicateSlugCount: analysis.duplicateSlugs.length,
    invalidCount: analysis.invalid.length,
    invalidReasons: analysis.invalid,
    duplicateSlugs: analysis.duplicateSlugs,
    allStatusDraft: analysis.allStatusDraft,
    allIsPublishedFalse: analysis.allIsPublishedFalse,
    allAiUsableFalse: analysis.allAiUsableFalse,
  };
}

export async function importKnowledgeStarterDrafts(
  userId: string | null,
): Promise<StarterImportApplyResult | StarterImportError> {
  const preview = await previewKnowledgeStarterDrafts();
  if (!preview.ok) return preview;

  const slugs = knowledgeStarterDrafts.map((d) => d.slug);
  const existingRows = await prisma.knowledgeArticle.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  });
  const existingSlugs = new Set(existingRows.map((r) => r.slug));

  let created = 0;
  let skippedExistingSlug = 0;
  let failed = 0;
  const failures: StarterDraftValidationIssue[] = [];

  for (const draft of knowledgeStarterDrafts) {
    const issue = validateDraft(draft);
    if (issue) {
      failed += 1;
      failures.push(issue);
      continue;
    }
    if (existingSlugs.has(draft.slug)) {
      skippedExistingSlug += 1;
      continue;
    }

    try {
      await prisma.knowledgeArticle.create({
        data: {
          ...toForcedCreatePayload(draft),
          createdById: userId,
          updatedById: userId,
        },
      });
      created += 1;
      existingSlugs.add(draft.slug);
    } catch {
      failed += 1;
      failures.push({
        slug: draft.slug,
        reason: "DB 저장 실패",
      });
    }
  }

  return {
    ok: true,
    requested: knowledgeStarterDrafts.length,
    created,
    skippedExistingSlug,
    failed,
    failures,
  };
}
